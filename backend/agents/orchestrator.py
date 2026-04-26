"""
🧠 AI Agent: Orchestrator
The central meta-agent for the UCAR Intelligence Hub.

Responsibilities:
  - Decides which sub-agents to invoke based on current data state (agentic behavior).
  - Controls 3 multi-step pipelines:
      1. Post-Upload Pipeline (triggered by data_uploaded event)
      2. Deep Institution Analysis (on-demand via API)
      3. Network-Wide Briefing (cross-institution summary)
  - Aggregates and returns unified results from all sub-agents.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from supabase._async.client import AsyncClient

logger = logging.getLogger(__name__)

# ── Available agent names the orchestrator can dispatch ──────────
AVAILABLE_AGENTS = [
    "anomaly_reasoner",
    "risk_forecaster",
    "pulse_writer",
    "report_writer",
]


class AgentOrchestrator:
    """
    Central orchestrator that coordinates all UCAR AI agents.
    Uses Mistral to decide which agents to run before executing them.
    """

    # ── Internal: AI-driven agent selection ─────────────────────

    async def _decide_agents(
        self,
        institution_name: str,
        kpi_summary: Dict[str, Any],
        alerts_count: int,
        history_points: int,
    ) -> List[str]:
        """
        Ask Mistral which agents are relevant given the current data state.
        Returns a list of agent names to run.
        """
        from core.llm import call_llm

        prompt = f"""
Tu es le coordinateur d'un système d'intelligence universitaire.
Voici l'état actuel des données pour l'établissement '{institution_name}':

- Nombre d'indicateurs KPI disponibles : {len(kpi_summary)}
- Nombre d'alertes actives : {alerts_count}
- Nombre de points historiques disponibles pour la prévision : {history_points}
- Aperçu des KPIs : {json.dumps(kpi_summary, ensure_ascii=False)[:500]}

Agents disponibles : {AVAILABLE_AGENTS}

Décide quels agents il faut exécuter pour fournir une analyse pertinente.
Ne propose que les agents réellement utiles. Par exemple :
- "risk_forecaster" nécessite au moins 2 points historiques.
- "anomaly_reasoner" est utile uniquement s'il y a des alertes actives.
- "pulse_writer" est toujours utile s'il y a des KPIs.
- "report_writer" est lourd — ne le sélectionne que si demandé explicitement ou si beaucoup de KPIs.

Retourne UNIQUEMENT un JSON valide avec ce format exact :
{{
    "agents": ["pulse_writer", "anomaly_reasoner"],
    "reason": "Explication courte en français de ton choix."
}}
"""
        try:
            response = await call_llm(prompt, temperature=0.1)
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3].strip()
            decision = json.loads(cleaned)
            agents = [a for a in decision.get("agents", []) if a in AVAILABLE_AGENTS]
            logger.info(f"[Orchestrator] Agent plan for {institution_name}: {agents} — {decision.get('reason', '')}")
            return agents
        except Exception as e:
            logger.warning(f"[Orchestrator] Agent decision failed ({e}), using default plan.")
            # Safe default: always run pulse + anomaly if alerts exist
            default = ["pulse_writer"]
            if alerts_count > 0:
                default.append("anomaly_reasoner")
            if history_points >= 2:
                default.append("risk_forecaster")
            return default

    # ── Internal: data fetching helpers ─────────────────────────

    async def _fetch_institution_kpis(
        self, db: AsyncClient, institution_id: int
    ) -> Dict[str, Any]:
        """Fetch latest KPI values as a flat {metric_code: value} dict."""
        resp = await db.table("fact_kpis")\
            .select("value, dim_metric(code, name)")\
            .eq("institution_id", institution_id)\
            .limit(30)\
            .execute()
        kpis = {}
        for row in resp.data:
            metric = row.get("dim_metric") or {}
            if metric.get("code"):
                kpis[metric["code"]] = row.get("value")
        return kpis

    async def _fetch_active_alerts(
        self, db: AsyncClient, institution_id: int
    ) -> List[Dict]:
        """Fetch unresolved alerts for an institution."""
        resp = await db.table("alerts")\
            .select("*, dim_metric(code)")\
            .eq("institution_id", institution_id)\
            .eq("resolved", False)\
            .limit(10)\
            .execute()
        return resp.data or []

    async def _fetch_history_count(
        self, db: AsyncClient, institution_id: int
    ) -> int:
        """Return how many historical KPI data points exist for the institution."""
        resp = await db.table("fact_kpis")\
            .select("id")\
            .eq("institution_id", institution_id)\
            .execute()
        return len(resp.data or [])

    # ── PIPELINE 1: Post-Upload Intelligence ────────────────────

    async def run_post_upload_pipeline(
        self,
        institution_id: int,
        uploaded_data: Dict[str, Any],
        db: AsyncClient,
    ) -> Dict[str, Any]:
        """
        Triggered automatically after a file upload.
        Runs a fast, focused pipeline: anomaly check + pulse briefing.
        Results are returned for WebSocket broadcast.
        """
        logger.info(f"[Orchestrator] ▶ Post-Upload Pipeline for institution {institution_id}")

        # Fetch state
        kpis = await self._fetch_institution_kpis(db, institution_id)
        alerts = await self._fetch_active_alerts(db, institution_id)
        history_count = await self._fetch_history_count(db, institution_id)

        # Fetch institution name
        inst_resp = await db.table("dim_institution").select("name").eq("id", institution_id).execute()
        institution_name = inst_resp.data[0]["name"] if inst_resp.data else f"Institution {institution_id}"

        # AI decides which agents to run
        agents_to_run = await self._decide_agents(institution_name, kpis, len(alerts), history_count)

        results: Dict[str, Any] = {
            "pipeline": "post_upload",
            "institution_id": institution_id,
            "institution_name": institution_name,
            "agents_run": agents_to_run,
            "uploaded_file": uploaded_data.get("filename", ""),
        }

        # Run pulse writer
        if "pulse_writer" in agents_to_run and kpis:
            from agents.pulse_writer import generate_pulse
            results["pulse"] = await generate_pulse(institution_name, kpis)

        # Run anomaly reasoner for each active alert
        if "anomaly_reasoner" in agents_to_run and alerts:
            from agents.anomaly_reasoner import reason_anomaly
            explained_alerts = []
            for alert in alerts[:3]:  # cap at 3 per pipeline run
                metric_code = (alert.get("dim_metric") or {}).get("code", "UNKNOWN")
                explanation = await reason_anomaly(
                    institution=institution_name,
                    kpi_key=metric_code,
                    value=float(alert.get("value") or 0),
                    threshold=float(alert.get("threshold") or 0),
                    peer_avg=float(alert.get("threshold") or 0) * 0.85,
                )
                explained_alerts.append({
                    "alert_id": alert.get("id"),
                    "metric_code": metric_code,
                    **explanation,
                })
                # Persist explanation back into the alert row
                update_q = db.table("alerts").update({
                    "explanation": explanation.get("explanation", ""),
                    "recommended_action": explanation.get("suggestion", ""),
                }).eq("id", alert["id"])
                await update_q.execute()
            results["anomalies"] = explained_alerts

        logger.info(f"[Orchestrator] ✅ Post-Upload Pipeline complete for {institution_name}")
        return results

    # ── PIPELINE 2: Deep Institution Analysis ────────────────────

    async def run_deep_analysis(
        self,
        institution_id: int,
        db: AsyncClient,
        include_report: bool = False,
    ) -> Dict[str, Any]:
        """
        On-demand comprehensive analysis of a single institution.
        Runs: Pulse + Anomaly Reasoner + Risk Forecaster + (optionally) Report Writer.
        """
        logger.info(f"[Orchestrator] ▶ Deep Analysis Pipeline for institution {institution_id}")

        # Fetch state
        kpis = await self._fetch_institution_kpis(db, institution_id)
        alerts = await self._fetch_active_alerts(db, institution_id)
        history_count = await self._fetch_history_count(db, institution_id)

        inst_resp = await db.table("dim_institution").select("name, code").eq("id", institution_id).execute()
        if not inst_resp.data:
            raise ValueError(f"Institution {institution_id} not found")
        institution_name = inst_resp.data[0]["name"]

        # Force include report writer if requested, then let AI decide the rest
        forced = ["report_writer"] if include_report else []
        agents_to_run = await self._decide_agents(institution_name, kpis, len(alerts), history_count)
        agents_to_run = list(set(agents_to_run + forced))

        results: Dict[str, Any] = {
            "pipeline": "deep_analysis",
            "institution_id": institution_id,
            "institution_name": institution_name,
            "agents_run": agents_to_run,
            "kpi_snapshot": kpis,
        }

        # Pulse Writer
        if "pulse_writer" in agents_to_run and kpis:
            from agents.pulse_writer import generate_pulse
            results["pulse"] = await generate_pulse(institution_name, kpis)

        # Anomaly Reasoner
        if "anomaly_reasoner" in agents_to_run and alerts:
            from agents.anomaly_reasoner import reason_anomaly
            explained = []
            for alert in alerts[:5]:
                metric_code = (alert.get("dim_metric") or {}).get("code", "UNKNOWN")
                expl = await reason_anomaly(
                    institution=institution_name,
                    kpi_key=metric_code,
                    value=float(alert.get("value") or 0),
                    threshold=float(alert.get("threshold") or 0),
                    peer_avg=float(alert.get("threshold") or 0) * 0.85,
                )
                explained.append({"alert_id": alert.get("id"), "metric_code": metric_code, **expl})
                update_q = db.table("alerts").update({
                    "explanation": expl.get("explanation", ""),
                    "recommended_action": expl.get("suggestion", ""),
                }).eq("id", alert["id"])
                await update_q.execute()
            results["anomalies"] = explained

        # Risk Forecaster (one forecast per metric with enough history)
        if "risk_forecaster" in agents_to_run and history_count >= 2:
            from agents.risk_forecaster import forecast_risk
            # Get distinct metric IDs for this institution
            metric_resp = await db.table("fact_kpis")\
                .select("metric_id, value, dim_metric(code), dim_time(academic_year, semester)")\
                .eq("institution_id", institution_id)\
                .execute()

            # Group values by metric
            metric_history: Dict[str, List[float]] = {}
            metric_codes: Dict[str, str] = {}
            for row in metric_resp.data:
                mid = str(row.get("metric_id"))
                code = (row.get("dim_metric") or {}).get("code", mid)
                metric_codes[mid] = code
                metric_history.setdefault(mid, []).append(row.get("value") or 0)

            forecasts = []
            for mid, history in metric_history.items():
                if len(history) >= 2:
                    pred = await forecast_risk(
                        institution=institution_name,
                        kpi_key=metric_codes[mid],
                        history=history[-8:],
                    )
                    forecasts.append({"metric_code": metric_codes[mid], **pred})
            results["forecasts"] = forecasts

        # Report Writer (heavy — only when explicitly requested)
        if "report_writer" in agents_to_run:
            from agents.report_writer import write_report
            from datetime import datetime
            period = f"{datetime.now().year - 1}-{datetime.now().year}"
            report_md = await write_report(
                institution=institution_name,
                period=period,
                all_kpis={k: v for k, v in kpis.items()},
            )
            results["report_markdown"] = report_md
            # Persist to reports table
            await db.table("reports").insert({
                "institution_id": institution_id,
                "title": f"Analyse IA — {institution_name} ({period})",
                "report_type": "AI_GENERATED",
                "generated_by": "Orchestrator (Mistral AI)",
                "status": "published",
                "description": report_md[:200] + "...",
            }).execute()

        logger.info(f"[Orchestrator] ✅ Deep Analysis complete for {institution_name}")
        return results

    # ── PIPELINE 3: Network-Wide Briefing ────────────────────────

    async def run_network_brief(self, db: AsyncClient) -> Dict[str, Any]:
        """
        Generates a brief pulse for every institution in the network,
        then asks Mistral to synthesize a single cross-network summary.
        """
        logger.info("[Orchestrator] ▶ Network Briefing Pipeline")
        from agents.pulse_writer import generate_pulse
        from core.llm import call_llm

        # Fetch all institutions
        inst_resp = await db.table("dim_institution").select("id, name, code").execute()
        institutions = inst_resp.data or []

        pulses: List[Dict[str, str]] = []
        for inst in institutions:
            kpis = await self._fetch_institution_kpis(db, inst["id"])
            if kpis:
                pulse = await generate_pulse(inst["name"], kpis)
                pulses.append({"institution": inst["name"], "code": inst["code"], "pulse": pulse})

        if not pulses:
            return {"pipeline": "network_brief", "summary": "Aucune donnée disponible.", "institutions": []}

        # Synthesize a cross-network narrative
        synthesis_prompt = f"""
Tu es le directeur analytique de l'Université de Carthage.
Voici les briefings individuels de chaque établissement du réseau :

{json.dumps(pulses, ensure_ascii=False, indent=2)}

Rédige un résumé exécutif de 5 à 8 phrases en français pour le Président de l'Université de Carthage.
Mets en avant les établissements les plus performants, ceux qui nécessitent une attention urgente,
et les tendances transversales importantes sur l'ensemble du réseau.
"""
        try:
            network_summary = await call_llm(synthesis_prompt, temperature=0.2)
        except Exception as e:
            logger.error(f"[Orchestrator] Network synthesis failed: {e}")
            network_summary = "Synthèse du réseau indisponible."

        logger.info("[Orchestrator] ✅ Network Briefing complete")
        return {
            "pipeline": "network_brief",
            "institution_count": len(pulses),
            "institutions": pulses,
            "network_summary": network_summary.strip(),
        }


# Singleton
orchestrator = AgentOrchestrator()
