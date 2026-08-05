import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { CATEGORIES } from '../categories.js'

export default function MissionModal({ preset, profiles, me, onClose, onSaved }) {
  const editing = preset.mission || null
  const [title, setTitle] = useState(editing?.title || '')
  const [date, setDate] = useState(editing?.date || preset.date || '')
  const [time, setTime] = useState(editing?.time ? editing.time.slice(0, 5) : '')
  const [period, setPeriod] = useState(editing?.period || preset.period || 'dia')
  const [owner, setOwner] = useState(editing ? editing.owner_profile : me.id)
  const [priority, setPriority] = useState(editing?.priority || 'secundaria')
  const [category, setCategory] = useState(editing?.category || 'outro')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    const data = {
      title,
      date,
      time: time || null,
      period: time ? (time >= '18:00' ? 'noite' : 'dia') : period,
      owner_profile: owner,
      priority,
      category,
    }
    const { error } = editing
      ? await supabase.from('missions').update(data).eq('id', editing.id)
      : await supabase.from('missions').insert({ ...data, created_by: me.id })
    setBusy(false)
    if (!error) onSaved()
  }

  const remove = async () => {
    if (!editing) return
    if (!window.confirm(`Excluir a missão "${editing.title}"?`)) return
    setBusy(true)
    await supabase.from('missions').delete().eq('id', editing.id)
    setBusy(false)
    onSaved()
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
        <div className="modal-title">{editing ? 'Editar missão' : 'Nova missão'}</div>

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
        </div>
        {owner === null ? (
          <p style={{ fontSize: 11, color: 'var(--p5-gray)', marginTop: 6 }}>
            Missão dos dois (veio de um calling card). Escolher um nome acima a torna individual.
          </p>
        ) : (
          <p style={{ fontSize: 11, color: 'var(--p5-gray)', marginTop: 6 }}>
            Missão dos dois? Manda um calling card — aceito, vira missão compartilhada.
          </p>
        )}

        <label className="p5-label">Categoria</label>
        <div className="owner-pick">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className={category === c.id ? 'on' : ''}
              style={category === c.id ? { background: c.color, color: '#101014' } : {}}
              onClick={() => setCategory(c.id)}>
              <span><i className="cat-dot" style={{ background: c.color }} /> {c.label}</span>
            </button>
          ))}
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

        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button className="p5-btn red" type="submit" disabled={busy}>
            <span>{busy ? '...' : editing ? 'Salvar' : 'Criar missão'}</span>
          </button>
          <button className="p5-btn ghost" type="button" onClick={onClose}>
            <span>Cancelar</span>
          </button>
          {editing && (
            <button className="p5-btn ghost" type="button" onClick={remove} disabled={busy}
              style={{ outlineColor: 'var(--p5-red)', color: 'var(--p5-red)', marginLeft: 'auto' }}>
              <span>Excluir</span>
            </button>
          )}
        </div>
      </motion.form>
    </div>
  )
}
