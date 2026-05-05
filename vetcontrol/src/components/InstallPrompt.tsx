import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isInStandaloneMode = () =>
    ('standalone' in navigator && (navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem('pwa-dismissed')) return

    if (isIOS()) {
      setShowIOS(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowAndroid(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowAndroid(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', '1')
    setShowAndroid(false)
    setShowIOS(false)
  }

  if (!showAndroid && !showIOS) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'white',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {/* Barra verde superior */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #0F6E56, #1D9E75)' }} />

        <div style={{ padding: '20px 20px 24px' }}>
          {/* Encabezado */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: '#0F6E56', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px', fontWeight: '700',
                color: 'white', fontFamily: 'system-ui, sans-serif', flexShrink: 0,
              }}>
                VC
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>VetControl</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Gestión de turnos</div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              ✕
            </button>
          </div>

          {showAndroid && (
            <>
              <p style={{ fontSize: '14px', color: '#555', margin: '0 0 16px', lineHeight: '1.5' }}>
                Instala la app en tu celular para acceder más rápido, sin abrir el navegador.
              </p>
              <button
                onClick={handleInstall}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(15,110,86,0.4)',
                }}
              >
                <span style={{ fontSize: '18px' }}>📲</span>
                Instalar en pantalla de inicio
              </button>
            </>
          )}

          {showIOS && (
            <>
              <p style={{ fontSize: '14px', color: '#555', margin: '0 0 14px', lineHeight: '1.5' }}>
                Agrega VetControl a tu pantalla de inicio siguiendo estos pasos:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>1️⃣</span>
                  <span style={{ fontSize: '13px', color: '#444' }}>
                    Toca el botón <strong>Compartir</strong> <span style={{ fontSize: '16px' }}>⬆</span> en la barra inferior de Safari
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>2️⃣</span>
                  <span style={{ fontSize: '13px', color: '#444' }}>
                    Desplázate y selecciona <strong>"Añadir a la pantalla de inicio"</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>3️⃣</span>
                  <span style={{ fontSize: '13px', color: '#444' }}>
                    Toca <strong>"Agregar"</strong> en la esquina superior derecha
                  </span>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                style={{
                  width: '100%', padding: '13px',
                  background: '#E1F5EE', color: '#0F6E56',
                  border: '1.5px solid #9FE1CB', borderRadius: '12px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Entendido
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
