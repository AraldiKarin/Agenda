import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './supabaseClient'
import Login from './components/Login.jsx'
import ProfileSelect from './components/ProfileSelect.jsx'
import TodayView from './components/TodayView.jsx'
import MonthView from './components/MonthView.jsx'
import CallingCards from './components/CallingCards.jsx'
import MissionModal from './components/MissionModal.jsx'

const VIEWS = [
  { id: 'today', label: 'Hoje' },
  { id: 'month', label: 'Mês' },
  { id: 'cards', label: 'Calling cards' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [view, setView] = useState('today')
  const [wipeKey, setWipeKey] = useState(0)
  const [missions, setMissions] = useState([])
  const [cards, setCards] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoadingAuth(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const fetchAll = useCallback(async () => {
    const [p, m, c] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('missions').select('*').order('time', { ascending: true, nullsFirst: false }),
      supabase.from('calling_cards').select('*').order('created_at', { ascending: false }),
    ])
    if (p.data) setProfiles(p.data)
    if (m.data) setMissions(m.data)
    if (c.data) setCards(c.data)
  }, [])

  useEffect(() => {
    if (!session) return
    fetchAll()

    const channel = supabase
      .channel('sync-casal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calling_cards' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAll)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session, fetchAll])

  useEffect(() => {
    const saved = localStorage.getItem('metaverso_profile')
    if (saved && profiles.length) {
      const found = profiles.find((p) => p.id === saved)
      if (found) setActiveProfile(found)
    }
  }, [profiles])

  const pickProfile = (p) => {
    localStorage.setItem('metaverso_profile', p.id)
    setActiveProfile(p)
    setWipeKey((k) => k + 1)
  }

  const changeView = (v) => {
    if (v === view) return
    setWipeKey((k) => k + 1)
    setTimeout(() => setView(v), 180)
  }

  if (loadingAuth) return null
  if (!session) return <Login />
  if (!activeProfile) return <ProfileSelect profiles={profiles} onPick={pickProfile} onCreated={fetchAll} />

  const partner = profiles.find((p) => p.id !== activeProfile.id) || null

  return (
    <div className="app-shell">
      <BgStars />

      <AnimatePresence>
        {wipeKey > 0 && <Wipe key={wipeKey} />}
      </AnimatePresence>

      {view === 'today' && (
        <TodayView
          missions={missions}
          cards={cards}
          profiles={profiles}
          me={activeProfile}
          partner={partner}
          onNew={(preset) => setModal(preset || {})}
          refresh={fetchAll}
        />
      )}
      {view === 'month' && (
        <MonthView
          missions={missions}
          profiles={profiles}
          me={activeProfile}
          onNew={(preset) => setModal(preset || {})}
          refresh={fetchAll}
        />
      )}
      {view === 'cards' && (
        <CallingCards cards={cards} me={activeProfile} partner={partner} refresh={fetchAll} />
      )}

      <nav className="p5-nav" aria-label="Navegação principal">
        {VIEWS.map((v) => (
          <button key={v.id} className={view === v.id ? 'active' : ''} onClick={() => changeView(v.id)}>
            <span>{v.label}</span>
          </button>
        ))}
        <button onClick={() => { localStorage.removeItem('metaverso_profile'); setActiveProfile(null) }}>
          <span>Trocar perfil</span>
        </button>
      </nav>

      {modal && (
        <MissionModal
          preset={modal}
          profiles={profiles}
          me={activeProfile}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll() }}
        />
      )}
    </div>
  )
}

function Wipe() {
  return (
    <div className="wipe" aria-hidden="true">
      <motion.div
        className="w-red"
        initial={{ x: '-120%' }}
        animate={{ x: '120%' }}
        transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.div
        className="w-black"
        initial={{ x: '-120%' }}
        animate={{ x: '120%' }}
        transition={{ duration: 0.5, ease: [0.7, 0, 0.2, 1], delay: 0.06 }}
      />
    </div>
  )
}

function BgStars() {
  const spots = [
    { left: '8%', top: '15%' }, { left: '85%', top: '10%' },
    { left: '20%', top: '70%' }, { left: '70%', top: '60%' },
    { left: '45%', top: '30%' }, { left: '92%', top: '80%' },
  ]
  return (
    <div className="bg-stars" aria-hidden="true">
      {spots.map((s, i) => (
        <span key={i} style={{ ...s, animationDelay: `${i * -4}s` }} />
      ))}
    </div>
  )
}
