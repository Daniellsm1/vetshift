import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Turno {
  servicio: string
  turno: string
}

interface TurnoInfo {
  usuario: string
  turno: string
}

interface Props {
  session: any
  onBack?: () => void
}

const SERVICIOS = [
  { key: 'canil_principal', label: 'Canil Principal', emoji: '🏥', color: '#1D9E75', bg: '#E1F5EE' },
  { key: 'canil_secundario', label: 'Canil Secundario', emoji: '🏨', color: '#378ADD', bg: '#E6F1FB' },
  { key: 'bombero', label: 'Bombero', emoji: '🚒', color: '#E24B4A', bg: '#FCEBEB' },
  { key: 'torre', label: 'Torre', emoji: '🗼', color: '#7C5CBF', bg: '#F0EBF9' },
]

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Dashboard({ session, onBack }: Props) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [veterinario, setVeterinario] = useState<TurnoInfo | null>(null)
  const [administrador, setAdministrador] = useState<TurnoInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const email = session?.user?.email
  const fullName = localStorage.getItem('userFullName') || ''
  const normalizedName = fullName.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const nombre = fullName || email?.split('@')[0] || 'Usuario'

  useEffect(() => {
    fetchTurnos()
  }, [])

  const fetchTurnos = async () => {
    setLoading(true)

    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const semana = lunes.toISOString().split('T')[0]

    // Turnos del usuario actual (por nombre completo ingresado en login)
    const { data: misTurnos } = await supabase
      .from('turnos')
      .select('servicio, turno')
      .eq('semana', semana)
      .eq('usuario', normalizedName)

    // Veterinario de turno (desde Excel, independiente del usuario)
    const { data: vet } = await supabase
      .from('turnos')
      .select('usuario, turno')
      .eq('semana', semana)
      .eq('servicio', 'veterinario')
      .limit(1)

    // Administrador (desde Excel, independiente del usuario)
    const { data: admin } = await supabase
      .from('turnos')
      .select('usuario, turno')
      .eq('semana', semana)
      .eq('servicio', 'administrador')
      .limit(1)

    if (misTurnos) setTurnos(misTurnos)
    setVeterinario(vet && vet.length > 0 ? { usuario: vet[0].usuario, turno: vet[0].turno } : null)
    setAdministrador(admin && admin.length > 0 ? { usuario: admin[0].usuario, turno: admin[0].turno } : null)

    setLoading(false)
  }

  const getTurno = (servicioKey: string): Turno | null => {
    return turnos.find(t => t.servicio === servicioKey) || null
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

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
            <div style={{ display: 'flex', gap: '8px' }}>
              {onBack && (
                <button onClick={onBack} title="Volver al panel de coordinador" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                  ←
                </button>
              )}
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                ↩
              </button>
            </div>
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

          <div style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mis servicios asignados
          </div>

          {/* Tarjetas servicios del usuario actual */}
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
                      <span style={{ padding: '4px 12px', background: '#EAF3DE', color: '#3B6D11', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                        Free
                      </span>
                    )}
                  </div>
                  {turno && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {DIAS.map(dia => (
                        <span key={dia} style={{ padding: '3px 8px', background: '#E1F5EE', color: '#085041', border: '0.5px solid #9FE1CB', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                          {dia}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Separador */}
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#888', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Personal de referencia
          </div>

          {/* Tarjeta Veterinario — siempre visible */}
          <div style={{ background: 'white', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden', border: '0.5px solid #eee' }}>
            <div style={{ height: '3px', background: '#1D9E75' }} />
            <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🩺
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Veterinario de turno</div>
                <div style={{ fontSize: '12px', color: veterinario ? '#0F6E56' : '#bbb' }}>
                  {veterinario ? veterinario.usuario : 'No asignado'}
                </div>
              </div>
              {veterinario && (
                <span style={{ padding: '4px 10px', background: '#E1F5EE', color: '#085041', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                  {veterinario.turno}
                </span>
              )}
            </div>
          </div>

          {/* Tarjeta Administrador — siempre visible */}
          <div style={{ background: 'white', borderRadius: '12px', marginBottom: '10px', overflow: 'hidden', border: '0.5px solid #eee' }}>
            <div style={{ height: '3px', background: '#378ADD' }} />
            <div style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                🗂️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a1a' }}>Administrador</div>
                <div style={{ fontSize: '12px', color: administrador ? '#185FA5' : '#bbb' }}>
                  {administrador ? administrador.usuario : 'No asignado'}
                </div>
              </div>
              {administrador && (
                <span style={{ padding: '4px 10px', background: '#E6F1FB', color: '#185FA5', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                  {administrador.turno}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Nota */}
        <div style={{ background: '#E6F1FB', padding: '10px 14px', borderTop: '0.5px solid #B5D4F4', margin: '0 0 16px' }}>
          <div style={{ fontSize: '11px', color: '#185FA5', lineHeight: '1.5' }}>
            <strong>Nota:</strong> Esta pantalla es de solo lectura. Para modificar tus servicios, contacta al coordinador.
          </div>
        </div>

      </div>
    </div>
  )
}
