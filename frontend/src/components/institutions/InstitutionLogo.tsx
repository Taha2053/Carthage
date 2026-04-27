// Elegant SVG emblems for each UCAR institution.
// Style: Carthaginian / Mediterranean — gold + deep sea blue gradients.

interface Props {
  institutionId: string
  size?: number
  className?: string
}

const LOGOS: Record<string, (id: string) => JSX.Element> = {

  ucar: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1923"/>
          <stop offset="100%" stopColor="#1B4F72"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="100%" stopColor="#C5933A"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Punic crescent + star of Tanit */}
      <path d="M28 12 C20 12 14 18 14 26 C14 30 15.5 33.5 18 36 C22 32 22 20 28 18 C34 20 34 32 38 36 C40.5 33.5 42 30 42 26 C42 18 36 12 28 12Z" fill={`url(#${id}-g)`} opacity="0.9"/>
      <circle cx="28" cy="26" r="5" fill={`url(#${id}-bg)`}/>
      {/* Eight-pointed star */}
      <path d="M28 38 L29.2 41.6 L32.8 40.4 L31 44 L34.6 44 L32.4 47.2 L36 47.2 L33.2 50 L36 52.8 L32.4 52.8 L34.6 56 L31 56 L32.8 59.6 L29.2 58.4 L28 62 L26.8 58.4 L23.2 59.6 L25 56 L21.4 56 L23.6 52.8 L20 52.8 L22.8 50 L20 47.2 L23.6 47.2 L21.4 44 L25 44 L23.2 40.4 L26.8 41.6Z" fill={`url(#${id}-g)`} transform="scale(0.45) translate(34 -22)"/>
      <text x="28" y="51" textAnchor="middle" fontFamily="Georgia,serif" fontSize="10" fontWeight="bold" fill="#C5933A" letterSpacing="1">UC</text>
    </svg>
  ),

  fsegt: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1B4F72"/>
          <stop offset="100%" stopColor="#0F1923"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="100%" stopColor="#C5933A"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Columns — economics/governance */}
      <rect x="10" y="34" width="5" height="14" rx="1" fill={`url(#${id}-g)`}/>
      <rect x="17" y="30" width="5" height="18" rx="1" fill={`url(#${id}-g)`}/>
      <rect x="24" y="26" width="5" height="22" rx="1" fill={`url(#${id}-g)`}/>
      <rect x="31" y="30" width="5" height="18" rx="1" fill={`url(#${id}-g)`}/>
      <rect x="38" y="34" width="5" height="14" rx="1" fill={`url(#${id}-g)`}/>
      {/* Pediment */}
      <path d="M8 34 L28 16 L48 34Z" fill="none" stroke="#C5933A" strokeWidth="1.5"/>
      <text x="28" y="54" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7.5" fontWeight="bold" fill="#F7D98B" letterSpacing="0.5">FSEGT</text>
    </svg>
  ),

  insat: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="56" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1923"/>
          <stop offset="100%" stopColor="#1B4F72"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C5933A"/>
          <stop offset="100%" stopColor="#F7D98B"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Gear / circuit motif */}
      <circle cx="28" cy="26" r="10" fill="none" stroke={`url(#${id}-g)`} strokeWidth="2"/>
      <circle cx="28" cy="26" r="5"  fill={`url(#${id}-g)`} opacity="0.8"/>
      {/* Circuit lines */}
      <line x1="28" y1="12" x2="28" y2="16"  stroke="#C5933A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="36" x2="28" y2="40"  stroke="#C5933A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="14" y1="26" x2="18" y2="26"  stroke="#C5933A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="26" x2="42" y2="26"  stroke="#C5933A" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18.1" y1="16.1" x2="21" y2="19"  stroke="#C5933A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="37.9" y1="35.9" x2="35" y2="33"  stroke="#C5933A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="37.9" y1="16.1" x2="35" y2="19"  stroke="#C5933A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18.1" y1="35.9" x2="21" y2="33"  stroke="#C5933A" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="28" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8" fontWeight="bold" fill="#C5933A" letterSpacing="0.5">INSAT</text>
    </svg>
  ),

  enstab: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E4D2B"/>
          <stop offset="100%" stopColor="#0F1923"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="56" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C5933A"/>
          <stop offset="100%" stopColor="#F7D98B"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Wave + star — coastal/advanced sciences */}
      <path d="M8 30 Q14 22 20 30 Q26 38 32 30 Q38 22 48 30" fill="none" stroke={`url(#${id}-g)`} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 36 Q14 28 20 36 Q26 44 32 36 Q38 28 48 36" fill="none" stroke="#C5933A" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      {/* Star above */}
      <path d="M28 8 L29.5 13 L34.5 13 L30.5 16 L32 21 L28 18 L24 21 L25.5 16 L21.5 13 L26.5 13Z" fill={`url(#${id}-g)`}/>
      <text x="28" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#C5933A" letterSpacing="0.3">ENSTAB</text>
    </svg>
  ),

  ihec: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5C3A00"/>
          <stop offset="100%" stopColor="#0F1923"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="40%" stopColor="#C5933A"/>
          <stop offset="100%" stopColor="#9E7520"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Merchant ship / commerce */}
      <path d="M12 32 Q18 20 28 22 Q38 20 44 32 L44 36 Q28 42 12 36Z" fill={`url(#${id}-g)`} opacity="0.85"/>
      <line x1="28" y1="22" x2="28" y2="10" stroke="#F7D98B" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 10 L38 18 L28 22Z" fill="#C5933A" opacity="0.9"/>
      <path d="M28 10 L18 18 L28 22Z" fill="#9E7520" opacity="0.7"/>
      {/* Waves below */}
      <path d="M10 38 Q18 42 28 38 Q38 34 46 38" fill="none" stroke="#C5933A" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
      <text x="28" y="53" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" fontWeight="bold" fill="#F7D98B" letterSpacing="0.3">IHEC</text>
    </svg>
  ),

  ipeit: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="56" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2E86C1"/>
          <stop offset="100%" stopColor="#0F1923"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="100%" stopColor="#C5933A"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Open book — preparatory studies */}
      <path d="M10 18 L28 14 L28 42 L10 38Z" fill={`url(#${id}-g)`} opacity="0.8"/>
      <path d="M28 14 L46 18 L46 38 L28 42Z" fill="#C5933A" opacity="0.7"/>
      <line x1="28" y1="14" x2="28" y2="42" stroke="#F7D98B" strokeWidth="1.5"/>
      {/* Lines of text */}
      <line x1="14" y1="24" x2="25" y2="22" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="14" y1="28" x2="25" y2="26" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="14" y1="32" x2="25" y2="30" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="31" y1="22" x2="42" y2="24" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="31" y1="26" x2="42" y2="28" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="31" y1="30" x2="42" y2="32" stroke="#0F1923" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <text x="28" y="53" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7.5" fontWeight="bold" fill="#F7D98B" letterSpacing="0.3">IPEIT</text>
    </svg>
  ),

  fst: (id) => (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="56" x2="56" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1923"/>
          <stop offset="100%" stopColor="#1A3A5C"/>
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C5933A"/>
          <stop offset="100%" stopColor="#F7D98B"/>
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
      {/* Atom / sciences */}
      <ellipse cx="28" cy="26" rx="16" ry="7" fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.5"/>
      <ellipse cx="28" cy="26" rx="16" ry="7" fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.5" transform="rotate(60 28 26)"/>
      <ellipse cx="28" cy="26" rx="16" ry="7" fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.5" transform="rotate(120 28 26)"/>
      <circle cx="28" cy="26" r="3.5" fill={`url(#${id}-g)`}/>
      <text x="28" y="52" textAnchor="middle" fontFamily="Georgia,serif" fontSize="8.5" fontWeight="bold" fill="#C5933A" letterSpacing="0.5">FST</text>
    </svg>
  ),
}

const DEFAULT_LOGO = (id: string, initials: string) => (
  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1B4F72"/>
        <stop offset="100%" stopColor="#0F1923"/>
      </linearGradient>
    </defs>
    <rect width="56" height="56" rx="10" fill={`url(#${id}-bg)`}/>
    <text x="28" y="33" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="bold" fill="#C5933A" letterSpacing="1">
      {initials}
    </text>
    <line x1="12" y1="38" x2="44" y2="38" stroke="#C5933A" strokeWidth="0.8" opacity="0.5"/>
  </svg>
)

const IMAGE_LOGOS: Record<string, string> = {
  'enau': "Ecole Nationale d'Architecture et d'Urbanisme de Tunis.jpeg",
  'ept': "Ecole Polytechnique de Tunisie.jpeg",
  'estic': "Ecole Supérieure de Technologie et d'Informatique à Carthage.png",
  'esac': "Ecole Supérieure de l'Audiovisuel et du Cinéma de Gammarth.jpeg",
  'essai': "Ecole Supérieure des Statistiques et d'Analyse de l'Information.png",
  'fsegn': "Faculté des Sciences Economiques et de Gestion de Nabeul.jpeg",
  'fsjpst': "Faculté des Sciences Juridiques, Politiques et Sociales de Tunis.jpeg",
  'inat': "Institut National Agronomique de Tunisie.jpeg",
  'insat': "Institut National des Sciences Appliquées et de Technologie.jpeg",
  'ipest': "Institut Préparatoire aux Etudes Scientifiques et Techniques.jpeg",
  'ihec': "Institut des Hautes Etudes Commerciales de Carthage.jpg",
  'supcom': "Sup'Com.png",
  'enstab': "enstab.png",
  'fsb': "faculte des sciences de bizerte.jpeg",
}

export function InstitutionLogo({ institutionId, size = 40, className = '' }: Props) {
  const imageFilename = IMAGE_LOGOS[institutionId]

  if (imageFilename) {
    return (
      <span
        className={`inline-flex shrink-0 rounded-lg overflow-hidden shadow-sm bg-white border border-rule items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={`/logos/${imageFilename}`} alt={institutionId} className="w-full h-full object-contain p-0.5 mix-blend-multiply" />
      </span>
    )
  }

  const renderer = LOGOS[institutionId]
  const uid = `logo-${institutionId}`
  const element = renderer
    ? renderer(uid)
    : DEFAULT_LOGO(uid, institutionId.slice(0, 2).toUpperCase())

  return (
    <span
      className={`inline-flex shrink-0 rounded-lg overflow-hidden shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      {element}
    </span>
  )
}
