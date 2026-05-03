import { useState } from 'react'
import { supabase } from '../lib/supabase'
import dogLogo from '../assets/logo.jpg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Header verde */}
        <div style={{ background: '#0F6E56', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={dogLogo} alt="VETSHIFT" style={{ width: '96px', height: '96px', borderRadius: '22px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)', marginBottom: '14px' }} />
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: '500', letterSpacing: '0.06em', margin: 0 }}>VETSHIFT</h1>
        </div>

        {/* Formulario */}
        <div style={{ padding: '28px' }}>
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

          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#888', padding: '10px 12px', background: '#f5f5f0', borderRadius: '8px', borderLeft: '3px solid #1D9E75', marginBottom: '20px', lineHeight: '1.5' }}>
            Los roles <strong>Admin</strong> y <strong>Coordinador</strong> se asignan por correo. El resto ingresa como <strong>Empleado</strong>.
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#ccc' : '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

      </div>
    </div>
  )
}