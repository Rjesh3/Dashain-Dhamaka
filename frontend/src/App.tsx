import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ne, nepaliError } from './i18n/ne'
import iphoneImage from './assets/iPhone.png'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const SPIN_ANIMATION_MS = 4800
const POINTS_PER_SHARE = 1000
const IPHONE_GOAL_POINTS = 100_000
const WHEEL_COLORS = ['#8f162e', '#d18a1e', '#4f1734', '#b83a2d', '#23634e', '#b97920', '#682448']

type ShareChannel = 'native' | 'whatsapp' | 'facebook' | 'messenger' | 'instagram' | 'copy'

type Outcome = {
  id: string
  label: string
  points: number
  weight?: number
}

type GameState = {
  points: number
  spins_used: number
  spins_remaining: number | null
  spin_limit: number | null
  config_version: number
  outcomes: Outcome[]
}

type SessionResponse = {
  player: { public_id: string; share_code: string }
  state: GameState
}

const defaultState: GameState = {
  points: 0,
  spins_used: 0,
  spins_remaining: null,
  spin_limit: null,
  config_version: 1,
  outcomes: [
    { id: '10', label: '10', points: 10 },
    { id: '100', label: '100', points: 100 },
    { id: '200', label: '200', points: 200 },
    { id: '500', label: '500', points: 500 },
    { id: '700', label: '700', points: 700 },
    { id: '1000', label: '1,000', points: 1000 },
    { id: '10000', label: '10,000', points: 10000 },
  ],
}

function localizeError(error: unknown): string {
  if (error instanceof Error && /[\u0900-\u097F]/.test(error.message)) {
    return error.message
  }
  return nepaliError('', error instanceof Error ? error.message : '')
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const requestUrl = path.startsWith('http') ? path : `${API_BASE}${path}`
  const response = await fetch(requestUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const errorCode = data?.detail?.code ?? data?.error?.code ?? ''
    const errorMessage = data?.detail?.message ?? data?.error?.message ?? ''
    throw new Error(nepaliError(errorCode, errorMessage, response.status))
  }

  return data as T
}

function getReferralCode(search: string): string | null {
  const params = new URLSearchParams(search)
  const referral = params.get('r')
  if (!referral) {
    return null
  }
  return referral.trim().toUpperCase()
}

function ShareIcon({ channel }: { channel: ShareChannel }) {
  if (channel === 'facebook') {
    return (
      <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#1877f2" />
        <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.7-.1-1.5-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V11H8v2.8h2.5V21z" fill="#fff" />
      </svg>
    )
  }

  if (channel === 'messenger') {
    return (
      <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.16 2 11.29c0 2.92 1.43 5.51 3.67 7.22.19.14.3.36.3.59l.06 1.88c.02.6.64.99 1.18.75l2.1-.93c.18-.08.38-.09.57-.04.68.18 1.4.27 2.12.27 5.52 0 10-4.16 10-9.29S17.52 2 12 2z" fill="#087cff" />
        <path d="m6.2 13.8 4.6-4.9a.7.7 0 0 1 1-.05l2.2 1.65a.7.7 0 0 0 .8.02l3-1.8c.45-.28.95.27.62.69l-4.6 4.9a.7.7 0 0 1-1 .05l-2.2-1.65a.7.7 0 0 0-.8-.02l-3 1.8c-.45.28-.95-.27-.62-.69z" fill="#fff" />
      </svg>
    )
  }

  if (channel === 'whatsapp') {
    return (
      <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#25d366" />
        <path d="M7 18.4 7.8 15a6.3 6.3 0 1 1 2.3 2.2L7 18.4Zm3.3-3.1c1.2.8 2.6 1.2 3.8.8.5-.2.9-.7 1-1.2l-1.6-.8c-.2-.1-.4-.1-.5.1l-.6.7a5.5 5.5 0 0 1-2.5-2.2l.5-.6c.1-.2.2-.4.1-.6l-.7-1.6c-.1-.2-.3-.3-.5-.2-.5.1-1 .5-1.2 1-.4 1.2.5 3.3 2.2 4.6Z" fill="#fff" />
      </svg>
    )
  }

  if (channel === 'instagram') {
    return (
      <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="instagram-share-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#ffb347" />
            <stop offset=".5" stopColor="#f04868" />
            <stop offset="1" stopColor="#8a3ab9" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#instagram-share-gradient)" />
        <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="17" cy="7.4" r="1.1" fill="#fff" />
      </svg>
    )
  }

  if (channel === 'copy') {
    return (
      <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="12" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  return (
    <svg className="share-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.7 10.5 6.6-4m-6.6 7 6.6 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    const metadata = ne.pageMetadata[location.pathname as keyof typeof ne.pageMetadata] ?? ne.pageMetadata['/']
    document.title = metadata.title
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', metadata.description)
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', metadata.title)
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', metadata.description)
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/play" element={<HomeScreen />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function LandingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationStarted = useRef(false)

  const startPlaying = () => {
    if (navigationStarted.current) return
    navigationStarted.current = true
    setIsNavigating(true)
    navigate(`/play${location.search}`)
  }

  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-brand" aria-label="Dashain Dhamaka">
          <span className="landing-brand-mark" aria-hidden="true">ध</span>
          <span className="landing-brand-copy">
            <span className="landing-brand-english">Dashain Dhamaka</span>
            <span className="landing-brand-nepali">{ne.landing.brandNepali}</span>
          </span>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-art-column">
            <div className="landing-phone-glow" aria-hidden="true" />
            <img
              className="landing-phone-image"
              src={iphoneImage}
              alt={ne.landing.imageAlt}
              fetchPriority="high"
            />
            <p className="landing-art-label">{ne.landing.decorativeArt} <span aria-hidden="true">·</span> Decorative artwork</p>
          </div>

          <div className="landing-copy">
            <p className="landing-eyebrow">{ne.landing.eyebrowNepali} <span aria-hidden="true">✦</span> {ne.landing.eyebrowEnglish}</p>
            <h1 id="landing-title">
              <span className="landing-title-english">{ne.landing.headlineEnglish}</span>
              <span className="landing-title-nepali">{ne.landing.headlineNepali}</span>
            </h1>

            <div className="landing-description">
              <p>{ne.landing.descriptionEnglish}</p>
              <p lang="ne">{ne.landing.descriptionNepali}</p>
            </div>

            <button className="landing-cta" type="button" onClick={startPlaying} disabled={isNavigating}>
              <span>{ne.landing.playEnglish}</span>
              <span className="landing-cta-divider" aria-hidden="true">·</span>
              <span lang="ne">{ne.landing.playNepali}</span>
              <span className="landing-cta-arrow" aria-hidden="true">↗</span>
            </button>

            <div className="landing-microcopy">
              <p>{ne.landing.adventureEnglish}</p>
              <p lang="ne">{ne.landing.adventureNepali}</p>
            </div>

            <aside className="landing-disclaimer" aria-label={ne.landing.disclaimerLabel}>
              <span className="landing-disclaimer-icon" aria-hidden="true">i</span>
              <div>
                <p>{ne.landing.disclaimerEnglish}</p>
                <p lang="ne">{ne.landing.disclaimerNepali}</p>
              </div>
            </aside>
          </div>
        </section>

        <footer className="landing-footer">
          <span>Dashain Dhamaka <span aria-hidden="true">·</span> {ne.landing.footer}</span>
          <nav aria-label={ne.landing.informationLabel}>
            <Link to="/rules"><span>{ne.landing.rulesEnglish}</span><span lang="ne">{ne.rules}</span></Link>
            <Link to="/privacy"><span>{ne.landing.privacyEnglish}</span><span lang="ne">{ne.privacyTitle}</span></Link>
          </nav>
        </footer>
      </div>
    </main>
  )
}

function HomeScreen() {
  const location = useLocation()
  const [state, setState] = useState<GameState>(defaultState)
  const [shareCode, setShareCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [result, setResult] = useState<{ label: string; points: number } | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const modalCloseRef = useRef<HTMLButtonElement>(null)
  const pointsRef = useRef(0)
  const pointsStorageKeyRef = useRef('')
  const remainingGoalPercent = Math.max(0, 100 - Math.floor((state.points / IPHONE_GOAL_POINTS) * 100))
  const goalProgressPercent = 100 - remainingGoalPercent

  const segmentSize = 360 / (state.outcomes.length || 1)
  const wheelStyle = useMemo(
    () => {
      const slices = state.outcomes
        .map((_, index) => `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${index * segmentSize}deg ${(index + 1) * segmentSize}deg`)
        .join(', ')
      const separatorStart = Math.max(segmentSize - 1, 0)

      return {
        transform: `rotate(${wheelRotation}deg)`,
        transition: isSpinning ? `transform ${SPIN_ANIMATION_MS}ms cubic-bezier(0.12, 0.8, 0.2, 1)` : 'transform 0.25s ease',
        backgroundImage: `repeating-conic-gradient(from -90deg, transparent 0deg ${separatorStart}deg, rgba(255, 239, 190, 0.82) ${separatorStart}deg ${segmentSize}deg), conic-gradient(from -90deg, ${slices})`,
      }
    },
    [isSpinning, segmentSize, state.outcomes, wheelRotation],
  )

  const trackEvent = useCallback(async (type: 'share_clicked' | 'link_copied' | 'referral_landing', channel?: string) => {
    const ref = getReferralCode(location.search)
    const payload = { type, channel, ref: ref ?? undefined, visit_id: crypto.randomUUID() }
    try {
      await apiRequest('/v1/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch {
      // Event tracking is best-effort only and should never block gameplay.
    }
  }, [location.search])

  const loadGame = useCallback(async () => {
    try {
      const ref = getReferralCode(location.search)
      const data = await apiRequest<SessionResponse>('/v1/sessions', {
        method: 'POST',
        body: JSON.stringify({ locale: 'ne', ref }),
      })
      const storageKey = `dashain-dhamaka-points:${data.player.public_id}`
      const storedPoints = window.localStorage.getItem(storageKey)
      const points = storedPoints === null ? data.state.points : Number(storedPoints)
      if (!Number.isSafeInteger(points) || points < 0) {
        throw new Error('स्थानीय अङ्क लोड गर्न सकिएन।')
      }
      window.localStorage.setItem(storageKey, String(points))
      pointsRef.current = points
      pointsStorageKeyRef.current = storageKey
      setShareCode(data.player.share_code)
      setState({ ...data.state, points })
      setError('')
      setNotice('')
      if (ref) {
        void trackEvent('referral_landing', 'share')
      }
    } catch (err) {
      setError(localizeError(err))
    } finally {
      setIsLoading(false)
    }
  }, [location.search, trackEvent])

  const retryLoadingGame = () => {
    setIsLoading(true)
    setError('')
    void loadGame()
  }

  const addPoints = (amount: number) => {
    const nextPoints = pointsRef.current + amount
    const storageKey = pointsStorageKeyRef.current
    if (!storageKey) {
      throw new Error('अङ्क सुरक्षित गर्न सकिएन।')
    }
    window.localStorage.setItem(storageKey, String(nextPoints))
    pointsRef.current = nextPoints
    setState((current) => ({ ...current, points: nextPoints }))
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadGame(), 0)
    return () => window.clearTimeout(timer)
  }, [loadGame])

  useEffect(() => {
    if (!modalOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    modalCloseRef.current?.focus()
    const handleModalKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusableElements = document.querySelectorAll<HTMLElement>(
        '.modal-card button, .modal-card a[href], .modal-card [tabindex]:not([tabindex="-1"])',
      )
      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleModalKeydown)
    return () => {
      document.removeEventListener('keydown', handleModalKeydown)
      previouslyFocused?.focus()
    }
  }, [modalOpen])

  const spin = async () => {
    if (isSpinning || isLoading) {
      return
    }

    try {
      setIsSpinning(true)
      setError('')
      setNotice('')
      const key = crypto.randomUUID()
      const data = await apiRequest<{ spin: { outcome_id: string; points_awarded: number; replayed: boolean }; state: GameState }>(
        '/v1/spins',
        {
          method: 'POST',
          headers: { 'Idempotency-Key': key },
          body: '{}',
        },
      )

      const outcomeIndex = data.state.outcomes.findIndex((item) => item.id === data.spin.outcome_id)
      const outcome = data.state.outcomes[outcomeIndex]
      if (!outcome || outcomeIndex < 0) {
        throw new Error('स्पिनको नतिजा लोड गर्न सकिएन।')
      }

      addPoints(data.spin.points_awarded)
      const resultSegmentSize = 360 / data.state.outcomes.length
      const targetAngle = 360 - (outcomeIndex + 0.5) * resultSegmentSize
      const currentAngle = ((wheelRotation % 360) + 360) % 360
      const alignment = (targetAngle - currentAngle + 360) % 360
      setWheelRotation(wheelRotation + 360 * 6 + alignment)
      setResult({ label: outcome.label, points: data.spin.points_awarded })
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      await new Promise<void>((resolve) => window.setTimeout(resolve, reduceMotion ? 300 : SPIN_ANIMATION_MS))
      setState({ ...data.state, points: pointsRef.current })
      setIsSpinning(false)
      setModalOpen(true)
    } catch (err) {
      setIsSpinning(false)
      setError(localizeError(err))
    }
  }

  const shareUrl = shareCode ? `${window.location.origin}/?r=${shareCode}` : window.location.origin

  const copyShareLink = async () => {
    let clipboardError: unknown
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setNotice(ne.copied)
        void trackEvent('link_copied', 'copy')
        return
      } catch (err) {
        clipboardError = err
      }
    }

    const textarea = document.createElement('textarea')
    textarea.value = shareUrl
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    let copied = false
    try {
      textarea.focus()
      textarea.select()
      copied = document.execCommand('copy')
    } finally {
      textarea.remove()
    }

    if (!copied) {
      throw clipboardError instanceof Error ? clipboardError : new Error(ne.copyFailed)
    }

    setNotice(ne.copied)
    void trackEvent('link_copied', 'copy')
  }

  const share = async (channel: ShareChannel) => {
    if (channel === 'copy') {
      await copyShareLink()
      addPoints(POINTS_PER_SHARE)
      setNotice(ne.sharePointsAwarded)
      return
    }

    if (channel === 'native' || channel === 'messenger' || channel === 'instagram') {
      if (!navigator.share) {
        await copyShareLink()
        addPoints(POINTS_PER_SHARE)
        setNotice(ne.sharePointsAwarded)
        return
      }

      await navigator.share({ title: 'Dashain Dhamaka', url: shareUrl })
      addPoints(POINTS_PER_SHARE)
      setNotice(ne.sharePointsAwarded)
      void trackEvent('share_clicked', channel)
      return
    }

    const urlMap = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    }

    if (channel === 'whatsapp' || channel === 'facebook') {
      window.open(urlMap[channel], '_self')
      addPoints(POINTS_PER_SHARE)
      setNotice(ne.sharePointsAwarded)
      void trackEvent('share_clicked', channel)
    }
  }

  const handleShare = async (channel: ShareChannel) => {
    try {
      await share(channel)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setNotice('')
      setError(localizeError(err))
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <nav className="top-links" aria-label={ne.mainNavigation}>
          <Link to="/">{ne.home}</Link>
          <Link to="/rules">{ne.rules}</Link>
          <Link to="/privacy">{ne.privacy}</Link>
          <Link to="/about">{ne.about}</Link>
        </nav>
      </header>

      <main className="layout">
        <section className="hero-card">
          <div className="wheel-panel">
            <article className="card share-card">
              <h3>{ne.shareToWin}</h3>
              <div className="share-progress-copy">
                <img src={iphoneImage} alt={ne.iphoneGoalImageAlt} />
                <span>{ne.iphoneGoalRemaining.replace('{percent}', String(remainingGoalPercent))}</span>
              </div>
              <div
                className="share-progress-track"
                role="progressbar"
                aria-label={ne.iphoneGoalProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={goalProgressPercent}
              >
                <div className="share-progress-value" style={{ width: `${goalProgressPercent}%` }} />
              </div>
              <p className="share-points-note">{ne.sharePointsNote}</p>
              <div className="share-actions">
                {([
                  ['native', ne.share],
                  ['whatsapp', 'WhatsApp'],
                  ['facebook', 'Facebook'],
                  ['messenger', 'Messenger'],
                  ['instagram', 'Instagram DM'],
                  ['copy', ne.copyLink],
                ] as const).map(([channel, label]) => (
                  <button
                    key={channel}
                    type="button"
                    className={`share-button share-${channel}`}
                    onClick={() => void handleShare(channel)}
                    disabled={isLoading}
                  >
                    <ShareIcon channel={channel} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <p className="share-link">{shareUrl}</p>
            </article>
            <article className="card wallet-card">
              <div className="card-header">
                <h3>{ne.wallet}</h3>
                <span className="wallet-total"><span aria-hidden="true">✦</span> {state.points} {ne.points}</span>
              </div>
              <p className="wallet-milestone">{ne.walletMilestone}</p>
              <p className="wallet-disclaimer">{ne.walletMilestoneDisclaimer}</p>
              <div className="wallet-stats">
                <div>
                  <strong>∞</strong>
                  <small>{ne.remaining}</small>
                </div>
                <div>
                  <strong>{state.spins_used}</strong>
                  <small>{ne.used}</small>
                </div>
                <div>
                  <strong>∞</strong>
                  <small>{ne.total}</small>
                </div>
              </div>
            </article>
            <div className="wheel-frame">
              <div
                className="wheel"
                style={wheelStyle}
                role="img"
                aria-label={`${ne.wheel}: ${state.outcomes.map((outcome) => `${outcome.label} ${ne.points}`).join(', ')}`}
              >
                {state.outcomes.map((outcome, index) => (
                  <div
                    key={outcome.id}
                    className="wheel-label"
                    aria-hidden="true"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${(index + 0.5) * segmentSize}deg) translateY(-31cqi) rotate(-${(index + 0.5) * segmentSize}deg)`,
                    }}
                  >
                    {outcome.label}
                  </div>
                ))}
                <div className="wheel-hub" aria-hidden="true">ध</div>
              </div>
              <div className="wheel-pointer" aria-hidden="true" />
            </div>
            <button type="button" className="spin-button" onClick={spin} disabled={isSpinning || isLoading} aria-busy={isSpinning}>
              {isSpinning ? ne.spinning : ne.spin}
            </button>
            <p className="spin-count">{ne.unlimitedSpins} · {state.spins_used} {ne.spinsPlayed}</p>
          </div>
        </section>

        <section id="rules" className="card rules-card">
          <h3>{ne.howToPlay}</h3>
          <ol>
            {ne.howToPlaySteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section id="privacy" className="card rules-card">
          <h3>{ne.privacyAndFairPlay}</h3>
          <p>{ne.privacySummary}</p>
        </section>

        {isLoading && <p className="status-banner" role="status">{ne.loading}</p>}
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={retryLoadingGame}>{ne.retry}</button>
          </div>
        )}
        {notice && <p className="status-banner" role="status">{notice}</p>}
      </main>

      <aside className="ad-slot" aria-label={ne.adSlot}>{ne.adSlot}</aside>
      <SiteFooter />

      {modalOpen && result && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spin-result-title"
          aria-describedby="spin-result-description"
        >
          <div className="modal-card">
            <p className="modal-kicker">{ne.result}</p>
            <h3 id="spin-result-title">{ne.congratulations}</h3>
            <p className="modal-score">{result.points} {ne.points}</p>
            <p id="spin-result-description">{ne.resultDescription.replace('{label}', result.label)}</p>
            <p className="prize-disclaimer">{ne.resultDisclaimer}</p>
            <button type="button" ref={modalCloseRef} onClick={() => setModalOpen(false)}>{ne.close}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function RulesPage() {
  return (
    <div className="page-shell policy-page">
      <header className="topbar compact-topbar">
        <div className="brand-wrap">
          <div className="crest">ध</div>
          <div>
            <p className="eyebrow">{ne.rules}</p>
            <h1>Dashain Dhamaka</h1>
          </div>
        </div>
        <nav className="top-links" aria-label={ne.mainNavigation}>
          <Link to="/">{ne.home}</Link>
          <Link to="/privacy">{ne.privacy}</Link>
          <Link to="/about">{ne.about}</Link>
        </nav>
      </header>

      <main className="policy-card">
        <h2>{ne.rulesTitle}</h2>
        <ul>
          {ne.ruleStatements.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>

        <h3>{ne.wheelOdds}</h3>
        <ul>
          {ne.odds.map(([amount, chance]) => <li key={amount}>{amount} अङ्क — {chance}</li>)}
        </ul>
        <p>{ne.randomness}</p>
        <p>{ne.exhausted}</p>
      </main>
      <SiteFooter />
    </div>
  )
}

function PrivacyPage() {
  return (
    <div className="page-shell policy-page">
      <header className="topbar compact-topbar">
        <div className="brand-wrap">
          <div className="crest">ध</div>
          <div>
            <p className="eyebrow">{ne.privacy}</p>
            <h1>Dashain Dhamaka</h1>
          </div>
        </div>
        <nav className="top-links" aria-label={ne.mainNavigation}>
          <Link to="/">{ne.home}</Link>
          <Link to="/rules">{ne.rules}</Link>
          <Link to="/about">{ne.about}</Link>
        </nav>
      </header>

      <main className="policy-card">
        <h2>{ne.privacyTitle}</h2>
        {ne.privacyParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </main>
      <SiteFooter />
    </div>
  )
}

function AboutPage() {
  return (
    <div className="page-shell policy-page">
      <header className="topbar compact-topbar">
        <div className="brand-wrap">
          <div className="crest">ध</div>
          <div>
            <p className="eyebrow">{ne.about}</p>
            <h1>Dashain Dhamaka</h1>
          </div>
        </div>
        <nav className="top-links" aria-label={ne.mainNavigation}>
          <Link to="/">{ne.home}</Link>
          <Link to="/rules">{ne.rules}</Link>
          <Link to="/privacy">{ne.privacy}</Link>
        </nav>
      </header>

      <main className="policy-card">
        <h2>{ne.aboutTitle}</h2>
        {ne.aboutParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="brand-wrap footer-brand">
        <div className="crest">ध</div>
        <div>
          <p className="eyebrow">{ne.brandEyebrow}</p>
          <h2>Dashain Dhamaka</h2>
        </div>
      </div>
      <span>{ne.footerTagline}</span>
      <p className="site-footer-disclaimer">{ne.virtualNotice}</p>
      <nav aria-label={ne.moreInformation}>
        <Link to="/rules">{ne.rules}</Link>
        <Link to="/privacy">{ne.privacyTitle}</Link>
        <Link to="/about">{ne.about}</Link>
      </nav>
    </footer>
  )
}

export default App
