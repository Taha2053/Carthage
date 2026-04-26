"""
Smoke-test for the Orchestrator agent (no DB needed).
Tests: imports, _decide_agents, and Pipeline 1 dispatch.
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()


async def test_imports():
    print("1. Testing imports...")
    from agents.orchestrator import AgentOrchestrator, AVAILABLE_AGENTS
    from agents.analyst import extract_from_file
    from agents.anomaly_reasoner import reason_anomaly
    from agents.pulse_writer import generate_pulse
    from agents.report_writer import write_report
    from agents.risk_forecaster import forecast_risk
    print(f"   [OK] All agents importable. AVAILABLE_AGENTS = {AVAILABLE_AGENTS}")
    return AgentOrchestrator()


async def test_decide_agents(orch):
    print("\n2. Testing _decide_agents (calls Mistral AI)...")
    agents = await orch._decide_agents(
        institution_name="ENSTAB",
        kpi_summary={"DROPOUT_RATE": 25.5, "SUCCESS_RATE": 72.0},
        alerts_count=2,
        history_points=4,
    )
    print(f"   Mistral chose: {agents}")
    assert isinstance(agents, list), "Should return a list"
    assert all(a in ["anomaly_reasoner", "risk_forecaster", "pulse_writer", "report_writer"] for a in agents)
    print("   [OK] _decide_agents returned valid agent list")
    return agents


async def test_pipeline1_no_db(orch):
    print("\n3. Testing Pipeline 1 (mocked DB)...")

    async def mock_fetch_kpis(db, iid):
        return {"DROPOUT_RATE": 25.5, "SUCCESS_RATE": 72.0}

    async def mock_fetch_alerts(db, iid):
        return []

    async def mock_fetch_history(db, iid):
        return 4

    orch._fetch_institution_kpis = mock_fetch_kpis
    orch._fetch_active_alerts = mock_fetch_alerts
    orch._fetch_history_count = mock_fetch_history

    class MockDB:
        def table(self, name): return self
        def select(self, *a): return self
        def eq(self, *a): return self
        async def execute(self):
            class R:
                data = [{"name": "ENSTAB"}]
            return R()

    result = await orch.run_post_upload_pipeline(
        institution_id=1,
        uploaded_data={"filename": "test.xlsx", "rows_inserted": 10},
        db=MockDB(),
    )

    print(f"   Pipeline result keys: {list(result.keys())}")
    assert result["pipeline"] == "post_upload", "pipeline field missing"
    assert result["institution_name"] == "ENSTAB", "institution_name wrong"
    assert "pulse" in result, "Pulse writer should have run"
    assert "agents_run" in result, "agents_run field missing"
    print(f"   [OK] Pipeline 1 ran. Agents used: {result['agents_run']}")
    pulse = result.get('pulse', '')
    print(f"   Pulse snippet: {pulse[:150]}")


async def main():
    try:
        orch = await test_imports()
        await test_decide_agents(orch)
        await test_pipeline1_no_db(orch)
        print("\n[PASS] ALL TESTS PASSED - Orchestrator is correctly wired")
    except AssertionError as e:
        print(f"\n[FAIL] ASSERTION FAILED: {e}")
    except Exception as e:
        import traceback
        print(f"\n[ERROR] {e}")
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
