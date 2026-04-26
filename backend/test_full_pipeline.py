"""
Full AI Pipeline Mock Test
Simulates the complete UCAR intelligence stack with realistic mock data.
No real database connection needed — all DB calls are intercepted.

Coverage:
  - Analyst Agent (HOT/WARM/COLD classification)
  - Anomaly Reasoner Agent
  - Pulse Writer Agent
  - Risk Forecaster Agent
  - Report Writer Agent
  - Orchestrator Pipeline 1 (post-upload)
  - Orchestrator Pipeline 2 (deep analysis)
  - Orchestrator Pipeline 3 (network brief)
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

# ── Mock Data ────────────────────────────────────────────────────

MOCK_INSTITUTIONS = [
    {"id": 1, "name": "ENSTAB", "code": "ENSTAB", "short_name": "ENSTAB"},
    {"id": 2, "name": "ISET Bizerte", "code": "ISETBIZ", "short_name": "ISET Bizerte"},
    {"id": 3, "name": "Faculte des Sciences de Bizerte", "code": "FSB", "short_name": "FSB"},
]

MOCK_KPIS = {
    "DROPOUT_RATE":          {"id": 1, "code": "DROPOUT_RATE",   "name": "Taux d'abandon",          "unit": "%",  "higher_is_better": False},
    "SUCCESS_RATE":          {"id": 2, "code": "SUCCESS_RATE",    "name": "Taux de reussite",         "unit": "%",  "higher_is_better": True},
    "ATTENDANCE_RATE":       {"id": 3, "code": "ATTENDANCE_RATE", "name": "Taux de presence",         "unit": "%",  "higher_is_better": True},
    "BUDGET_EXECUTION_RATE": {"id": 4, "code": "BUDGET_EXEC",    "name": "Taux d'execution budgetaire","unit": "%", "higher_is_better": True},
    "EMPLOYABILITY_RATE":    {"id": 5, "code": "EMPLOYABILITY",  "name": "Taux d'employabilite",     "unit": "%",  "higher_is_better": True},
    "STAFF_ABSENTEEISM":     {"id": 6, "code": "ABSENTEEISM",    "name": "Taux d'absenteisme RH",    "unit": "%",  "higher_is_better": False},
}

MOCK_FACT_KPIS = {
    1: {  # ENSTAB
        "DROPOUT_RATE":          [8.2, 10.1, 12.5, 15.3, 18.7, 22.1, 25.5],  # trending up — critical
        "SUCCESS_RATE":          [88.0, 85.5, 83.2, 79.0, 75.0, 72.0],       # trending down — warning
        "ATTENDANCE_RATE":       [94.0, 93.5, 92.0, 91.0],                    # stable
        "BUDGET_EXECUTION_RATE": [78.0, 82.0, 88.0, 91.0],                   # improving
        "EMPLOYABILITY_RATE":    [73.0, 71.0, 68.5, 65.0],                   # declining
        "STAFF_ABSENTEEISM":     [3.5, 4.1, 5.2, 6.8],                       # worsening
    },
    2: {  # ISET Bizerte
        "DROPOUT_RATE":          [5.0, 5.5, 6.0, 6.2],
        "SUCCESS_RATE":          [82.0, 83.0, 84.5, 86.0],
        "ATTENDANCE_RATE":       [95.5, 96.0, 95.0],
        "EMPLOYABILITY_RATE":    [80.0, 81.0, 83.0],
    },
    3: {  # FSB
        "DROPOUT_RATE":          [9.0, 10.5, 11.0, 11.5],
        "SUCCESS_RATE":          [77.0, 76.5, 75.0, 74.0],
        "ATTENDANCE_RATE":       [90.0, 89.5, 88.0],
    },
}

MOCK_ALERTS = {
    1: [  # ENSTAB has critical alerts
        {
            "id": 101,
            "institution_id": 1,
            "metric_id": 1,
            "value": 25.5,
            "threshold": 20.0,
            "severity": "critical",
            "resolved": False,
            "explanation": None,
            "recommended_action": None,
            "dim_metric": {"code": "DROPOUT_RATE"},
            "dim_institution": {"code": "ENSTAB"},
        },
        {
            "id": 102,
            "institution_id": 1,
            "metric_id": 2,
            "value": 72.0,
            "threshold": 75.0,
            "severity": "warning",
            "resolved": False,
            "explanation": None,
            "recommended_action": None,
            "dim_metric": {"code": "SUCCESS_RATE"},
            "dim_institution": {"code": "ENSTAB"},
        }
    ],
    2: [],  # ISET Bizerte — no alerts
    3: [],  # FSB — no alerts
}

MOCK_DOCUMENTS = [
    {
        "filename": "rapport_academique_2024.pdf",
        "text": """
        Rapport Academique ENSTAB 2023-2024.
        Le taux de reussite en licence est de 72%.
        Le taux d'abandon en premiere annee atteint 25.5%, en nette augmentation par rapport aux 18.7% de l'annee precedente.
        Le departement Genie Civil enregistre les meilleures performances avec 85% de reussite.
        Un plan d'urgence pedagogique est requis pour stabiliser le taux d'abandon.
        """
    },
    {
        "filename": "grille_notes_S1_2024.csv",
        "text": """
        metric_code,value,academic_year,semester
        SUCCESS_RATE,72.0,2024-2025,1
        DROPOUT_RATE,25.5,2024-2025,1
        ATTENDANCE_RATE,91.0,2024-2025,1
        """
    }
]


# ── Mock Database Client ─────────────────────────────────────────

class MockDB:
    """
    Simulates the Supabase AsyncClient.
    Intercepts all .table().select().eq().execute() chains
    and returns realistic mock data.
    """

    def __init__(self, institution_id: int = 1):
        self._institution_id = institution_id
        self._table = None
        self._filters = {}

    def table(self, name: str) -> "MockDB":
        self._table = name
        self._filters = {}
        return self

    def select(self, *args) -> "MockDB":
        return self

    def eq(self, field: str, value) -> "MockDB":
        self._filters[field] = value
        return self

    def is_(self, *args) -> "MockDB":
        return self

    def not_(self) -> "MockDB":
        return self

    def limit(self, n: int) -> "MockDB":
        return self

    def order(self, *args, **kwargs) -> "MockDB":
        return self

    def insert(self, data) -> "MockDB":
        return self

    def update(self, data) -> "MockDB":
        return self

    async def execute(self):
        return self._resolve()

    def _resolve(self):
        class Result:
            def __init__(self, data):
                self.data = data

        inst_id = self._filters.get("institution_id", self._institution_id)
        t = self._table

        if t == "dim_institution":
            if "id" in self._filters:
                matches = [i for i in MOCK_INSTITUTIONS if i["id"] == self._filters["id"]]
                return Result(matches)
            return Result(MOCK_INSTITUTIONS)

        if t == "dim_metric":
            if "code" in self._filters:
                code = self._filters["code"]
                matches = [m for m in MOCK_KPIS.values() if m["code"] == code]
                return Result(matches)
            return Result(list(MOCK_KPIS.values()))

        if t == "fact_kpis":
            rows = []
            iid = int(inst_id) if inst_id else 1
            kpi_data = MOCK_FACT_KPIS.get(iid, {})
            for metric_code, history in kpi_data.items():
                metric_info = MOCK_KPIS.get(metric_code, {})
                for i, val in enumerate(history):
                    rows.append({
                        "id": iid * 1000 + i,
                        "institution_id": iid,
                        "metric_id": metric_info.get("id"),
                        "time_id": i + 1,
                        "value": val,
                        "source": "mock",
                        "dim_metric": {"code": metric_code, "name": metric_info.get("name", "")},
                        "dim_time": {"academic_year": f"202{i}-202{i+1}", "semester": 1},
                        "dim_institution": {"name": f"Institution {iid}", "code": f"INST{iid}"},
                    })
            return Result(rows)

        if t == "alerts":
            iid = int(inst_id) if inst_id else 1
            alerts = MOCK_ALERTS.get(iid, [])
            if self._filters.get("resolved") == False:
                alerts = [a for a in alerts if not a.get("resolved")]
            return Result(alerts)

        if t in ("reports", "kpi_forecasts", "upload_log", "audit_log"):
            return Result([{"id": 999, "status": "created"}])

        if t == "mv_network_comparison":
            rows = []
            for inst in MOCK_INSTITUTIONS:
                for code, vals in MOCK_FACT_KPIS.get(inst["id"], {}).items():
                    rows.append({
                        "institution_id": inst["id"],
                        "institution_name": inst["name"],
                        "metric_code": code,
                        "value": vals[-1],
                        "network_avg": sum(
                            MOCK_FACT_KPIS[i["id"]].get(code, [0])[-1]
                            for i in MOCK_INSTITUTIONS
                            if code in MOCK_FACT_KPIS.get(i["id"], {})
                        ) / 3,
                        "network_rank": 1,
                    })
            return Result(rows)

        # Default: empty result
        return Result([])


# ── Individual Agent Tests ───────────────────────────────────────

async def test_analyst():
    print("\n" + "="*60)
    print("AGENT 1: Analyst (HOT/WARM/COLD Classifier)")
    print("="*60)
    from agents.analyst import extract_from_file

    # Test 1: CSV-like text (should be HOT)
    print("\n  [A] Testing structured KPI text -> expects HOT...")
    hot_text = MOCK_DOCUMENTS[1]["text"]
    result = await extract_from_file(data_text=hot_text, filename="grille_notes.csv", institution_id="1")
    print(f"  Category: {result.get('category')} | Score: {result.get('score')}")
    print(f"  KPIs found: {result.get('kpis', [])[:2]}")

    # Test 2: Narrative PDF text (should be WARM)
    print("\n  [B] Testing narrative PDF text -> expects WARM...")
    warm_text = MOCK_DOCUMENTS[0]["text"]
    result2 = await extract_from_file(data_text=warm_text, filename="rapport.pdf", institution_id="1")
    print(f"  Category: {result2.get('category')} | Score: {result2.get('score')}")
    if result2.get("summary"):
        print(f"  Summary: {result2['summary'][:120]}...")
    return result, result2


async def test_anomaly_reasoner():
    print("\n" + "="*60)
    print("AGENT 2: Anomaly Reasoner")
    print("="*60)
    from agents.anomaly_reasoner import reason_anomaly

    alert = MOCK_ALERTS[1][0]
    print(f"\n  Alert: {alert['dim_metric']['code']} = {alert['value']}% (threshold: {alert['threshold']}%)")

    result = await reason_anomaly(
        institution="ENSTAB",
        kpi_key=alert["dim_metric"]["code"],
        value=alert["value"],
        threshold=alert["threshold"],
        peer_avg=8.5,  # network average dropout rate
    )
    print(f"  Title:       {result.get('title')}")
    print(f"  Severity:    {result.get('severity')}")
    print(f"  Explanation: {result.get('explanation', '')[:150]}...")
    print(f"  Suggestion:  {result.get('suggestion', '')[:100]}...")
    return result


async def test_pulse_writer():
    print("\n" + "="*60)
    print("AGENT 3: Pulse Writer")
    print("="*60)
    from agents.pulse_writer import generate_pulse

    kpis = {code: vals[-1] for code, vals in MOCK_FACT_KPIS[1].items()}
    print(f"\n  Input KPIs: {kpis}")
    result = await generate_pulse(institution_name="ENSTAB", kpis=kpis)
    print(f"\n  Generated Pulse:\n  {result}")
    return result


async def test_risk_forecaster():
    print("\n" + "="*60)
    print("AGENT 4: Risk Forecaster")
    print("="*60)
    from agents.risk_forecaster import forecast_risk

    history = MOCK_FACT_KPIS[1]["DROPOUT_RATE"]
    print(f"\n  DROPOUT_RATE history for ENSTAB: {history}")

    result = await forecast_risk(
        institution="ENSTAB",
        kpi_key="DROPOUT_RATE",
        history=history,
    )
    print(f"  Prediction:     {result.get('prediction_text', '')[:150]}...")
    print(f"  Weeks to event: {result.get('weeks_to_event')}")
    print(f"  Confidence:     {result.get('confidence')}")
    return result


async def test_report_writer():
    print("\n" + "="*60)
    print("AGENT 5: Report Writer")
    print("="*60)
    from agents.report_writer import write_report

    kpis = {MOCK_KPIS[code]["name"]: vals[-1] for code, vals in MOCK_FACT_KPIS[1].items() if code in MOCK_KPIS}
    print(f"\n  Generating full report for ENSTAB with {len(kpis)} KPIs...")

    result = await write_report(
        institution="ENSTAB",
        period="2023-2024",
        all_kpis=kpis,
    )
    print(f"\n  Report (first 400 chars):\n  {result[:400]}...")
    return result


async def test_orchestrator_pipeline1():
    print("\n" + "="*60)
    print("ORCHESTRATOR PIPELINE 1: Post-Upload Intelligence")
    print("="*60)
    from agents.orchestrator import AgentOrchestrator

    orch = AgentOrchestrator()
    db = MockDB(institution_id=1)

    print("\n  Simulating: file uploaded for ENSTAB (institution_id=1)...")
    result = await orch.run_post_upload_pipeline(
        institution_id=1,
        uploaded_data={"filename": "grille_notes_S1_2024.csv", "rows_inserted": 6, "domain": "academic"},
        db=db,
    )
    print(f"\n  Agents run:       {result.get('agents_run')}")
    print(f"  Uploaded file:    {result.get('uploaded_file')}")
    if result.get("pulse"):
        print(f"  Pulse (snippet):  {result['pulse'][:150]}...")
    if result.get("anomalies"):
        print(f"  Anomalies found:  {len(result['anomalies'])}")
        for a in result["anomalies"]:
            print(f"    - [{a.get('severity')}] {a.get('metric_code')}: {a.get('title')}")
    return result


async def test_orchestrator_pipeline2():
    print("\n" + "="*60)
    print("ORCHESTRATOR PIPELINE 2: Deep Institution Analysis")
    print("="*60)
    from agents.orchestrator import AgentOrchestrator

    orch = AgentOrchestrator()
    db = MockDB(institution_id=1)

    print("\n  Running deep analysis for ENSTAB (no report)...")
    result = await orch.run_deep_analysis(institution_id=1, db=db, include_report=False)

    print(f"\n  Agents run:       {result.get('agents_run')}")
    print(f"  KPI snapshot:     {list(result.get('kpi_snapshot', {}).keys())}")
    if result.get("pulse"):
        print(f"  Pulse (snippet):  {result['pulse'][:150]}...")
    if result.get("forecasts"):
        print(f"  Forecasts count:  {len(result['forecasts'])}")
        for f in result["forecasts"][:2]:
            print(f"    - {f.get('metric_code')}: confidence={f.get('confidence')}")
    if result.get("anomalies"):
        print(f"  Anomalies:        {len(result['anomalies'])}")
    return result


async def test_orchestrator_pipeline3():
    print("\n" + "="*60)
    print("ORCHESTRATOR PIPELINE 3: Network-Wide Executive Brief")
    print("="*60)
    from agents.orchestrator import AgentOrchestrator

    orch = AgentOrchestrator()
    # Use a multi-institution MockDB
    db = MockDB()

    print("\n  Generating cross-network briefing for all 3 institutions...")
    result = await orch.run_network_brief(db=db)

    print(f"\n  Institutions briefed: {result.get('institution_count')}")
    for inst in result.get("institutions", []):
        print(f"\n  [{inst['code']}] {inst['pulse'][:120]}...")
    print(f"\n  Network Summary (for Carthage University President):")
    print(f"  {result.get('network_summary', '')[:400]}...")
    return result


# ── Main Runner ──────────────────────────────────────────────────

async def main():
    print("\n" + "#"*60)
    print("  UCAR INTELLIGENCE HUB — FULL AI PIPELINE MOCK TEST")
    print("#"*60)

    results = {}
    passed = 0
    failed = 0

    tests = [
        ("analyst",             test_analyst),
        ("anomaly_reasoner",    test_anomaly_reasoner),
        ("pulse_writer",        test_pulse_writer),
        ("risk_forecaster",     test_risk_forecaster),
        ("report_writer",       test_report_writer),
        ("pipeline_1_upload",   test_orchestrator_pipeline1),
        ("pipeline_2_deep",     test_orchestrator_pipeline2),
        ("pipeline_3_network",  test_orchestrator_pipeline3),
    ]

    for name, fn in tests:
        try:
            results[name] = await fn()
            passed += 1
        except Exception as e:
            import traceback
            print(f"\n  [FAIL] {name}: {e}")
            traceback.print_exc()
            failed += 1

    print("\n" + "#"*60)
    print(f"  RESULTS: {passed}/{len(tests)} passed, {failed} failed")
    print("#"*60)


if __name__ == "__main__":
    asyncio.run(main())
