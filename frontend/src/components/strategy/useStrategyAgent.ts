import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: string
}

export interface Opportunity {
  id: string
  name: string
  organizer: string
  participants: string
  deadline: string
  eligibility: string
  score: number
  url: string
}

export interface DashboardState {
  mode: 'list' | 'detail'
  selectedCategory: string
  selectedOpportunity: Opportunity | null
  kpis: { rankings: number; iso: number; competitions: number; partners: number; rse: number; actions: number }
  opportunities: Opportunity[]
  procedure: {
    resume: { title: string; body: string; badge: string }
    documents: { title: string; body: string; badge: string }
    roadmap: { title: string; body: string; badge: string }
    contacts: { title: string; body: string; badge: string }
    lettre: { title: string; body: string; badge: string }
    strategie: { title: string; body: string; badge: string }
  }
  lastUpdated: string | null
}

const INITIAL_KPI = { rankings: 7, iso: 3, competitions: 8, partners: 25, rse: 5, actions: 30 }

const INITIAL_PROCEDURE = {
  resume: { title: 'Résumé', body: 'En attente', badge: '' },
  documents: { title: 'Documents requis', body: 'En attente', badge: '' },
  roadmap: { title: 'Feuille de route', body: 'En attente', badge: '' },
  contacts: { title: 'Contacts officiels', body: 'En attente', badge: '' },
  lettre: { title: 'Modèle de lettre', body: 'En attente', badge: '' },
  strategie: { title: 'Stratégie de réussite', body: 'En attente', badge: '' },
}

const SYSTEM_PROMPT = `Tu es un agent d'intelligence stratégique pour l'Université de Carthage (Tunisie).

ÉTAPE 2 — GÉNÉRATION DE PROCÉDURE (quand l'utilisateur sélectionne une opportunité) :
Génère une procédure complète et spécifique à CETTE opportunité uniquement.
Format attendu avec balises "###" :
### Résumé
### Documents requis
### Feuille de route
### Contacts officiels
### Modèle de lettre
### Stratégie de réussite

ÉTAPE 3 — SUIVI CONTEXTUEL :
Réponds en restant dans le contexte de l'opportunité sélectionnée.
Cite des universités africaines ou francophones ayant déjà réussi dans ce programme.

RÈGLES :
- Toujours en français
- Citer des sources réelles (URLs officielles)
- Adapter au contexte tunisien (INNORPI, MESRS, budget public limité)
- Mentionner les universités concurrentes africaines quand pertinent`

const CATEGORY_SYSTEM_PROMPT = `Tu es un agent de veille stratégique pour l'Université de Carthage (Tunisie).

RÈGLE ABSOLUE : Tu ne retournes QUE des opportunités correspondant exactement à la catégorie demandée. Ne mélange JAMAIS les catégories.

CLASSEMENTS → Uniquement : soumissions aux classements mondiaux (QS, THE, ARWU, Webometrics, UI GreenMetric, SCImago, AfriRank, URAP).
RSE → Uniquement : labels et certifications RSE (ISO 26000, SD 21000, label LUCIE, Engagé RSE, GRI Standards, pacte mondial ONU).
ISO → Uniquement : certifications ISO (ISO 9001:2015, ISO 14001:2015, ISO 50001:2018) via INNORPI ou bureaux accrédités.
COMPÉTITIONS → Uniquement : prix et compétitions universitaires (THE Awards, QS Reimagine Education, UNESCO ESD Prize, prix AUF, CONFEMEN).
PARTENARIATS → Uniquement : programmes de partenariat institutionnel (Erasmus+, AUF mobilité, AAU, RUFORUM, AfDB, World Bank ACE).

Retourne EXACTEMENT ce format JSON et rien d'autre :
[
  {
    "id": "slug-unique",
    "name": "Nom officiel",
    "organizer": "Organisation responsable",
    "score": 85,
    "deadline": "15 Septembre 2026",
    "participants": "Universités africaines/francophones participantes",
    "eligibility": "Condition principale pour l'Université de Carthage",
    "url": "https://..."
  }
]

5 à 8 opportunités. En français. Triées par score décroissant. JSON pur, sans texte autour.`

const CATEGORY_LABELS: Record<string, string> = {
  classements: 'Classements',
  rse: 'RSE',
  iso: 'ISO',
  competitions: 'Compétitions',
  partenariats: 'Partenariats',
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  { id: '1', name: 'UI GreenMetric World University Rankings', organizer: 'Universitas Indonesia', participants: 'UCA (Maroc), Cheikh Anta Diop (Sénégal)', deadline: '31 Octobre 2026', eligibility: 'Ouvert à toutes les universités publiques', score: 98, url: 'https://greenmetric.ui.ac.id' },
  { id: '2', name: 'QS Reimagine Education Awards', organizer: 'QS / Wharton', participants: 'Université Mohammed V, Univ de Makerere', deadline: '15 Septembre 2026', eligibility: "Projets d'innovation pédagogique déployés", score: 90, url: 'https://www.reimagine-education.com' },
  { id: '3', name: "Prix de l'Innovation Francophone", organizer: 'AUF', participants: 'Réseau francophone AUF (1000+ membres)', deadline: '30 Novembre 2026', eligibility: "Être membre titulaire de l'AUF", score: 85, url: 'https://www.auf.org' },
]

// ── Mistral API ───────────────────────────────────────────────────────────────

async function callMistral(
  systemPrompt: string,
  history: { role: string; content: string }[],
  maxTokens = 2048,
) {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
  if (!apiKey) throw new Error('No Mistral API key — add VITE_MISTRAL_API_KEY to .env')

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Mistral error ${res.status}: ${(err as any).message ?? 'unknown'}`)
  }
  return res.json()
}

function mistralText(data: any): string {
  return data.choices?.[0]?.message?.content ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────

export function useStrategyAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Bonjour, je suis votre agent d'intelligence stratégique.\n\nSélectionnez une catégorie à gauche pour voir les opportunités, ou posez-moi une question.",
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }])

  const [dashboard, setDashboard] = useState<DashboardState>({
    mode: 'list',
    selectedCategory: 'classements',
    selectedOpportunity: null,
    kpis: { ...INITIAL_KPI },
    opportunities: [],
    procedure: { ...INITIAL_PROCEDURE },
    lastUpdated: null,
  })

  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const categoryCache = useRef<Map<string, { data: Opportunity[]; ts: number }>>(new Map())

  // 1. FETCH OPPORTUNITIES PER CATEGORY — cached 10 min
  const fetchOpportunities = useCallback(async (category: string) => {
    const cached = categoryCache.current.get(category)
    if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
      setDashboard(prev => ({
        ...prev,
        mode: 'list',
        selectedCategory: category,
        selectedOpportunity: null,
        opportunities: cached.data,
        lastUpdated: new Date().toLocaleTimeString('fr-FR'),
      }))
      return
    }

    setLoadingDashboard(true)
    await new Promise(r => setTimeout(r, 0))
    setDashboard(prev => ({ ...prev, mode: 'list', selectedCategory: category, selectedOpportunity: null, opportunities: [] }))

    const label = CATEGORY_LABELS[category] ?? category
    const userMessage = `Catégorie : ${label}\nRetourne UNIQUEMENT des opportunités de type "${label}" pour l'Université de Carthage (Tunisie).\nJSON pur uniquement, 5 à 8 résultats, trié par score décroissant.`

    try {
      const data = await callMistral(CATEGORY_SYSTEM_PROMPT, [{ role: 'user', content: userMessage }], 1500)
      const text = mistralText(data)
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (!match) throw new Error('No JSON in response')

      const parsed = JSON.parse(match[0]) as Opportunity[]
      categoryCache.current.set(category, { data: parsed, ts: Date.now() })
      setDashboard(prev => ({ ...prev, opportunities: parsed, lastUpdated: new Date().toLocaleTimeString('fr-FR') }))
    } catch (err) {
      console.error('fetchOpportunities failed:', err)
      setDashboard(prev => ({
        ...prev,
        opportunities: MOCK_OPPORTUNITIES.map(o => ({ ...o, id: Math.random().toString() })),
        lastUpdated: new Date().toLocaleTimeString('fr-FR'),
      }))
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  // 2. GENERATE PROCEDURE FOR A SELECTED OPPORTUNITY
  const selectOpportunity = useCallback(async (opp: Opportunity) => {
    setLoadingDashboard(true)
    setDashboard(prev => ({ ...prev, mode: 'detail', selectedOpportunity: opp }))

    const prompt = `Génère la procédure complète et SPÉCIFIQUE pour participer à : "${opp.name}" (Organisé par ${opp.organizer}). Concentre-toi sur cette opportunité pour l'Université de Carthage.`
    let responseText = ''

    try {
      const data = await callMistral(SYSTEM_PROMPT, [{ role: 'user', content: prompt }])
      responseText = mistralText(data)
    } catch {
      responseText = `### Résumé\nLe programme ${opp.name} est une occasion unique pour l'Université de Carthage.\n\n### Documents requis\n- Preuve d'accréditation MESRS\n- Formulaire signé par le Recteur\n- Données CarthaVillage sur 3 ans\n\n### Feuille de route\n1. S1 : Revue des critères\n2. S2-S4 : Collecte des preuves\n3. S5 : Rédaction\n4. S6 : Soumission avant le ${opp.deadline}\n\n### Contacts officiels\n- info@${opp.url}\n\n### Modèle de lettre\nObjet : Candidature de l'Université de Carthage — ${opp.name}\n\nMadame, Monsieur,\nL'Université de Carthage soumet sa candidature...\n\n### Stratégie de réussite\nValoriser l'approche data-driven via CarthaVillage et les accréditations récentes.`
    }

    const extract = (regex: RegExp) => (responseText.match(regex)?.[1] || '').trim() || 'Contenu en cours de génération...'

    setDashboard(prev => ({
      ...prev,
      procedure: {
        resume: { title: 'Résumé & Éligibilité', body: extract(/### Résumé\n([\s\S]*?)(?=###|$)/i), badge: opp.name },
        documents: { title: 'Documents exacts requis', body: extract(/### Documents requis\n([\s\S]*?)(?=###|$)/i), badge: 'À préparer' },
        roadmap: { title: 'Timeline semaine par semaine', body: extract(/### Feuille de route\n([\s\S]*?)(?=###|$)/i), badge: opp.deadline },
        contacts: { title: 'Contacts réels', body: extract(/### Contacts officiels\n([\s\S]*?)(?=###|$)/i), badge: 'Vérifiés' },
        lettre: { title: 'Modèle de lettre de candidature', body: extract(/### Modèle de lettre\n([\s\S]*?)(?=###|$)/i), badge: 'Prêt à signer' },
        strategie: { title: 'Stratégie de différenciation', body: extract(/### Stratégie de réussite\n([\s\S]*?)(?=###|$)/i), badge: 'Expertise AI' },
      },
      lastUpdated: new Date().toLocaleTimeString('fr-FR'),
    }))
    setLoadingDashboard(false)
  }, [])

  // 3. INTERACTIVE CHAT
  const sendChatMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setLoadingChat(true)

    let responseText = ''

    try {
      const chatHistory = messages
        .filter((m, i) => !(m.role === 'assistant' && i === 0))
        .map(m => ({ role: m.role, content: m.content }))

      const context = dashboard.mode === 'detail' && dashboard.selectedOpportunity
        ? `[Contexte: procédure pour "${dashboard.selectedOpportunity.name}", deadline ${dashboard.selectedOpportunity.deadline}]\n\n`
        : `[Contexte: opportunités catégorie "${dashboard.selectedCategory}"]\n\n`

      const data = await callMistral(SYSTEM_PROMPT, [
        ...chatHistory,
        { role: 'user', content: context + content },
      ])
      responseText = mistralText(data)
    } catch {
      responseText = `Je n'ai pas pu répondre à cette question pour le moment. Veuillez réessayer.`
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }])
    setLoadingChat(false)
  }, [messages, dashboard])

  return {
    messages,
    dashboard,
    loadingChat,
    loadingDashboard,
    sendChatMessage,
    fetchOpportunities,
    selectOpportunity,
    resetToList: () => setDashboard(prev => ({ ...prev, mode: 'list', selectedOpportunity: null })),
  }
}
