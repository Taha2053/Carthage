def generate_kpi_pulse_french(revenue, revenue_prev, conversion_rate, target_revenue):
    """
    Transforme des KPIs bruts (row KPIs) en une synthèse (pulse) de 2 à 3 phrases en français.
    
    Args:
        revenue (float): Chiffre d'affaires actuel.
        revenue_prev (float): Chiffre d'affaires de la période précédente.
        conversion_rate (float): Taux de conversion actuel (en %).
        target_revenue (float): Objectif de chiffre d'affaires.
        
    Returns:
        str: Un insight de 2 à 3 phrases en français.
    """
    # 1. Calculs des variations
    growth = ((revenue - revenue_prev) / revenue_prev) * 100 if revenue_prev else 0
    target_pct = (revenue / target_revenue) * 100 if target_revenue else 0
    
    # 2. Phrase 1 : Vue d'ensemble et croissance
    if growth > 0:
        trend_text = f"en hausse de {growth:.1f}% par rapport à la période précédente"
    else:
        trend_text = f"en baisse de {abs(growth):.1f}% par rapport à la période précédente"
        
    sentence1 = f"Ce mois-ci, le chiffre d'affaires s'élève à {revenue:,.0f} €, marquant une tendance {trend_text}."
    # Remplacer la virgule des milliers par un espace (format français)
    sentence1 = sentence1.replace(",", " ")
    
    # 3. Phrase 2 : Atteinte de l'objectif
    if target_pct >= 100:
        sentence2 = f"Excellente performance : l'objectif a été dépassé, atteignant {target_pct:.1f}% de la cible fixée."
    elif target_pct >= 80:
        sentence2 = f"Les résultats sont solides avec {target_pct:.1f}% de l'objectif atteint, bien qu'un dernier effort reste nécessaire."
    else:
        sentence2 = f"Attention, nous sommes seulement à {target_pct:.1f}% de l'objectif, ce qui nécessite une action corrective rapide."
        
    # 4. Phrase 3 : Métriques secondaires (ex: conversion)
    if conversion_rate >= 3.0:
        sentence3 = f"De plus, le taux de conversion reste très performant à {conversion_rate:.1f}%."
    else:
        sentence3 = f"Cependant, le taux de conversion de {conversion_rate:.1f}% pourrait être optimisé pour stimuler davantage les ventes."
        
    # Combinaison des phrases
    insight = f"{sentence1} {sentence2} {sentence3}"
    return insight


def generate_pulse_with_llm(kpi_data):
    """
    Exemple de template pour générer le pulse via une API d'Intelligence Artificielle (ex: OpenAI, Gemini).
    Utiliser un LLM donne des insights beaucoup plus fluides et dynamiques.
    """
    prompt = f"""
    Tu es un analyste de données expert.
    Voici les KPIs récents de notre activité : {kpi_data}
    
    Rédige un "Pulse" (un bref point de santé de l'entreprise).
    Génère exactement 2 à 3 phrases en français qui résument les insights majeurs de ces chiffres.
    Sois professionnel, orienté business et direct.
    """
    # Exemple d'appel API imaginaire :
    # response = ai_client.generate_text(prompt=prompt)
    # return response.text
    
    return "[Mock IA] Intégrez une API IA ici pour envoyer le prompt ci-dessus et obtenir un texte généré dynamiquement."


if __name__ == "__main__":
    # Jeu de données (Row KPIs)
    kpis_success = {
        "revenue": 125000,
        "revenue_prev": 110000,
        "conversion_rate": 3.5,
        "target_revenue": 120000
    }
    
    kpis_needs_work = {
        "revenue": 85000,
        "revenue_prev": 95000,
        "conversion_rate": 1.8,
        "target_revenue": 120000
    }
    
    print("=== TEST 1 : Scénario Positif ===")
    print("KPIs:", kpis_success)
    print("Insight Pulse :")
    print(generate_kpi_pulse_french(**kpis_success))
    print("\n")
    
    print("=== TEST 2 : Scénario Négatif ===")
    print("KPIs:", kpis_needs_work)
    print("Insight Pulse :")
    print(generate_kpi_pulse_french(**kpis_needs_work))
    print("\n")
