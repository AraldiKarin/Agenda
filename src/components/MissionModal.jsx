import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function MissionModal({ preset, profiles, me, onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(preset.date || '')
  const [time, setTime] = useState('')
  const [period, setPeriod] = useState(preset.period || 'dia')
  const [owner, setOwner] = useState(me.id)
  const [priority, setPriority] = useState('secundaria')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.from('missions').insert({
      title,
      date,
      time: time || null,
      period: time ? (time >= '18:00' ? 'noite' : 'dia') : period,
      owner_profile: owner === 'both' ? null : owner,
      priority,
      created_by: me.id,
    })
    setBusy(false)
    if (!error) onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.form
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        initial={{ opacity: 0, y: 40, rotate: -1.5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.3, 1.3, 0.4, 1] }}
      >
        <div className="modal-title">Nova missão</div>

        <label className="p5-label" htmlFor="m-title">O que precisa ser feito</label>
        <input id="m-title" className="p5-input" required autoFocus value={title}
          placeholder="Dentista, mercado, pagar boleto..."
          onChange={(e) => setTitle(e.target.value)} />

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="p5-label" htmlFor="m-date">Data</label>
            <input id="m-date" className="p5-input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="p5-label" htmlFor="m-time">Hora (opcional)</label>
            <input id="m-time" className="p5-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        {!time && (
          <>
            <label className="p5-label">Período</label>
            <div className="owner-pick">
              {['dia', 'noite'].map((p) => (
                <button key={p} type="button" className={period === p ? 'on' : ''} onClick={() => setPeriod(p)}>
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <label className="p5-label">Missão de quem</label>
        <div className="owner-pick">
          {profiles.map((p) => (
            <button key={p.id} type="button" className={owner === p.id ? 'on' : ''} onClick={() => setOwner(p.id)}>
              <span>{p.name}</span>
            </button>
          ))}
          <button type="button" className={owner === 'both' ? 'on' : ''} onClick={() => setOwner('both')}>
            <span>Os dois</span>
          </button>
        </div>

        <label className="p5-label">Prioridade</label>
        <div className="owner-pick">
          <button type="button" className={priority === 'principal' ? 'on' : ''} onClick={() => setPriority('principal')}>
            <span>Principal</span>
          </button>
          <button type="button" className={priority === 'secundaria' ? 'on' : ''} onClick={() => setPriority('secundaria')}>
            <span>Secundária</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="p5-btn red" type="submit" disabled={busy}>
            <span>{busy ? '...' : 'Criar missão'}</span>
          </button>
          <button className="p5-btn ghost" type="button" onClick={onClose}>
            <span>Cancelar</span>
          </button>
        </div>
      </motion.form>
    </div>
  )
}
