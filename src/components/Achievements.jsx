import { motion } from 'framer-motion'
import { ACHIEVEMENTS, computeStats } from '../achievements.js'

export default function Achievements({ missions, cards, checkIns, me, partner }) {
  const stats = computeStats(me.id, partner?.id, missions, cards, checkIns)
  const total = ACHIEVEMENTS.length
  const unlocked = ACHIEVEMENTS.filter((a) => stats[a.metric] >= a.target).length

  return (
    <>
      <header className="p5-header">
        <div className="inner">
          <div>
            <div className="date-big">Troféus</div>
            <div style={{ fontSize: 12, color: '#3d0a0c', fontWeight: 800, marginTop: 4 }}>
              {me.name.toLowerCase()} · {unlocked}/{total} desbloqueados
            </div>
          </div>
        </div>
      </header>

      <main className="view-wrap">
        <div className="trophy-grid">
          {ACHIEVEMENTS.map((a, i) => {
            const value = stats[a.metric]
            const done = value >= a.target
            const pct = Math.min(100, Math.round((value / a.target) * 100))
            return (
              <motion.div
                key={a.id}
                className={`trophy ${done ? 'unlocked' : ''} tier-${a.tier}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25, ease: [0.3, 1.5, 0.4, 1] }}
              >
                <div className="trophy-badge" aria-hidden="true">
                  <span className="trophy-glyph">{a.glyph}</span>
                </div>
                <div className="trophy-info">
                  <div className="trophy-name">{a.name}</div>
                  <div className="trophy-desc">{a.desc}</div>
                  <div className="trophy-bar">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                  <div className="trophy-count">{done ? 'desbloqueado' : `${value}/${a.target}`}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </>
  )
}
