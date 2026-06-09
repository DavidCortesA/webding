import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { BrandLogo } from './BrandLogo'

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'

// Siempre apunta a producción en emails — en desarrollo el link igual funciona
// porque Supabase redirige y tu app local lo maneja vía hash/router.
const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin

export function AuthPanel({ initialMode = 'login', onDone }: { initialMode?: AuthMode; onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const titleByMode = {
    forgot: 'Recuperar password',
    login: 'Entrar a tu cuenta',
    reset: 'Nuevo password',
    signup: 'Crear cuenta',
  }

  const submitLabelByMode = {
    forgot: 'Enviar link de recuperacion',
    login: 'Login',
    reset: 'Guardar nuevo password',
    signup: 'Registrarme',
  }

  async function submit() {
    setBusy(true)
    setMessage('')

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : mode === 'signup'
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                // Redirige a la app tras confirmar el email
                emailRedirectTo: `${APP_URL}/auth/callback`,
              },
            })
          : mode === 'forgot'
            ? await supabase.auth.resetPasswordForEmail(email, {
                // Redirige a la pantalla de reset dentro de la app
                redirectTo: `${APP_URL}/auth/reset-password`,
              })
            : await supabase.auth.updateUser({ password })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (mode === 'forgot') {
      setMessage('Te enviamos un link para recuperar tu password. Revisa tu correo.')
      return
    }

    if (mode === 'signup') {
      setMessage('Cuenta creada. Revisa tu correo para confirmar tu cuenta.')
      return
    }

    if (mode === 'reset') {
      setMessage('Password actualizado. Ya puedes entrar a tu cuenta.')
      window.location.hash = '#app'
      onDone()
      return
    }

    // login exitoso
    setMessage('Sesion iniciada.')
    onDone()
  }

  const requiresPassword = mode !== 'forgot'
  const canSubmit =
    mode === 'reset'
      ? password.length >= 6
      : Boolean(email) && (requiresPassword ? password.length >= 6 : true)

  return (
    <section className="auth-screen">
      <div className="auth-panel">
        <a className="brand" href="#home">
          <BrandLogo />
        </a>
        <h1>{titleByMode[mode]}</h1>
        {mode !== 'reset' && (
          <label className="mt-2">
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        )}
        {requiresPassword && (
          <label className="mt-2">
            {mode === 'reset' ? 'Nuevo password' : 'Password'}
            <input
              autoComplete={mode === 'reset' ? 'new-password' : mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        )}
        {mode === 'reset' && (
          <p className="form-note">Escribe un password nuevo de al menos 6 caracteres.</p>
        )}
        <button
          className="primary-button full mt-4"
          disabled={busy || !canSubmit}
          type="button"
          onClick={submit}
        >
          {busy ? 'Conectando...' : submitLabelByMode[mode]}
        </button>
        <div className="auth-actions">
          {mode === 'login' && (
            <>
              <button className="link-button" type="button" onClick={() => setMode('signup')}>
                No tengo cuenta, crear una
              </button>
              <button className="link-button" type="button" onClick={() => setMode('forgot')}>
                Olvide mi password
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button className="link-button" type="button" onClick={() => setMode('login')}>
              Ya tengo cuenta
            </button>
          )}
          {mode === 'forgot' && (
            <button className="link-button" type="button" onClick={() => setMode('login')}>
              Volver al login
            </button>
          )}
        </div>
        {message && <p className="form-note">{message}</p>}
      </div>
    </section>
  )
}