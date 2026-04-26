import { useEffect, useRef } from 'react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4'

const LOGOS = ['Vortex', 'Nimbus', 'Prysma', 'Cirrus', 'Kynder', 'Halcyn']
const ALL_LOGOS = [...LOGOS, ...LOGOS]

const FADE_DURATION = 0.5

function LogoItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold text-foreground/80">
        {name[0]}
      </div>
      <span className="text-base font-semibold text-foreground whitespace-nowrap">{name}</span>
    </div>
  )
}

export default function SocialProofSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastOpacityRef = useRef<number>(-1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tick = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const t = video.currentTime
      const d = video.duration
      let opacity = 1
      if (t < FADE_DURATION) {
        opacity = t / FADE_DURATION
      } else if (t > d - FADE_DURATION) {
        opacity = (d - t) / FADE_DURATION
      }
      opacity = Math.max(0, Math.min(1, opacity))

      // Only write to DOM when value actually changes
      if (opacity !== lastOpacityRef.current) {
        video.style.opacity = String(opacity)
        lastOpacityRef.current = opacity
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      lastOpacityRef.current = 0
      timeoutRef.current = setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    video.addEventListener('ended', handleEnded)
    video.play().catch(() => {})
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <section className="relative w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center pt-16 pb-24 px-4 gap-20">
        <div className="h-40" />

        <div className="w-full max-w-5xl flex items-center gap-10 overflow-hidden">
          <div className="text-foreground/50 text-sm whitespace-nowrap shrink-0 leading-snug">
            Relied on by brands
            <br />
            across the globe
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-16 animate-marquee">
              {ALL_LOGOS.map((name, i) => (
                <LogoItem key={`${name}-${i}`} name={name} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
