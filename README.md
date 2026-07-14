# agenda do metaverso

Agenda compartilhada que eu e meu namorado usamos no dia a dia, com visual
inspirado em Persona 5. Feita com React + Vite + Supabase, publicada no
GitHub Pages.

Projeto 100% pessoal e sem fins comerciais — o código é público apenas como
portfólio. Sem afiliação com Atlus/SEGA; nenhum asset oficial do jogo é
distribuído, todo o design foi recriado do zero.

## O que tem

- conta única do casal + seleção de perfil (estilo Netflix)
- tela "hoje" com as missões do dia
- calendário mensal no estilo do jogo, com painel dia/noite
- calling cards: um manda o convite, o outro aceita ou negocia
- sincronização em tempo real entre os dispositivos (Supabase Realtime)

## Setup

No Supabase: rodar o `supabase/schema.sql` no SQL Editor, criar um bucket
público `avatars` no Storage pras fotos dos perfis, e em Authentication
apontar a Site URL pro endereço do Pages. Depois de criar a conta,
desativar o signup em Authentication → Sign In / Up.

No GitHub: criar dois secrets em Settings → Secrets and variables → Actions
(`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, valores em Settings → API
do Supabase) e em Settings → Pages escolher Source: GitHub Actions. O push
na main publica sozinho.

Pra rodar local, criar um `.env` na raiz com as mesmas duas variáveis e
`npm install && npm run dev`.
