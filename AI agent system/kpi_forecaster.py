import numpy as np

def forecast_kpi(historical_data, kpi_key='revenue', periods_to_forecast=1):
    """
    Forecasts future KPIs, determines risk level, and calculates a confidence score
    based on historical data using simple linear regression.
    
    Args:
        historical_data (list): List of KPI dictionaries.
        kpi_key (str): The specific KPI to forecast (e.g., 'revenue', 'conversion_rate').
        periods_to_forecast (int): Number of future periods to predict.
        
    Returns:
        dict: Dictionary containing predictions, risk level, and confidence score.
    """
    values = [data.get(kpi_key, 0) for data in historical_data]
    n = len(values)
    
    if n < 2:
        return {"error": "Not enough data to forecast. Need at least 2 data points."}
        
    # X values: time indices (0, 1, 2, ..., n-1)
    x = np.arange(n)
    y = np.array(values)
    
    # 1. Trend Prediction using Linear Regression (y = mx + c)
    m, c = np.polyfit(x, y, 1)
    
    # Calculate R-squared for Confidence Score
    # R-squared represents how well the data fits the linear regression model
    correlation_matrix = np.corrcoef(x, y)
    correlation_xy = correlation_matrix[0, 1]
    r_squared = correlation_xy**2
    
    # If standard deviation of y is 0 (all values are the same), corrcoef might return NaN
    if np.isnan(r_squared):
        r_squared = 1.0  # Perfect confidence if it's perfectly flat
        m = 0.0
        
    confidence_score = round(r_squared * 100, 2)
    
    # Predict future values
    future_x = np.arange(n, n + periods_to_forecast)
    predictions = (m * future_x + c).tolist()
    
    # 2. Determine Risk Level
    # Risk is evaluated based on the trend slope relative to the mean, and the volatility
    mean_val = np.mean(y)
    
    # How much does the value change per period as a percentage of the mean?
    trend_growth_pct = (m / mean_val) * 100 if mean_val != 0 else 0
    
    # How volatile is the data?
    std_dev = np.std(y)
    volatility_pct = (std_dev / mean_val) * 100 if mean_val != 0 else 0
    
    if trend_growth_pct < -5.0:
        # Sharp decline -> High Risk
        risk_level = "High"
    elif trend_growth_pct < 0 or volatility_pct > 25.0:
        # Slight decline or high volatility -> Medium Risk
        risk_level = "Medium"
    else:
        # Positive or flat trend with manageable volatility -> Low Risk
        risk_level = "Low"
        
    # Format the trend direction
    if m > 1e-5:
        trend_direction = "Upward"
    elif m < -1e-5:
        trend_direction = "Downward"
    else:
        trend_direction = "Stable"
        
    return {
        "kpi_analyzed": kpi_key,
        "current_value": round(values[-1], 2),
        "predicted_values": [round(p, 2) for p in predictions],
        "trend_direction": trend_direction,
        "trend_growth_rate_pct": round(trend_growth_pct, 2),
        "risk_level": risk_level,
        "confidence_score_pct": confidence_score
    }

if __name__ == "__main__":
    # --- TEST 1: Positive Trend (Low Risk) ---
    historical_kpis_success = [
        {"revenue": 100000, "conversion_rate": 2.5},
        {"revenue": 105000, "conversion_rate": 2.6},
        {"revenue": 112000, "conversion_rate": 2.8},
        {"revenue": 108000, "conversion_rate": 2.7},
        {"revenue": 115000, "conversion_rate": 3.0},
        {"revenue": 120000, "conversion_rate": 3.2},
    ]
    
    print("=== SCÉNARIO 1 : Croissance Stable (Low Risk) ===")
    print("Historique des revenus :", [k["revenue"] for k in historical_kpis_success])
    result_success = forecast_kpi(historical_kpis_success, kpi_key='revenue', periods_to_forecast=1)
    
    print("\n--- Prédiction des Revenus ---")
    print(f"Valeur actuelle       : {result_success['current_value']} €")
    print(f"Prédiction mois pro.  : {result_success['predicted_values'][0]} €")
    print(f"Tendance              : {result_success['trend_direction']} ({result_success['trend_growth_rate_pct']}% par période)")
    print(f"Niveau de Risque      : {result_success['risk_level']}")
    print(f"Score de Confiance    : {result_success['confidence_score_pct']} %")
    
    print("\n" + "="*50 + "\n")
    
    # --- TEST 2: Negative Trend (High Risk) ---
    historical_kpis_danger = [
        {"revenue": 150000},
        {"revenue": 140000},
        {"revenue": 125000},
        {"revenue": 110000},
        {"revenue": 95000},
        {"revenue": 80000},
    ]
    
    print("=== SCÉNARIO 2 : Chute des Revenus (High Risk) ===")
    print("Historique des revenus :", [k["revenue"] for k in historical_kpis_danger])
    result_danger = forecast_kpi(historical_kpis_danger, kpi_key='revenue', periods_to_forecast=1)
    
    print("\n--- Prédiction des Revenus ---")
    print(f"Valeur actuelle       : {result_danger['current_value']} €")
    print(f"Prédiction mois pro.  : {result_danger['predicted_values'][0]} €")
    print(f"Tendance              : {result_danger['trend_direction']} ({result_danger['trend_growth_rate_pct']}% par période)")
    print(f"Niveau de Risque      : {result_danger['risk_level']}")
    print(f"Score de Confiance    : {result_danger['confidence_score_pct']} %")
