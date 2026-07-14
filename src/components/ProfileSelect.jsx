import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function ProfileSelect({ profiles, onPick, onCreated }) {
  const [setup, setSetup] = useState(false)

  if (profiles.length === 0 || setup) {
    return <FirstRunSetup onDone={() => { setSetup(false); onCreated() }} existing={profiles} />
  }

  return (
    <div className="profile-select">
      <motion.h1
        className="login-title"
        initial={{ opacity: 0, x: -40, skewX: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.3, 1.2, 0.4, 1] }}
      >
        Quem está entrando no <em>Metaverso</em>?
      </motion.h1>

      <div className="profile-row">
        {profiles.map((p, i) => (
          <motion.button
            key={p.id}
            className="profile-card"
            onClick={() => onPick(p)}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.35, ease: [0.3, 1.5, 0.4, 1] }}
          >
            {p.avatar_url ? (
              <img className="profile-avatar" src={p.avatar_url} alt="" />
            ) : (
              <div className="profile-avatar">{p.name[0]}</div>
            )}
            <span className="profile-name">{p.name}</span>
          </motion.button>
        ))}
      </div>

      <button className="p5-btn ghost" onClick={() => setSetup(true)}>
        <span>Editar perfis</span>
      </button>
    </div>
  )
}

function FirstRunSetup({ onDone, existing }) {
  const [rows, setRows] = useState(
    existing.length
      ? existing.map((p) => ({ ...p }))
      : [
          { name: 'Karin', avatar_url: '', color: '#E3242B' },
          { name: 'Guilherme', avatar_url: '', color: '#33c6dd' },
        ]
  )
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    for (const r of rows) {
      if (!r.name.trim()) continue
      if (r.id) {
        await supabase.from('profiles').update({ name: r.name, avatar_url: r.avatar_url || null, color: r.color }).eq('id', r.id)
      } else {
        await supabase.from('profiles').insert({ name: r.name, avatar_url: r.avatar_url || null, color: r.color })
      }
    }
    setBusy(false)
    onDone()
  }

  return (
    <div className="profile-select">
      <div className="login-box" style={{ maxWidth: 480 }}>
        <h1 className="login-title">Montar os <em>perfis</em></h1>
        <p style={{ fontSize: 13, color: 'var(--p5-gray)' }}>
          Nome e foto de cada um. A foto é uma URL — pode ser uma imagem no Supabase Storage ou qualquer link.
        </p>

        {rows.map((r, i) => (
          <div key={i} style={{ borderTop: i ? '1px solid #2c2c32' : 'none', marginTop: i ? 18 : 0, paddingTop: i ? 6 : 0 }}>
            <label className="p5-label">Nome do perfil {i + 1}</label>
            <input className="p5-input" value={r.name}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <label className="p5-label">URL da foto (opcional)</label>
            <input className="p5-input" value={r.avatar_url || ''} placeholder="https://..."
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, avatar_url: e.target.value } : x)))} />
          </div>
        ))}

        <div style={{ marginTop: 22 }}>
          <button className="p5-btn red" onClick={save} disabled={busy}>
            <span>{busy ? '...' : 'Salvar perfis'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
