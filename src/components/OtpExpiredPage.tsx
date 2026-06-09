import { useEffect, useState } from 'react'
import { BrandLogo } from './BrandLogo'

export function OtpExpiredPage() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Extraer el email de los parámetros de la URL si está disponible
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [])

  function goToLogin() {
    window.location.hash = '#login'
  }

  function requestNewCode() {
    // Ir a la pantalla de recuperación de contraseña o solicitud de nuevo código
    window.location.hash = '#forgot-password'
  }

  return (
    <main className="auth-screen">
      <div className="auth-panel">
        <a className="brand" href="#home">
          <BrandLogo />
        </a>
        <h1>Enlace expirado</h1>
        <p className="form-note">
          El enlace de verificación en tu email ya no es válido. Los enlaces de verificación
          expiran después de un tiempo por razones de seguridad.
        </p>

        {email && (
          <p className="form-note" style={{ fontSize: '0.9em', color: '#666', marginTop: '1rem' }}>
            Email: <strong>{email}</strong>
          </p>
        )}

        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            className="primary-button full"
            type="button"
            onClick={requestNewCode}
          >
            Solicitar nuevo enlace
          </button>
          <button
            className="primary-button full"
            type="button"
            onClick={goToLogin}
            style={{ backgroundColor: '#555', borderColor: '#555' }}
          >
            Volver al login
          </button>
        </div>
      </div>
    </main>
  )
}
