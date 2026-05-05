import { useState } from 'react'
import { supabase } from '../lib/supabase'
import dogLogo from '../assets/logo.png'

export default function Login() {
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cuentaCreada, setCuentaCreada] = useState(false)
  const [logoOpen, setLogoOpen] = useState(false)

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const cambiarModo = (nuevoModo: 'login' | 'registro') => {
    resetForm()
    setModo(nuevoModo)
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      setLoading(false)
      return
    }

    const { error, data } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    if (data.user) {
      localStorage.setItem('userFullName', fullName.trim())
      await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
    }

    setLoading(false)
  }

  const handleRegistro = async () => {
    setLoading(true)
    setError('')

    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      setLoading(false)
      return
    }
    if (!email.trim()) {
      setError('El correo electrónico es requerido')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este correo ya está registrado'
        : `Error al registrar: ${error.message}`)
      setLoading(false)
      return
    }

    resetForm()
    setLoading(false)
    setCuentaCreada(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Header verde */}
        <div style={{ background: '#0F6E56', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={dogLogo}
            alt="VETSHIFT"
            onClick={() => setLogoOpen(true)}
            style={{ width: '96px', height: '96px', borderRadius: '22px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)', marginBottom: '14px', cursor: 'zoom-in' }}
          />
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '500', letterSpacing: '0.06em', margin: 0 }}>VETSHIFT</h1>
        </div>

        {/* Toggle login / registro */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button
            onClick={() => cambiarModo('login')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500',
              color: modo === 'login' ? '#0F6E56' : '#aaa',
              borderBottom: modo === 'login' ? '2px solid #0F6E56' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Ingresar
          </button>
          <button
            onClick={() => cambiarModo('registro')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500',
              color: modo === 'registro' ? '#0F6E56' : '#aaa',
              borderBottom: modo === 'registro' ? '2px solid #0F6E56' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Crear cuenta
          </button>
        </div>

        {/* Formulario */}
        <div style={{ padding: '28px' }}>

          {/* Nombre completo */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nombre completo"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Confirmar contraseña — solo en registro */}
          {modo === 'registro' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          {/* Hint */}
          {modo === 'login' && (
            <div style={{ fontSize: '12px', color: '#888', padding: '10px 12px', background: '#f5f5f0', borderRadius: '8px', borderLeft: '3px solid #1D9E75', marginBottom: '20px', lineHeight: '1.5' }}>
              Ingresa tu <strong>nombre completo</strong> tal como aparece en el archivo de turnos.
            </div>
          )}
          {modo === 'registro' && (
            <div style={{ fontSize: '12px', color: '#888', padding: '10px 12px', background: '#f5f5f0', borderRadius: '8px', borderLeft: '3px solid #1D9E75', marginBottom: '20px', lineHeight: '1.5' }}>
              Usá el <strong>nombre completo</strong> que el coordinador cargó en la planilla de turnos.
            </div>
          )}

          {/* Botón principal */}
          <button
            onClick={modo === 'login' ? handleLogin : handleRegistro}
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading
              ? (modo === 'login' ? 'Ingresando...' : 'Creando cuenta...')
              : (modo === 'login' ? 'Ingresar' : 'Crear cuenta')}
          </button>

        </div>
      </div>

      {/* Modal cuenta creada */}
      {cuentaCreada && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '36px 28px',
            maxWidth: '340px', width: '100%', textAlign: 'center',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#E1F5EE', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px',
            }}>
              ✅
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F6E56', marginBottom: '10px' }}>
              ¡Usuario creado con éxito!
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              Tu cuenta fue creada correctamente. Revisá tu correo para confirmar el registro y luego podés ingresar.
            </div>
            <button
              onClick={() => { setCuentaCreada(false); cambiarModo('login') }}
              style={{
                width: '100%', padding: '13px',
                background: '#0F6E56', color: 'white',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: '500', cursor: 'pointer',
              }}
            >
              Ir a Ingresar
            </button>
          </div>
        </div>
      )}

      {/* Lightbox logo */}
      {logoOpen && (
        <div
          onClick={() => setLogoOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={dogLogo}
            alt="VETSHIFT"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', objectFit: 'contain' }}
          />
          <button
            onClick={() => setLogoOpen(false)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: '36px', height: '36px',
              color: 'white', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
