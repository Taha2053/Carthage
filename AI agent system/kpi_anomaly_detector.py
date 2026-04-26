import numpy as np
import random

def detect_anomalies_zscore(data, threshold=2.0):
    """
    Detects anomalies in a list of numeric values using the Z-score method.
    A Z-score tells us how many standard deviations a value is from the mean.
    """
    mean = np.mean(data)
    std_dev = np.std(data)
    
    if std_dev == 0:
        return [False] * len(data)
        
    z_scores = [(x - mean) / std_dev for x in data]
    # Return True if the absolute z-score is greater than the threshold
    return [abs(z) > threshold for z in z_scores]

def analyze_kpi_history_for_anomalies(history):
    """
    Analyzes a list of KPI dictionaries to find anomalies in revenue and conversion rate.
    
    Args:
        history: List of dictionaries containing 'revenue', 'revenue_prev', 'conversion_rate', 'target_revenue'
    
    Returns:
        List of dictionaries with anomaly detection results for each period.
    """
    revenues = [kpi['revenue'] for kpi in history]
    conversion_rates = [kpi['conversion_rate'] for kpi in history]
    
    # Detect anomalies using Z-score (threshold of 2.0 standard deviations)
    revenue_anomalies = detect_anomalies_zscore(revenues, threshold=2.0)
    conversion_anomalies = detect_anomalies_zscore(conversion_rates, threshold=2.0)
    
    results = []
    for i, kpi in enumerate(history):
        anomaly_details = []
        if revenue_anomalies[i]:
            anomaly_details.append(f"Revenue ({kpi['revenue']} €) deviates significantly from the norm.")
        if conversion_anomalies[i]:
            anomaly_details.append(f"Conversion rate ({kpi['conversion_rate']}%) deviates significantly from the norm.")
            
        results.append({
            "period": i + 1,
            "kpi": kpi,
            "is_anomaly": revenue_anomalies[i] or conversion_anomalies[i],
            "details": anomaly_details
        })
        
    return results

if __name__ == "__main__":
    # 1. Generate a mock history of the previous KPIs (12 months)
    base_revenue = 110000
    base_conversion = 3.5
    
    kpi_history = []
    for i in range(12):
        # Normal fluctuations
        revenue = base_revenue + random.uniform(-15000, 15000)
        conversion = base_conversion + random.uniform(-0.5, 0.5)
        
        # Inject Anomaly 1: Sudden drop in Month 5 (e.g., website outage)
        if i == 4: 
            revenue = 45000
            conversion = 1.2
            
        # Inject Anomaly 2: Sudden spike in Month 10 (e.g., viral marketing campaign)
        if i == 9:
            revenue = 220000
            conversion = 6.8
            
        kpi_history.append({
            "revenue": round(revenue, 2),
            "revenue_prev": round(base_revenue, 2),
            "conversion_rate": round(conversion, 2),
            "target_revenue": 120000
        })
        
        base_revenue = revenue # Update previous revenue for the next iteration
        
    # 2. Run Anomaly Detection
    results = analyze_kpi_history_for_anomalies(kpi_history)
    
    # 3. Display Results
    print("=== KPI Anomaly Detection Results (Z-Score Method) ===\n")
    for res in results:
        status_icon = "🚨 ANOMALY" if res['is_anomaly'] else "✅ Normal "
        print(f"Month {res['period']:02d} | Rev: {res['kpi']['revenue']:>10} € | Conv: {res['kpi']['conversion_rate']:>5}% | {status_icon}")
        if res['is_anomaly']:
            for detail in res['details']:
                print(f"    -> {detail}")
