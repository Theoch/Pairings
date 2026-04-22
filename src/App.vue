<template>
  <div id="app">
    <header>
      <span class="header-shuttle">🏸</span>
      <h1>Pairings</h1>
      <p>Badminton · Rotations</p>
    </header>

    <!-- SETUP -->
    <div v-if="step === 'setup'" class="card">
      <h2>Noms des joueurs</h2>
      <div class="player-inputs">
        <div v-for="i in 6" :key="i" class="input-row">
          <label>{{ emojis[i - 1] }}</label>
          <input
            v-model="names[i - 1]"
            :placeholder="`Joueur ${i}`"
            :ref="el => { if (el) inputs[i - 1] = el }"
            @keyup.enter="focusNext(i)"
          />
        </div>
      </div>

      <button class="btn-primary" :disabled="!allFilled" @click="start">
        Générer les rotations →
      </button>
    </div>

    <!-- SCHEDULE -->
    <div v-else>
      <button class="btn-back" @click="reset">← Retour</button>

      <!-- Progress -->
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div class="progress-label">
        Rotation {{ currentSession + 1 }} / {{ schedule.length }}
      </div>

      <!-- Binômes -->
      <div class="card">
        <div class="section-label">Binômes</div>
        <div class="pairs-grid">
          <div
            v-for="(pair, pi) in currentRound.pairs"
            :key="pi"
            class="pair-chip"
          >
            <span class="pair-emoji">{{ emojis[pairIndex(pair[0])] }}</span>
            {{ pair[0] }}
            <span class="amp">·</span>
            <span class="pair-emoji">{{ emojis[pairIndex(pair[1])] }}</span>
            {{ pair[1] }}
          </div>
        </div>
      </div>

      <!-- Matches -->
      <div class="section-label" style="margin: 1rem 0 0.5rem">Matchs</div>
      <div v-for="(match, mi) in currentRound.matches" :key="mi" class="round-card">
        <div class="round-label">Match {{ mi + 1 }}</div>

        <div class="match">
          <div class="team">
            <span class="player-name">{{ match.team1[0] }}</span>
            <span class="amp">& {{ match.team1[1] }}</span>
          </div>
          <div class="vs"><span class="vs-text">VS</span></div>
          <div class="team right">
            <span class="player-name">{{ match.team2[0] }}</span>
            <span class="amp">& {{ match.team2[1] }}</span>
          </div>
        </div>

        <div class="winner-btns">
          <button
            :class="['winner-btn', match.winner === 0 ? 'selected' : '']"
            @click="setWinner(mi, 0)"
          >
            {{ match.winner === 0 ? '🏆 ' : '' }}{{ match.team1[0] }} & {{ match.team1[1] }}
          </button>
          <button
            :class="['winner-btn', match.winner === 1 ? 'selected' : '']"
            @click="setWinner(mi, 1)"
          >
            {{ match.winner === 1 ? '🏆 ' : '' }}{{ match.team2[0] }} & {{ match.team2[1] }}
          </button>
        </div>

        <div v-if="match.sitting.length" class="sitting">
          💺 Pause : {{ match.sitting.join(' · ') }}
        </div>
      </div>

      <!-- Navigation -->
      <div class="nav-btns">
        <button class="btn-secondary" :disabled="currentSession === 0" @click="currentSession--">
          ← Rotation précédente
        </button>
        <button
          v-if="currentSession < schedule.length - 1"
          class="btn-primary nav-next"
          @click="currentSession++"
        >
          Rotation suivante →
        </button>
        <button v-else class="btn-primary nav-next" @click="showLeaderboard = true">
          Voir le classement 🏆
        </button>
      </div>

      <!-- Leaderboard overlay -->
      <div v-if="showLeaderboard" class="overlay" @click.self="showLeaderboard = false">
        <div class="leaderboard-modal">
          <div class="leaderboard-title">Classement</div>
          <div v-if="leaderboard.length === 0" style="color:var(--text-muted);text-align:center;padding:1rem">
            Aucun match enregistré
          </div>
          <div v-for="(p, i) in leaderboard" :key="p.name" class="stat-row">
            <span class="stat-rank">{{ ['🥇','🥈','🥉','🦆','🐌','🪑'][i] }}</span>
            <span>{{ p.name }}</span>
            <span class="stat-wins">{{ p.wins }}V</span>
          </div>
          <button class="btn-primary" style="margin-top:1.25rem" @click="showLeaderboard = false">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generateSchedule } from './utils/pairings.js'

const emojis = ['🔵', '🔴', '🟢', '🟡', '🟣', '🟠']

const step = ref('setup')
const playerCount = 6
const names = ref(['', '', '', '', '', ''])
const inputs = ref([])
const schedule = ref([])
const currentSession = ref(0)
const showLeaderboard = ref(false)

const allFilled = computed(() =>
  names.value.every(n => n.trim() !== '')
)

const currentRound = computed(() => schedule.value[currentSession.value])

const progressPct = computed(() =>
  ((currentSession.value + 1) / schedule.value.length) * 100
)

function pairIndex(name) {
  return names.value.findIndex(n => n.trim() === name)
}

function focusNext(i) {
  if (i < playerCount) inputs.value[i]?.focus()
  else if (allFilled.value) start()
}

function start() {
  const players = names.value.map(n => n.trim())
  schedule.value = generateSchedule(players)
  currentSession.value = 0
  showLeaderboard.value = false
  step.value = 'schedule'
}

function reset() {
  step.value = 'setup'
  schedule.value = []
}

function setWinner(matchIdx, teamIdx) {
  const match = currentRound.value.matches[matchIdx]
  match.winner = match.winner === teamIdx ? null : teamIdx
}

const leaderboard = computed(() => {
  const wins = {}
  schedule.value.forEach(session => {
    session.matches.forEach(match => {
      if (match.winner !== null) {
        const winners = match.winner === 0 ? match.team1 : match.team2
        winners.forEach(p => { wins[p] = (wins[p] || 0) + 1 })
      }
    })
  })
  return Object.entries(wins)
    .map(([name, w]) => ({ name, wins: w }))
    .sort((a, b) => b.wins - a.wins)
})
</script>
