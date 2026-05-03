import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CoordinatorDashboard from './pages/CoordinatorDashboard'

type UserRole = 'admin' | 'coordinador' | 'empleado' | null

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  // Emails con rol especial (cámbialos por los reales)
  const ADMIN_EMAILS = ['daniel200430@hotmail.com']
  const COORD_EMAILS = ['02468ssc@gmail.com']

  const getRole = (email: string): UserRole => {
    if (ADMIN_EMAILS.includes(email)) return 'admin'
    if (COORD_EMAILS.includes(email)) return 'coordinador'
    return 'empleado'
  }

  useEffect(() => {
    // Revisar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        setRole(getRole(session.user.email))
      }
      setLoading(false)
    })

    // Escuchar cambios de sesión (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        setRole(getRole(session.user.email))
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f0' }}>
        <div style={{ color: '#0F6E56', fontSize: '16px' }}>Cargando...</div>
      </div>
    )
  }

  // Sin sesión → mostrar login
  if (!session) return <Login />

  // Con sesión → mostrar pantalla según rol
  if (role === 'coordinador' || role === 'admin') {
    return <CoordinatorDashboard session={session} role={role} />
  }

  return <Dashboard session={session} />
}