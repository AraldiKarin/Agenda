import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const fn = mode === 'signin'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error: err } = await fn
    setBusy(false)
    if (err) {
      setError(
        err.message.includes('Invalid login')
          ? 'E-mail ou senha incorretos. Tente de novo.'
          : err.message
      )
    } else if (mode === 'signup') {
      setError('Conta criada. Se o projeto exigir confirmação, veja o e-mail antes de entrar.')
      setMode('signin')
    }
  }

  return (
    <div className="profile-select">
      <form className="login-box" onSubmit={submit}>
        <h1 className="login-title">Agenda do <em>Metaverso</em></h1>
        <p style={{ fontSize: 13, color: 'var(--p5-gray)', marginBottom: 8 }}>
          {mode === 'signin' ? 'A conta do casal. Uma só, pros dois.' : 'Criar a conta do casal (só na primeira vez).'}
        </p>

        <label className="p5-label" htmlFor="email">E-mail</label>
        <input id="email" className="p5-input" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="casal@exemplo.com" />

        <label className="p5-label" htmlFor="pass">Senha</label>
        <input id="pass" className="p5-input" type="password" required minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <p style={{ fontSize: 13, color: 'var(--p5-red)', marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, alignItems: 'center' }}>
          <button className="p5-btn red" type="submit" disabled={busy}>
            <span>{busy ? '...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}</span>
          </button>
          <button
            type="button"
            className="p5-btn ghost"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
          >
            <span>{mode === 'signin' ? 'Primeira vez' : 'Já tenho conta'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
