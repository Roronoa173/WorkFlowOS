import { useState, useEffect, useRef } from 'react'

export default function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const pageRef = useRef(null)   // login-page container (CSS vars + mouse events)
  const bgRef   = useRef(null)   // layer 1 — deep background blobs    (subtlest, 0.20x)
  const midRef  = useRef(null)   // layer 2 — mid atmospheric blob     (moderate, 0.38x)
  const fgRef   = useRef(null)   // layer 3 — foreground network nodes (most,     0.60x)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    // Normalization targets (-1 to +1 from screen center)
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let rafId

    const onPointerMove = (e) => {
      const w = window.innerWidth || 1920
      const h = window.innerHeight || 1080
      const nx = Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1))
      const ny = Math.max(-1, Math.min(1, (e.clientY / h) * 2 - 1))
      target.x = nx
      target.y = ny

      if (pageRef.current) {
        const pctX = ((nx + 1) * 50).toFixed(1)
        const pctY = ((ny + 1) * 50).toFixed(1)
        pageRef.current.style.setProperty('--mouse-x', `${pctX}%`)
        pageRef.current.style.setProperty('--mouse-y', `${pctY}%`)
      }
    }

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      current.x = lerp(current.x, target.x, 0.08)
      current.y = lerp(current.y, target.y, 0.08)

      // Background layer: ~20px horizontal, ~14px vertical (shifts opposite to mouse)
      if (bgRef.current) {
        bgRef.current.style.transform =
          `translate3d(${(-current.x * 20).toFixed(2)}px, ${(-current.y * 14).toFixed(2)}px, 0)`
      }

      // Middle layer: ~38px horizontal, ~25px vertical
      if (midRef.current) {
        midRef.current.style.transform =
          `translate3d(${(-current.x * 38).toFixed(2)}px, ${(-current.y * 25).toFixed(2)}px, 0)`
      }

      // Foreground network layer: ~55px horizontal, ~38px vertical
      if (fgRef.current) {
        fgRef.current.style.transform =
          `translate3d(${(-current.x * 55).toFixed(2)}px, ${(-current.y * 38).toFixed(2)}px, 0)`
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mousemove', onPointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    onLogin({ email })
  }

  const handleGoogle = () => onLogin({ email: 'demo@workflowos.ai' })

  return (
    <div className="login-page" ref={pageRef}>

      {/* ── Layer 1: Deep background atmospheric blobs (subtlest parallax) ── */}
      <div className="lp-layer" ref={bgRef} aria-hidden="true">
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
      </div>

      {/* ── Layer 2: Mid atmospheric glow (moderate parallax) ── */}
      <div className="lp-layer" ref={midRef} aria-hidden="true">
        <div className="lp-blob lp-blob-3" />
      </div>

      {/* ── Layer 3: Decorative workflow network nodes (most parallax) ── */}
      <div className="lp-layer" ref={fgRef} aria-hidden="true">
        <svg
          className="lp-nodes-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection lines — workflow graph abstraction */}
          <line x1="10" y1="16" x2="32" y2="30" stroke="rgba(79,126,255,0.32)" strokeWidth="0.22"/>
          <line x1="32" y1="30" x2="55" y2="18" stroke="rgba(79,126,255,0.28)" strokeWidth="0.22"/>
          <line x1="55" y1="18" x2="84" y2="36" stroke="rgba(79,126,255,0.26)" strokeWidth="0.22"/>
          <line x1="32" y1="30" x2="20" y2="58" stroke="rgba(139,92,246,0.30)" strokeWidth="0.22"/>
          <line x1="20" y1="58" x2="44" y2="74" stroke="rgba(139,92,246,0.24)" strokeWidth="0.22"/>
          <line x1="84" y1="36" x2="92" y2="62" stroke="rgba(79,126,255,0.21)" strokeWidth="0.22"/>
          <line x1="84" y1="36" x2="68" y2="66" stroke="rgba(79,126,255,0.20)" strokeWidth="0.22"/>
          <line x1="44" y1="74" x2="68" y2="66" stroke="rgba(139,92,246,0.17)" strokeWidth="0.22"/>
          <line x1="55" y1="18" x2="68" y2="10" stroke="rgba(79,126,255,0.18)" strokeWidth="0.18"/>
          <line x1="10" y1="16" x2="4"  y2="40" stroke="rgba(139,92,246,0.16)" strokeWidth="0.18"/>

          {/* Process nodes */}
          <circle cx="10"  cy="16"  r="0.90" fill="rgba(79,126,255,0.55)"/>
          <circle cx="32"  cy="30"  r="1.35" fill="rgba(79,126,255,0.68)"/>
          <circle cx="55"  cy="18"  r="0.85" fill="rgba(139,92,246,0.58)"/>
          <circle cx="84"  cy="36"  r="1.18" fill="rgba(79,126,255,0.62)"/>
          <circle cx="92"  cy="62"  r="0.75" fill="rgba(79,126,255,0.46)"/>
          <circle cx="20"  cy="58"  r="0.88" fill="rgba(139,92,246,0.52)"/>
          <circle cx="44"  cy="74"  r="0.78" fill="rgba(79,126,255,0.44)"/>
          <circle cx="68"  cy="66"  r="0.92" fill="rgba(139,92,246,0.50)"/>
          <circle cx="68"  cy="10"  r="0.65" fill="rgba(79,126,255,0.40)"/>
          <circle cx="4"   cy="40"  r="0.60" fill="rgba(139,92,246,0.38)"/>

          {/* Outer glow rings on primary nodes */}
          <circle cx="32"  cy="30"  r="2.8"  fill="none" stroke="rgba(79,126,255,0.18)" strokeWidth="0.28"/>
          <circle cx="84"  cy="36"  r="2.4"  fill="none" stroke="rgba(79,126,255,0.15)" strokeWidth="0.28"/>
          <circle cx="55"  cy="18"  r="2.0"  fill="none" stroke="rgba(139,92,246,0.14)" strokeWidth="0.24"/>
        </svg>
      </div>

      {/* ── Login Card (z-index: 10 via CSS — sits above all decorative layers) ── */}
      <div className="login-box">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="5"  cy="12" r="3.5" fill="var(--accent)" />
              <circle cx="19" cy="5"  r="3.5" fill="var(--accent)" opacity="0.65" />
              <circle cx="19" cy="19" r="3.5" fill="var(--accent)" opacity="0.4"  />
              <line x1="7.8" y1="10.8" x2="16.4" y2="6.8"  stroke="var(--accent)" strokeWidth="1.4" strokeOpacity="0.45"/>
              <line x1="7.8" y1="13.2" x2="16.4" y2="17.2" stroke="var(--accent)" strokeWidth="1.4" strokeOpacity="0.45"/>
            </svg>
          </div>
          <span className="login-logo-name">WorkFlowOS</span>
        </div>

        <h2 className="login-heading">Sign in to your workspace</h2>
        <p className="login-sub">AI-powered workflow automation</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="login-email">Work email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-btn-primary">
            Continue
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>

        <button type="button" className="login-btn-google" onClick={handleGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="login-signup-link">
          Don&apos;t have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  )
}
