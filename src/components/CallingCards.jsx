import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function CallingCards({ cards, me, partner, refresh }) {
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState(false)

  const received = cards.filter((c) => c.to_profile === me.id)
  const sent = cards.filter((c) => c.from_profile === me.id)

  const send = async (e) => {
    e.preventDefault()
    if (!partner) return
    setBusy(true)
    await supabase.from('calling_cards').insert({
      from_profile: me.id,
      to_profile: partner.id,
      message,
      date: date || null,
      time: time || null,
    })
    setMessage(''); setDate(''); setTime('')
    setBusy(false)
    refresh()
  }

  const setStatus = async (c, status) => {
    await supabase.from('calling_cards').update({ status }).eq('id', c.id)
    if (status === 'aceito' && c.date) {
      await supabase.from('missions').insert({
        title: c.message.length > 60 ? c.message.slice(0, 57) + '...' : c.message,
        date: c.date,
        time: c.time,
        period: c.time && c.time >= '18:00' ? 'noite' : 'dia',
        owner_profile: null,
        priority: 'principal',
        created_by: me.id,
      })
    }
    refresh()
  }

  const CardItem = ({ c, mine }) => (
    <motion.div className="calling-card" style={{ transform: `rotate(${mine ? 1 : -1}deg)` }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <span className={`tag cc-badge ${c.status === 'aceito' ? 'dark' : 'red'}`}>
        <span>{mine ? 'enviado' : 'recebido'} · {c.status}</span>
      </span>
      <p className="cc-msg">“{c.message}”</p>
      <p className="cc-meta">
        {mine ? `para ${partner?.name || '?'}` : `de ${partner?.name || '?'}`}
        {c.date && ` · ${c.date.split('-').reverse().join('/')}`}
        {c.time && ` às ${c.time.slice(0, 5)}`}
      </p>
      {!mine && c.status === 'pendente' && (
        <div className="cc-actions">
          <button className="p5-btn" style={{ background: 'var(--p5-black)', color: 'var(--p5-white)' }} onClick={() => setStatus(c, 'aceito')}>
            <span>Aceitar</span>
          </button>
          <button className="p5-btn ghost" style={{ outlineColor: 'var(--p5-black)', color: 'var(--p5-black)' }} onClick={() => setStatus(c, 'negociando')}>
            <span>Negociar</span>
          </button>
        </div>
      )}
    </motion.div>
  )

  return (
    <>
      <header className="p5-header">
        <div className="inner">
          <div className="date-big">Calling <span style={{ color: '#3d0a0c' }}>cards</span></div>
        </div>
      </header>

      <main className="view-wrap">
        {partner ? (
          <form onSubmit={send} className="login-box" style={{ maxWidth: '100%', marginBottom: 10 }}>
            <div className="modal-title">Enviar aviso para {partner.name}</div>
            <label className="p5-label" htmlFor="cc-msg">Mensagem</label>
            <input id="cc-msg" className="p5-input" required value={message} maxLength={140}
              placeholder="Sexta, 20h. Cinema. Sua presença é inegociável."
              onChange={(e) => setMessage(e.target.value)} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="p5-label" htmlFor="cc-date">Data (opcional)</label>
                <input id="cc-date" className="p5-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="p5-label" htmlFor="cc-time">Hora (opcional)</label>
                <input id="cc-time" className="p5-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="p5-btn red" type="submit" disabled={busy}>
                <span>{busy ? '...' : 'Mandar o cartão'}</span>
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--p5-gray)', marginTop: 10 }}>
              Se tiver data, ao ser aceito vira missão dos dois automaticamente.
            </p>
          </form>
        ) : (
          <p style={{ color: 'var(--p5-gray)' }}>Crie o segundo perfil pra poder enviar calling cards.</p>
        )}

        {received.length > 0 && <div className="section-title">RECEBIDOS</div>}
        {received.map((c) => <CardItem key={c.id} c={c} mine={false} />)}

        {sent.length > 0 && <div className="section-title">ENVIADOS</div>}
        {sent.map((c) => <CardItem key={c.id} c={c} mine={true} />)}
      </main>
    </>
  )
}
