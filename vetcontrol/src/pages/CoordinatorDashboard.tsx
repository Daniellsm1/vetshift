import { useState } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'

interface Props {
  session: any
  role: string
  onPreviewDashboard: () => void
}

interface TurnoExcel {
  usuario: string
  servicio: string
  turno: string
}

const SERVICIOS_VALIDOS = ['canil_principal', 'canil_secundario', 'bombero', 'veterinario', 'administrador']

export default function CoordinatorDashboard({ session, role, onPreviewDashboard }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [turnos, setTurnos] = useState<TurnoExcel[]>([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const email = session?.user?.email
  const nombre = email?.split('@')[0] || 'Coordinador'

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setMensaje('')
    setError('')

    // Leer el Excel con SheetJS
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const hoja = workbook.Sheets[workbook.SheetNames[0]]
      const filas: any[] = XLSX.utils.sheet_to_json(hoja, { header: 1 })

      const resultado: TurnoExcel[] = []

      // Recorrer filas (saltar la primera si es encabezado)
      filas.forEach((fila, index) => {
        if (index === 0) return // saltar encabezado
        const usuario = String(fila[0] || '').trim().toLowerCase()
        const servicio = String(fila[1] || '').trim().toLowerCase().replace(/ /g, '_')
        const turno = String(fila[2] || '').trim()

        if (usuario && servicio && turno && SERVICIOS_VALIDOS.includes(servicio)) {
          resultado.push({ usuario, servicio, turno })
        }
      })

      setTurnos(resultado)
    }
    reader.readAsBinaryString(file)
  }

  const handleSubir = async () => {
    if (turnos.length === 0) {
      setError('No se encontraron datos válidos en el archivo')
      return
    }

    setLoading(true)
    setError('')

    // Semana actual (lunes)
    const hoy = new Date()
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const semana = lunes.toISOString().split('T')[0]

    // Borrar turnos anteriores de esta semana
    const { error: deleteError } = await supabase
      .from('turnos')
      .delete()
      .eq('semana', semana)

    if (deleteError) {
      setError(`Error al limpiar turnos anteriores: ${deleteError.message}`)
      setLoading(false)
      return
    }

    // Insertar los nuevos turnos
    const { error } = await supabase
      .from('turnos')
      .insert(turnos.map(t => ({ ...t, semana })))

    if (error) {
      setError(`Error al insertar turnos: ${error.message}`)
    } else {
      setMensaje(`✓ ${turnos.length} turnos cargados correctamente para la semana del ${semana}`)
      setArchivo(null)
      setTurnos([])
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div style={{ background: '#0F6E56', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Panel de gestión</div>
              <div style={{ fontSize: '18px', fontWeight: '500', color: 'white' }}>{nombre}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '20px', fontSize: '11px' }}>
                {role}
              </span>
              <button
                onClick={onPreviewDashboard}
                title="Ver dashboard de empleado"
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', fontSize: '16px' }}
              >
                👁
              </button>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: 'white', cursor: 'pointer', fontSize: '16px' }}>
                ↩
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px' }}>

          {/* Subir Excel */}
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Subir planilla de turnos
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', border: '0.5px solid #eee' }}>

            {/* Zona de carga */}
            <label style={{ display: 'block', border: '1.5px dashed #ccc', borderRadius: '8px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {archivo ? archivo.name : 'Toca para seleccionar tu archivo Excel'}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                Formato: Col 1 = Usuario · Col 2 = Servicio · Col 3 = Turno
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleArchivo}
                style={{ display: 'none' }}
              />
            </label>

            {/* Preview de datos leídos */}
            {turnos.length > 0 && (
              <div style={{ marginTop: '14px', background: '#E1F5EE', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#085041', fontWeight: '500', marginBottom: '8px' }}>
                  {turnos.length} registros encontrados:
                </div>
                {turnos.slice(0, 5).map((t, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#0F6E56', padding: '3px 0', borderBottom: '0.5px solid #9FE1CB' }}>
                    {t.usuario} → {t.servicio.replace(/_/g, ' ')} · {t.turno}
                  </div>
                ))}
                {turnos.length > 5 && (
                  <div style={{ fontSize: '11px', color: '#3B6D11', marginTop: '4px' }}>
                    ...y {turnos.length - 5} más
                  </div>
                )}
              </div>
            )}

            {/* Mensajes */}
            {error && (
              <div style={{ marginTop: '12px', background: '#FCEBEB', color: '#A32D2D', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
                {error}
              </div>
            )}
            {mensaje && (
              <div style={{ marginTop: '12px', background: '#E1F5EE', color: '#085041', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
                {mensaje}
              </div>
            )}

            <button
              onClick={handleSubir}
              disabled={loading || turnos.length === 0}
              style={{ width: '100%', padding: '12px', background: loading || turnos.length === 0 ? '#ccc' : '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading || turnos.length === 0 ? 'not-allowed' : 'pointer', marginTop: '14px' }}
            >
              {loading ? 'Guardando...' : 'Subir y procesar planilla'}
            </button>
          </div>

          {/* Formato del Excel */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '0.5px solid #eee' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '10px' }}>
              Formato esperado del Excel
            </div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f0' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Columna 1</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Columna 2</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Columna 3</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '0.5px solid #eee' }}>
                  <td style={{ padding: '6px 8px', color: '#333' }}>usuario@email.com</td>
                  <td style={{ padding: '6px 8px', color: '#333' }}>canil_principal</td>
                  <td style={{ padding: '6px 8px', color: '#333' }}>Primer turno</td>
                </tr>
                <tr style={{ borderTop: '0.5px solid #eee' }}>
                  <td style={{ padding: '6px 8px', color: '#333' }}>otro@email.com</td>
                  <td style={{ padding: '6px 8px', color: '#333' }}>bombero</td>
                  <td style={{ padding: '6px 8px', color: '#333' }}>Segundo turno</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
              Servicios válidos: canil_principal · canil_secundario · bombero
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}