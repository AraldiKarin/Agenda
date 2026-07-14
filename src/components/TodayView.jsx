import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

const DOW = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TodayView({ missions, cards, profiles, me, partner, onNew, refresh }) {
  const [splash, setSplash] = useState(false)
  const iso = todayISO()
  const now = new Date()

  const todays = missions.filter((m) => m.date === iso)
  const principal = todays.filter((m) => m.priority === 'principal' && !m.done)
  const secundarias = todays.filter((m) => m.priority === 'secundaria' && !m.done)
  const done = todays.filter((m) => m.done)

  const pendingCard = cards.find((c) => c.status === 'pendente' && c.to_profile === me.id)

  const ownerName = (m) => {
    if (!m.owner_profile) return 'os dois'
    return profiles.find((p) => p.id === m.owner_profile)?.name || '?'
  }

  const complete = async (m) => {
    await supabase.from('missions').update({ done: !m.done }).eq('id', m.id)
    if (!m.done) {
      setSplash(true)
      setTimeout(() => setSplash(false), 1400)
    }
    refresh()
  }

  const acceptCard = async (c) => {
    await supabase.from('calling_cards').update({ status: 'aceito' }).eq('id', c.id)
    if (c.date) {
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

  const Card = ({ m }) => (
    <motion.div layout className={`mission-card ${m.priority} ${m.done ? 'done' : ''}`}
      initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
      <div>
        <div className="m-title">{m.title} — <span style={{ color: m.owner_profile ? (profiles.find(p => p.id === m.owner_profile)?.color || 'var(--p5-cyan)') : 'var(--p5-red)' }}>{ownerName(m)}</span></div>
        <div className="m-sub">
          {m.time ? m.time.slice(0, 5) : 'sem hora'} · {m.period} · missão {m.priority}
        </div>
      </div>
      <button
        className={`check-btn ${m.done ? 'checked' : ''}`}
        aria-label={m.done ? 'Desfazer conclusão' : 'Concluir missão'}
        onClick={() => complete(m)}
      />
    </motion.div>
  )

  return (
    <>
      <header className="p5-header">
        <div className="inner">
          <div>
            <div className="date-big">
              {String(now.getDate()).padStart(2, '0')}/{String(now.getMonth() + 1).padStart(2, '0')}{' '}
              <span className="dow">{DOW[now.getDay()]}</span>
            </div>
            <div style={{ fontSize: 12, color: '#3d0a0c', fontWeight: 800, marginTop: 4 }}>
              olá, {me.name.toLowerCase()} · {now.getHours() < 12 ? 'manhã' : now.getHours() < 18 ? 'tarde' : 'noite'}
            </div>
          </div>
        </div>
      </header>

      <main className="view-wrap">
        {pendingCard && partner && (
          <motion.div className="calling-card" initial={{ opacity: 0, rotate: 4, scale: 0.9 }} animate={{ opacity: 1, rotate: -1, scale: 1 }}>
            <span className="tag red cc-badge"><span>Calling card recebido</span></span>
            <p className="cc-msg">“{pendingCard.message}”</p>
            <p className="cc-meta">
              de {partner.name}
              {pendingCard.date && ` · ${pendingCard.date.split('-').reverse().join('/')}`}
              {pendingCard.time && ` às ${pendingCard.time.slice(0, 5)}`}
            </p>
            <div className="cc-actions">
              <button className="p5-btn" style={{ background: 'var(--p5-black)', color: 'var(--p5-white)' }} onClick={() => acceptCard(pendingCard)}>
                <span>Aceitar</span>
              </button>
              <button className="p5-btn ghost" style={{ outlineColor: 'var(--p5-black)', color: 'var(--p5-black)' }}
                onClick={() => supabase.from('calling_cards').update({ status: 'negociando' }).eq('id', pendingCard.id).then(refresh)}>
                <span>Negociar</span>
              </button>
            </div>
          </motion.div>
        )}

        <div className="section-title">MISSÕES DE HOJE</div>
        {principal.length === 0 && secundarias.length === 0 && done.length === 0 && (
          <p style={{ color: 'var(--p5-gray)', fontSize: 14 }}>
            Nenhuma missão pra hoje. Dia livre no Metaverso — ou hora de criar a primeira.
          </p>
        )}
        {principal.map((m) => <Card key={m.id} m={m} />)}
        {secundarias.map((m) => <Card key={m.id} m={m} />)}

        {done.length > 0 && (
          <>
            <div className="section-title" style={{ opacity: 0.6 }}>CONCLUÍDAS</div>
            {done.map((m) => <Card key={m.id} m={m} />)}
          </>
        )}

        <div style={{ marginTop: 26 }}>
          <button className="p5-btn red" onClick={() => onNew({ date: iso })}>
            <span>+ nova missão</span>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {splash && (
          <motion.div className="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bar white" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.18 }} />
            <motion.div className="bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.22, delay: 0.05 }} />
            <motion.div className="txt"
              initial={{ x: -300, opacity: 0, skewX: -8 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.12, ease: [0.2, 1.4, 0.4, 1] }}>
              Missão concluída!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
