import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BrandLogo } from './BrandLogo'

type ResetState = 'loading' | 'ready' | 'success' | 'error'

export function ResetPasswordPage() {
  const [state, setState] = useState<ResetState>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Supabase emite PASSWORD_RECOVERY cuando detecta el token en la URL.
    // Con hash routing el token llega como fragmento (#access_token=...&type=recovery)
    // y el SDK lo procesa automáticamente al inicializarse.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token válido — mostrar el formulario
        setState('ready')
      } else if (event === 'SIGNED_IN') {
        // Puede llegar antes que PASSWORD_RECOVERY en algunos casos
        setState('ready')
      }
    })

    // Si después de 4s no llegó el evento, el token es inválido o ya expiró
    const timeout = setTimeout(() => {
      setState((current) => current === 'loading' ? 'error' : current)
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit() {
    if (password !== confirm) {
      setMessage('Los passwords no coinciden.')
      return
    }
    if (password.length < 6) {
      setMessage('El password debe tener al menos 6 caracteres.')
      return
    }

    setBusy(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setState('success')
  }

  function goToLogin() {
    window.location.hash = '#login'
  }

  // ── Estados ────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <main className="rsvp-shell">
        <p className="public-message">Verificando enlace...</p>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="auth-screen">
        <div className="auth-panel">
          <a className="brand" href="#home">
            <BrandLogo />
          </a>
          <h1>Enlace inválido</h1>
          <p className="form-note">
            Este enlace para restablecer tu password ya expiró o no es válido.
            Solicita uno nuevo desde la pantalla de login.
          </p>
          <button className="primary-button full mt-4" type="button" onClick={goToLogin}>
            Volver al login
          </button>
        </div>
      </main>
    )
  }

  if (state === 'success') {
    return (
      <main className="auth-screen">
        <div className="auth-panel">
          <a className="brand" href="#home">
            <BrandLogo />
          </a>
          <h1>¡Password actualizado!</h1>
          <p className="form-note">
            Tu password fue cambiado correctamente. Ya puedes entrar a tu cuenta.
          </p>
          <button className="primary-button full mt-4" type="button" onClick={goToLogin}>
            Ir al login
          </button>
        </div>
      </main>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────────

  return (
    <main className="auth-screen">
      <div className="auth-panel">
        <a className="brand" href="#home">
          <BrandLogo />
        </a>
        <h1>Nuevo password</h1>
        <p className="form-note">Elige un password nuevo de al menos 6 caracteres.</p>

        <label className="mt-2">
          Nuevo password
          <input
            autoComplete="new-password"
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="mt-2">
          Confirmar password
          <input
            autoComplete="new-password"
            minLength={6}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        {message && <p className="form-note" style={{ color: '#c0392b' }}>{message}</p>}

        <button
          className="primary-button full mt-4"
          disabled={busy || password.length < 6 || confirm.length < 6}
          type="button"
          onClick={handleSubmit}
        >
          {busy ? 'Guardando...' : 'Guardar nuevo password'}
        </button>
      </div>
    </main>
  )
}