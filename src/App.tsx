import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthPanel } from './components/AuthPanel'
import { Dashboard } from './components/Dashboard'
import { LegalPage } from './components/LegalPage'
import { Marketing } from './components/Marketing'
import { PublicInvitation } from './components/PublicInvitation'
import { ResetPasswordPage } from './components/ResetPasswordPage'
import { RsvpConfirmation } from './components/RsvpConfirmation'
import { OtpExpiredPage } from './components/OtpExpiredPage'
import { supabase } from './lib/supabase'
import { getPlatformDomain, normalizeDomain } from './utils/domain'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [, setRouteKey] = useState(`${window.location.pathname}${window.location.hash || '#home'}`)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    const onRouteChange = () => setRouteKey(`${window.location.pathname}${window.location.hash || '#home'}`)
    window.addEventListener('hashchange', onRouteChange)
    window.addEventListener('popstate', onRouteChange)
    return () => {
      data.subscription.unsubscribe()
      window.removeEventListener('hashchange', onRouteChange)
      window.removeEventListener('popstate', onRouteChange)
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    window.location.hash = '#home'
  }

  const currentHost = normalizeDomain(window.location.host)
  const platformHost = getPlatformDomain()
  const isLocalHost = ['localhost', '127.0.0.1'].includes(currentHost.split(':')[0])
  const isCustomDomainRequest = currentHost && currentHost !== platformHost && !isLocalHost
  const path = window.location.pathname.replace(/\/$/, '')
  const hashRoute = window.location.hash.replace(/^#/, '')
  const hash = window.location.hash || '#home'

  // Detectar error de OTP expirado
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('error_code') === 'otp_expired') {
    return <OtpExpiredPage />
  }

  // Detectar si estamos en reset de password con token válido
  if (path === '/auth/reset-password' || hashRoute.includes('access_token') && searchParams.get('type') === 'recovery') {
    return <ResetPasswordPage />
  }

  if (path === '/terminos' || hash === '#terms') {
    return <LegalPage type="terms" />
  }

  if (path === '/privacidad' || hash === '#privacy') {
    return <LegalPage type="privacy" />
  }

  const customDomainRsvpMatch = path.match(/^\/confirmar\/([^/]+)$/) ?? hashRoute.match(/^\/confirmar\/([^/]+)$/)

  if (isCustomDomainRequest) {
    if (customDomainRsvpMatch) {
      return <RsvpConfirmation confirmationId={customDomainRsvpMatch[1]} customDomain={currentHost} />
    }
    return <PublicInvitation customDomain={currentHost} />
  }

  const rsvpMatch =
    path.match(/^\/evento\/([^/]+)\/confirmar\/([^/]+)$/) ??
    hashRoute.match(/^\/evento\/([^/]+)\/confirmar\/([^/]+)$/)
  if (rsvpMatch) {
    return <RsvpConfirmation slug={rsvpMatch[1]} confirmationId={rsvpMatch[2]} />
  }

  const pathPublicMatch = path.match(/^\/evento\/([^/]+)$/)
  if (pathPublicMatch) {
    return <PublicInvitation slug={pathPublicMatch[1]} />
  }

  const publicMatch = window.location.hash.match(/^#\/(?:i|evento)\/(.+)$/)
  if (publicMatch) {
    return <PublicInvitation slug={publicMatch[1]} />
  }

  if (path === '/auth/reset-password') {
    return <AuthPanel key="reset-password" initialMode="reset" onDone={() => (window.location.hash = '#app')} />
  }

  if (hash === '#auth') {
    return <AuthPanel key="auth" onDone={() => (window.location.hash = '#app')} />
  }

  if (hash === '#app') {
    return session ? <Dashboard session={session} onLogout={logout} /> : <AuthPanel key="auth-app" onDone={() => (window.location.hash = '#app')} />
  }

  return (
    <Marketing
      session={session}
      onStart={() => (window.location.hash = session ? '#app' : '#auth')}
      onOpenDashboard={() => (window.location.hash = '#app')}
    />
  )
}

export default App
