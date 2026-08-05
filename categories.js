export const CATEGORIES = [
  { id: 'faculdade', label: 'Faculdade', color: '#33c6dd' },
  { id: 'trabalho',  label: 'Trabalho',  color: '#f0b429' },
  { id: 'saida',     label: 'Saída',     color: '#7f77dd' },
  { id: 'casa',      label: 'Casa',      color: '#4caf7d' },
  { id: 'urgente',   label: 'Urgente',   color: '#E3242B' },
  { id: 'outro',     label: 'Outro',     color: '#8a8a92' },
]

export const catColor = (id) => CATEGORIES.find((c) => c.id === id)?.color || '#8a8a92'
export const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || 'Outro'
