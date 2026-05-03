import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Turno {
  servicio: string
  turno: string
}

interface Props {
  session: any
}

const SERVICIOS = [
  { key: 'canil_principal', label: 'Canil Principal', emoji: '🏥', color: '#1D9E75', bg: '#E1F5EE' },
  { key: 'canil_secundario', label: 'Canil Secundario', emoji: '🏨', color: '#378ADD', bg: '#E6F1FB' },
  { key: 'bombero', label: 'Bombero', emoji: '🚒', color: '#E24B4A', bg: '#FCEBEB' },
]

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Dashboard({ session }: Props) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [veterinario, setVeterinario] = useState<string>('')
  const [administrador, setAdministrador] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const email = session?.user?.email
  const nombre = email?.split('@')[0] || 'Usuario'

  useEffect(() => {
    fetchTurnos()
  }, [])

  const fetchTurnos = async () => {
    setLoading(true)

    // Obtener semana actual (lunes de esta semana)
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const semana = lunes.toISOString().split('T')[0]

    // Turnos del usuario actual
    const { data: misTurnos } = await supabase
      .from('turnos')
      .select('servicio, turno')
      .eq('semana', semana)
      .eq('usuario', email)

    // Veterinario de turno
    const { data: vet } = await supabase
      .from('turnos')
      .select('usuario, turno')
      .eq('semana', semana)
      .eq('servicio', 'veterinario')
      .limit(1)

    // Administrador
    const { data: admin } = await supabase
      .from('roles')
      .select('email')
      .eq('role', 'admin')
      .limit(1)

    if (misTurnos) setTurnos(misTurnos)
    if (vet && vet.length > 0) setVeterinario(`${vet[0].usuario} · ${vet[0].turno}`)
    if (admin && admin.length > 0) setAdministrador(admin[0].email)

    setLoading(false)
  }

  const getTurno = (servicioKey: string): Turno | null => {
    return turnos.find(t => t.servicio === servicioKey) || null
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Fecha semana actual
  const hoy = new Date()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const semanaTexto = `${lunes.getDate()} ${lunes.toLocaleString('es', { month: 'short' })} — ${domingo.getDate()} ${domingo.toLocaleString('es', { month: 'short' })} ${domingo.getFullYear()}`

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f0' }}>
        <div style={{ color: '#0F6E56' }}>Cargando turnos...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ background: '#0F6E56', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Bienvenido de vuelta</div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: 'white' }}>{nombre}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
              ↩
            </button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>Semana actual</div>
              <div style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>{semanaTexto}</div>
            </div>
            <span style={{ padding: '4px 10px', background: '#9FE1CB', color: '#085041', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
              {turnos.length > 0 ? 'En servicio' : 'Free'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px' }}>

          {/* Siempre visible: veterinario y admin */}
          {veterinario && (
            <div style={{ borderLeft: '3px solid #5DCAA5', padding: '10px 12px', background: '#E1F5EE', borderRadius: '0 8px 8px 0', marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: '#085041', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Veterinario de turno</div>
              <div style={{ fontSize: '13px', color: '#0F6E56', fontWeight: '500' }}>{veterinario}</div>
            </div>
          )}
          {administrador && (
            <div style={{ borderLeft: '3px solid #B5D4F4', padding: '10px 12px', background: '#E6F1FB', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: '#185FA5', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrador</div>
              <div style={{ fontSize: '13px', color: '#185FA5', fontWeight: '500' }}>{administrador}</div>
            </div>
          )}

          <div style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mis servicios asignados
          </div>

          {/* Tarjetas de servicio */}
          {SERVICIOS.map(servicio => {
            const turno = getTurno(servicio.key)
            return (
              <div key={servicio.key} style={{ background: 'white', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden', border: '0.5px solid #eee' }}>
                <div style={{ height: '3px', background: servicio.color }} />
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: turno ? '10px' : '0' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: servicio.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {servicio.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>{servicio.label}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{turno ? turno.turno : 'Sin asignación'}</div>
                    </div>
                    {!turno && (
                      <spa