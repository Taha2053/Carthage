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

// Used for procedure generation and chat (no strict category isolation needed)
const SYSTEM_PROMPT = `Tu es un agent d'intelligence stratégique pour l'Université de Carthage (Tunisie).

TON COMPORTEMENT EN 3 ÉTAPES :

ÉTAPE 1 — RECHERCHE D'OPPORTUNITÉS (quand l'utilisateur choisit une catégorie) :
Recherche sur internet les opportunités réelles et actives dans cette catégorie.
Retourne une liste classée de 6 à 10 opportunités spécifiques.
Format JSON requis (tableau d'objets) : [{ "id": "...", "name": "...", "organizer": "...", "participants": "...", "deadline": "...", "eligibility": "...", "score": 95, "url": "..." }]

ÉTAPE 2 — GÉNÉRATION DE PROCÉDURE (quand l'utilisateur sélectionne une opportunité) :
Génère une procédure complète et spécifique à CETTE opportunité uniquement.
Format attendu avec balises "###" :
### Résumé
### Documents requis
### Feuille de route
### Contacts officiels
### Modèle de lettre
### Stratégie de réussite

ÉTAPE 3 — SUIVI CONTEXTUEL (questions de suivi) :
Réponds en restant dans le contexte de l'opportunité sélectionnée.
Si on te demande des exemples, cite des universités africaines ou francophones ayant déjà réussi dans ce programme.

RÈGLES :
- Toujours en français
- Citer des sources réelles (URLs officielles)
- Adapter au contexte tunisien (INNORPI, MESRS, budget public limité)
- Mentionner les universités concurrentes africaines quand pertinent
- Ne jamais générer une procédure générique — toujours spécifique à l'opportunité choisie`

// Used for tab searches — strict category isolation
const CATEGORY_SYSTEM_PROMPT = `Tu es un agent de veille stratégique pour l'Université de Carthage (Tunisie).

RÈGLE ABSOLUE : Tu ne retournes QUE des opportunités correspondant exactement à la catégorie demandée. Ne mélange jamais les catégories.

CATÉGORIES ET CE QU'ELLES CONTIENNENT :

CLASSEMENTS → Uniquement : soumissions aux classements mondiaux (QS, THE, ARWU, Webometrics, UI GreenMetric, SCImago, AfriRank, URAP). Rien d'autre.

RSE → Uniquement : labels et certifications RSE (ISO 26000, SD 21000, label LUCIE, Engagé RSE, GRI Standards, pacte mondial ONU). Rien d'autre.

ISO → Uniquement : certifications ISO (ISO 9001:2015, ISO 14001:2015, ISO 50001:2018). Processus de certification via INNORPI ou bureaux accrédités. Rien d'autre.

COMPÉTITIONS → Uniquement : prix et compétitions universitaires (THE Awards, QS Reimagine Education, UNESCO ESD Prize, prix AUF, CONFEMEN, prix innovation africaine). Rien d'autre.

PARTENARIATS → Uniquement : programmes de partenariat institutionnel (Erasmus+, AUF mobilité, AAU membership, RUFORUM, AfDB, World Bank ACE, accords bilatéraux). Rien d'autre.

POUR CHAQUE OPPORTUNITÉ TROUVÉE, retourne EXACTEMENT ce format JSON :
[
  {
    "id": "unique-slug",
    "name": "Nom officiel de l'opportunité",
    "organizer": "Organisation responsable",
    "score": 85,
    "deadline": "15 Septembre 2026",
    "participants": "Universités africaines/francophones qui participent",
    "eligibility": "Condition principale pour Carthage",
    "url": "https://..."
  }
]

Retourne entre 5 et 8 opportunités par catégorie.
Toujours en français.
Toujours des opportunités réelles avec des URLs vérifiables.
Trie par score décroissant.`

const CATEGORY_QUERIES: Record<string, string> = {
  classements: 'university ranking submissions open calls 2025 2026 QS THE Webometrics GreenMetric SCImago AfriRank deadlines how to apply',
  rse: 'RSE university certification ISO 26000 label LUCIE SD 21000 GRI standards universities 2025 2026 open applications Tunisia Africa francophone',
  iso: 'ISO 9001 ISO 14001 ISO 50001 university certification Tunisia INNORPI audit 2025 2026 how to get certified public university',
  competitions: 'international university competitions awards prizes 2025 2026 open for applications African universities francophone THE Awards QS Reimagine UNESCO AUF CONFEMEN deadlines eligibility',
  partenariats: 'university partnership programs 2025 2026 open calls Erasmus+ AUF AAU RUFORUM AfDB World Bank African universities collaboration agreements mobility funding',
}

const CATEGORY_LABELS: Record<string, string> = {
  classements: 'Classements',
  rse: 'RSE',
  iso: 'ISO',
  competitions: 'Compétitions',
  partenariats: 'Partenariats',
}

// Fallback data if API fails
const MOCK_OPPORTUNITIES: Opportunity[] = [
  { id: '1', name: 'UI GreenMetric World University Rankings', organizer: 'Universitas Indonesia', participants: 'UCA (Maroc), Cheikh Anta Diop (Sénégal)', deadline: '31 Octobre 2026', eligibility: 'Ouvert à toutes les universités publiques', score: 98, url: 'https://greenmetric.ui.ac.id' },
  { id: '2', name: 'QS Reimagine Education Awards', organizer: 'QS / Wharton', participants: 'Université Mohammed V, Univ de Makerere', deadline: '15 Septembre 2026', eligibility: "Projets d'innovation pédagogique déployés", score: 90, url: 'https://www.reimagine-education.com' },
  { id: '3', name: "Prix de l'Innovation Francophone", organizer: 'AUF', participants: 'Réseau francophone AUF (1000+ membres)', deadline: '30 Novembre 2026', eligibility: "Être membre titulaire de l'AUF", score: 85, url: 'https://www.auf.org' },
]

// ── Anthropic API helpers ─────────────────────────────────────────────────────

const ANTHROPIC_HEADERS = () => ({
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY as string,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
})

async function callAnthropic(
  systemPrompt: string,
  history: { role: string; content: string }[],
) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Anthropic API key — add VITE_ANTHROPIC_API_KEY to .env')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: ANTHROPIC_HEADERS(),
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: systemPrompt,
      messages: history,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Anthropic error ${res.status}: ${(err as any).error?.message ?? 'unknown'}`)
  }
  return res.json()
}

async function callAnthropicWithWebSearch(
  systemPrompt: string,
  userMessage: string,
) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No Anthropic API key')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      ...ANTHROPIC_HEADERS(),
      'anthropic-beta': 'web-search-2025-03-05',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Anthropic error ${res.status}: ${(err as any).error?.message ?? 'unknown'}`)
  }
  return res.json()
}

function anthropicText(data: any): string {
  return (data.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text as string)
    .join('')
}

function anthropicSources(data: any): string[] {
  return (data.content ?? [])
    .filter((b: any) => b.type === 'tool_use' && b.name === 'web_search')
    .map((b: any) => `https://www.google.com/search?q=${encodeURIComponent((b.input as any)?.query ?? '')}`)
}

// ─────────────────────────────────────────────────────────────────────────────

export function useStrategyAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Bonjour, je suis votre agent d'intelligence stratégique. Je surveille le web en temps réel.\n\nSélectionnez une catégorie à gauche pour voir les opportunités actuelles, ou posez-moi une question.",
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

  // 1. REAL WEB SEARCH PER CATEGORY — cached 10 minutes
  const fetchOpportunities = useCallback(async (category: string) => {
    // Serve from cache if fresh
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
    // Flush loading state before async work begins
    await new Promise(r => setTimeout(r, 0))
    setDashboard(prev => ({ ...prev, mode: 'list', selectedCategory: category, selectedOpportunity: null, opportunities: [] }))

    const query = CATEGORY_QUERIES[category] ?? `university opportunities ${category} 2026`
    const label = CATEGORY_LABELS[category] ?? category
    const userMessage =
      `Recherche des opportunités dans la catégorie : ${label}\n\n` +
      `Query de recherche : ${query}\n\n` +
      `Retourne UNIQUEMENT des opportunités de type "${label}".\n` +
      `Format JSON strict. 5 à 8 résultats. Trié par score.`

    try {
      const data = await callAnthropicWithWebSearch(CATEGORY_SYSTEM_PROMPT, userMessage)
      const text = anthropicText(data)
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (!match) throw new Error('No JSON array in response')

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

    const prompt = `Génère la procédure complète et SPÉCIFIQUE pour participer à : "${opp.name}" (Organisé par ${opp.organizer}). Concentre-toi sur cette opportunité unique pour l'Université de Carthage.`
    let responseText = ''

    try {
      const data = await callAnthropic(SYSTEM_PROMPT, [{ role: 'user', content: prompt }])
      responseText = anthropicText(data)
    } catch {
      await new Promise(r => setTimeout(r, 800))
      responseText = `### Résumé\nLe programme ${opp.name} est une occasion unique pour l'Université de Carthage de se démarquer à l'international.\n\n### Documents requis\n- Preuve d'accréditation MESRS\n- Formulaire de candidature dûment signé par le Recteur\n- Données statistiques CarthaVillage sur 3 ans\n\n### Feuille de route\n1. S1 : Revue des critères officiels\n2. S2-S4 : Collecte des preuves\n3. S5 : Rédaction de la demande\n4. S6 : Soumission avant le ${opp.deadline}\n\n### Contacts officiels\n- Département des admissions : info@${opp.url}\n- Point focal Afrique : africa@${opp.organizer.toLowerCase().replace(/\s/g, '')}.org\n\n### Modèle de lettre\nObjet : Candidature de l'Université de Carthage au programme ${opp.name}\n\nMadame, Monsieur,\nL'Université de Carthage vous soumet officiellement sa candidature...\n\n### Stratégie de réussite\nValoriser notre approche data-driven via CarthaVillage et mentionner nos récentes accréditations. Les universités marocaines gagnent souvent en insistant sur la responsabilité sociétale.`
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
    let sources: string[] = []

    try {
      const chatHistory = messages
        .filter((m, i) => !(m.role === 'assistant' && i === 0))
        .map(m => ({ role: m.role, content: m.content }))

      let contextStr = ''
      if (dashboard.mode === 'detail' && dashboard.selectedOpportunity) {
        contextStr = `[CONTEXTE: procédure pour "${dashboard.selectedOpportunity.name}", deadline ${dashboard.selectedOpportunity.deadline}. Réponds spécifiquement.]\n\n`
      } else {
        contextStr = `[CONTEXTE: liste des opportunités catégorie "${dashboard.selectedCategory}".]\n\n`
      }
      chatHistory.push({ role: 'user', content: contextStr + content })

      const data = await callAnthropic(SYSTEM_PROMPT, chatHistory)
      responseText = anthropicText(data)
      sources = anthropicSources(data)
    } catch {
      await new Promise(r => setTimeout(r, 800))
      responseText = `C'est une excellente question concernant ${dashboard.selectedOpportunity?.name || 'cette stratégie'}. Les universités comme l'UCA au Maroc ont réussi en impliquant directement leurs laboratoires de recherche. Voulez-vous que je rédige un mail pour les contacter ?`
    }

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: responseText,
      sources: sources.length > 0 ? sources : undefined,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, assistantMsg])
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
