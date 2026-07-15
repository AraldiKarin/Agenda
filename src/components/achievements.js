export function computeStats(profileId, partnerId, missions, cards, checkIns) {
  const mine = (m) => m.owner_profile === profileId || m.owner_profile === null

  const myChecks = checkIns.filter((c) => c.profile_id === profileId)
  const checkDates = new Set(myChecks.map((c) => c.date))

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  // sequencia atual: dias consecutivos terminando hoje ou ontem
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!checkDates.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (checkDates.has(iso(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // maior sequencia ja alcancada (trofeu ganho nao se perde)
  let maxStreak = 0
  let run = 0
  let prev = null
  const sorted = [...checkDates].sort()
  for (const dt of sorted) {
    if (prev) {
      const diff = (new Date(dt + 'T12:00:00') - new Date(prev + 'T12:00:00')) / 86400000
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    if (run > maxStreak) maxStreak = run
    prev = dt
  }

  // dias em que os dois fizeram check-in
  let coupleDays = 0
  if (partnerId) {
    const partnerDates = new Set(checkIns.filter((c) => c.profile_id === partnerId).map((c) => c.date))
    for (const dt of checkDates) if (partnerDates.has(dt)) coupleDays++
  }

  return {
    streak,
    maxStreak,
    missionsDone: missions.filter((m) => m.done && mine(m)).length,
    principalDone: missions.filter((m) => m.done && m.priority === 'principal' && mine(m)).length,
    cardsSent: cards.filter((c) => c.from_profile === profileId).length,
    cardsAccepted: cards.filter((c) => c.status === 'aceito' && (c.from_profile === profileId || c.to_profile === profileId)).length,
    coupleDays,
  }
}

export const ACHIEVEMENTS = [
  // check-in: dias consecutivos (quebrou, recomeca — mas trofeu ganho fica)
  { id: 'st1',   name: 'Primeira Infiltração',      desc: 'Primeiro check-in',                metric: 'maxStreak',     target: 1,   glyph: '✦', tier: 1 },
  { id: 'st3',   name: 'Aquecendo',                 desc: '3 dias consecutivos',              metric: 'maxStreak',     target: 3,   glyph: '⚡', tier: 1 },
  { id: 'st7',   name: 'Uma Semana no Esconderijo', desc: '7 dias consecutivos',              metric: 'maxStreak',     target: 7,   glyph: '⚡', tier: 2 },
  { id: 'st15',  name: 'Foco Total',                desc: '15 dias consecutivos',             metric: 'maxStreak',     target: 15,  glyph: '⚡', tier: 3 },
  { id: 'st30',  name: 'Imparável',                 desc: '30 dias consecutivos',             metric: 'maxStreak',     target: 30,  glyph: '⚡', tier: 4 },
  { id: 'st100', name: 'Lenda do Metaverso',        desc: '100 dias consecutivos',            metric: 'maxStreak',     target: 100, glyph: '⚡', tier: 5 },
  // missoes
  { id: 'ms1',   name: 'Primeiro Roubo',            desc: 'Concluir a primeira missão',       metric: 'missionsDone',  target: 1,   glyph: '✓', tier: 1 },
  { id: 'ms10',  name: 'Mãos Ágeis',                desc: 'Concluir 10 missões',              metric: 'missionsDone',  target: 10,  glyph: '✓', tier: 2 },
  { id: 'ms50',  name: 'Cinquenta Tesouros',        desc: 'Concluir 50 missões',              metric: 'missionsDone',  target: 50,  glyph: '✓', tier: 3 },
  { id: 'ms100', name: 'Cem Tesouros',              desc: 'Concluir 100 missões',             metric: 'missionsDone',  target: 100, glyph: '✓', tier: 4 },
  { id: 'ms250', name: 'Mestre do Ofício',          desc: 'Concluir 250 missões',             metric: 'missionsDone',  target: 250, glyph: '✓', tier: 5 },
  // principais
  { id: 'pr5',   name: 'Alvo Prioritário',          desc: 'Concluir 5 missões principais',    metric: 'principalDone', target: 5,   glyph: '◆', tier: 2 },
  { id: 'pr25',  name: 'Caça aos Chefes',           desc: 'Concluir 25 missões principais',   metric: 'principalDone', target: 25,  glyph: '◆', tier: 4 },
  // calling cards
  { id: 'cc1',   name: 'Primeiro Aviso',            desc: 'Enviar um calling card',           metric: 'cardsSent',     target: 1,   glyph: '✉', tier: 1 },
  { id: 'cca1',  name: 'Convite Aceito',            desc: 'Ter um calling card aceito',       metric: 'cardsAccepted', target: 1,   glyph: '✉', tier: 2 },
  { id: 'cca10', name: 'Dupla Perfeita',            desc: '10 calling cards aceitos',         metric: 'cardsAccepted', target: 10,  glyph: '✉', tier: 3 },
  // casal
  { id: 'cp7',   name: 'Juntos no Esconderijo',     desc: 'Check-in dos dois no mesmo dia, 7 vezes',  metric: 'coupleDays', target: 7,  glyph: '♥', tier: 3 },
  { id: 'cp30',  name: 'Coração Roubado',           desc: 'Check-in dos dois no mesmo dia, 30 vezes', metric: 'coupleDays', target: 30, glyph: '♥', tier: 5 },
]

export function unlockedIds(stats) {
  return new Set(ACHIEVEMENTS.filter((a) => stats[a.metric] >= a.target).map((a) => a.id))
}
