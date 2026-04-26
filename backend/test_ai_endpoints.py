import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    from core.database import get_db
    from agents.risk_forecaster import forecast_risk
    from agents.report_writer import write_report
    
    # 1. Test Risk Forecaster
    print("Testing Risk Forecaster...")
    prediction = await forecast_risk(
        institution="ENSTAB",
        kpi_key="DROPOUT_RATE",
        history=[10.5, 11.2, 12.0, 15.5]
    )
    print("Forecast Decision:", prediction)
    
    # 2. Test Report Writer
    print("\nTesting Report Writer...")
    kpis = {
        "Taux de rǸussite": 85.5,
        "Budget consommǸ": "90%",
        "Taux d'absentǸisme": 5.2
    }
    report = await write_report(
        institution="ENSTAB",
        period="2023-2024",
        all_kpis=kpis
    )
    print("Generated Report Snippet:")
    print(report[:300] + "...")

if __name__ == "__main__":
    asyncio.run(main())
