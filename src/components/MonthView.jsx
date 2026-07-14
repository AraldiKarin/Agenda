import { useState } from 'react'
import { motion } from 'framer-motion'

const DOWS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MONTHS = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export default function MonthView({ missions, profiles, me, onNew }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [selected, setSelected] = useState(iso(now.getFullYear(), now.getMonth(), now.getDate()))

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate())
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const firstDow = new Date(ym.y, ym.m, 1).getDay()

  const byDay = {}
  for (const m of missions) (byDay[m.date] ||= []).push(m)

  const nav = (delta) => {
    let m = ym.m + delta, y = ym.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setYm({ y, m })
  }

  const sel = byDay[selected] || []
  const dia = sel.filter((m) => m.period === 'dia')
  const noite = sel.filter((m) => m.period === 'noite')

  const ownerName = (m) => (!m.owner_profile ? 'os dois' : profiles.find((p) => p.id === m.owner_profile)?.name || '?')
  const ownerColor = (m) => (!m.owner_profile ? 'var(--p5-red)' : profiles.find((p) => p.id === m.owner_profile)?.color || 'var(--p5-cyan)')

  const Item = ({ m }) => (
    <div className="mission-card" style={{ padding: '8px 12px', borderLeftColor: m.priority === 'principal' ? 'var(--p5-red)' : 'var(--p5-gray)', opacity: m.done ? 0.45 : 1 }}>
      <div>
        <div className="m-title" style={{ fontSize: 13, textDecoration: m.done ? 'line-through' : 'none' }}>
          {m.title} — <span style={{ color: ownerColor(m) }}>{ownerName(m)}</span>
        </div>
        <div className="m-sub">{m.time ? m.time.slice(0, 5) : 'sem hora'}</div>
      </div>
    </div>
  )

  return (
    <>
      <header className="p5-header">
        <div className="inner">
          <div className="date-big">
            {MONTHS[ym.m]} <span style={{ fontSize: '0.5em', color: '#3d0a0c' }}>{ym.y}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 2 }}>
            <button className="p5-btn" style={{ padding: '6px 14px' }} onClick={() => nav(-1)} aria-label="Mês anterior"><span>‹</span></button>
            <button className="p5-btn" style={{ padding: '6px 14px' }}
              onClick={() => { setYm({ y: now.getFullYear(), m: now.getMonth() }); setSelected(todayIso) }}>
              <span>hoje</span>
            </button>
            <button className="p5-btn" style={{ padding: '6px 14px' }} onClick={() => nav(1)} aria-label="Próximo mês"><span>›</span></button>
          </div>
        </div>
      </header>

      <main className="view-wrap">
        <div className="month-layout">
          <div>
            <div className="cal-grid" style={{ marginBottom: 4 }}>
              {DOWS.map((d, i) => (
                <span key={d} className={`cal-dow ${i === 0 ? 'dom' : i === 6 ? 'sab' : ''}`}>{d}</span>
              ))}
            </div>
            <div className="cal-grid" key={`${ym.y}-${ym.m}`}>
              {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1
                const dISO = iso(ym.y, ym.m, d)
                const dow = (firstDow + i) % 7
                const isPast = dISO < todayIso
                const cls = [
                  'cal-day',
                  dow === 0 ? 'dom' : dow === 6 ? 'sab' : '',
                  isPast ? 'past' : '',
                  dISO === todayIso ? 'today' : '',
                  dISO === selected ? 'selected' : '',
                ].join(' ')
                return (
                  <button key={d} className={cls} style={{ animationDelay: `${i * 0.015}s` }} onClick={() => setSelected(dISO)}>
                    {d}
                    <div className={`cal-dot ${byDay[dISO]?.length ? '' : 'empty'}`} />
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--p5-gray)', marginTop: 10 }}>
              ◆ dia com missões · números apagados = dias passados
            </p>
          </div>

          <motion.aside className="day-panel" key={selected}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
            <span className="tag white" style={{ fontSize: 15, marginBottom: 14 }}>
              <span>{selected.split('-').reverse().slice(0, 2).join('/')} {DOWS[new Date(selected + 'T12:00:00').getDay()]}</span>
            </span>

            <div className="section-title" style={{ margin: '16px 0 8px', letterSpacing: 2 }}>DIA</div>
            {dia.length ? dia.map((m) => <Item key={m.id} m={m} />) : <p style={{ fontSize: 12, color: 'var(--p5-gray)' }}>nada de dia</p>}

            <div className="section-title" style={{ margin: '16px 0 8px', letterSpacing: 2 }}>NOITE</div>
            {noite.length ? noite.map((m) => <Item key={m.id} m={m} />) : <p style={{ fontSize: 12, color: 'var(--p5-gray)' }}>nada de noite</p>}

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <button className="p5-btn red" onClick={() => onNew({ date: selected })}>
                <span>+ nova missão</span>
              </button>
            </div>
          </motion.aside>
        </div>
      </main>
    </>
  )
}
