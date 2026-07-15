import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ACHIEVEMENTS, computeStats } from '../achievements.js'

const PER_PAGE = 9

export default function Achievements({ missions, cards, checkIns, me, partner }) {
  const [page, setPage] = useState(0)
  const stats = computeStats(me.id, partner?.id, missions, cards, checkIns)
  const total = ACHIEVEMENTS.length
  const unlocked = ACHIEVEMENTS.filter((a) => stats[a.metric] >= a.target).length
  const pages = Math.ceil(total / PER_PAGE)
  const slice = ACHIEVEMENTS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const go = (delta) => setPage((p) => (p + delta + pages) % pages)

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
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="trophy-grid"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.18 }}
          >
            {slice.map((a, i) => {
              const value = stats[a.metric]
              const done = value >= a.target
              const pct = Math.min(100, Math.round((value / a.target) * 100))
              return (
                <motion.div
                  key={a.id}
                  className={`trophy ${done ? 'unlocked' : ''} tier-${a.tier}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.22, ease: [0.3, 1.5, 0.4, 1] }}
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
          </motion.div>
        </AnimatePresence>

        {pages > 1 && (
          <div className="trophy-pager">
            <button className="p5-btn" onClick={() => go(-1)} aria-label="Página anterior"><span>‹</span></button>
            <span className="tag white pager-count"><span>{page + 1} / {pages}</span></span>
            <button className="p5-btn" onClick={() => go(1)} aria-label="Próxima página"><span>›</span></button>
          </div>
        )}
      </main>
    </>
  )
}
