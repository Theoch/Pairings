<template>
  <div id="app">
    <header>
      <h1>🏸 Pairings Badminton</h1>
    </header>

    <!-- SETUP -->
    <div v-if="step === 'setup'" class="card">
      <h2>Nombre de joueurs</h2>
      <div class="count-btns">
        <button
          v-for="n in [4, 6]"
          :key="n"
          :class="['count-btn', { active: playerCount === n }]"
          @click="setCount(n)"
        >{{ n }} joueurs</button>
      </div>

      <h2>Noms des joueurs</h2>
      <div class="player-inputs">
        <div v-for="i in playerCount" :key="i" class="input-row">
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
        Générer les matchs →
      </button>
    </div>

    <!-- SCHEDULE -->
    <div v-else>
      <button class="btn-back" @click="reset">← Retour</button>

      <div class="schedule-header">
        <h2 style="color: var(--text); font-size:1rem; text-transform:none; letter-spacing:0;">
          {{ playerCount }} joueurs · {{ schedule.length }} rounds
        </h2>
      </div>

      <div v-for="(round, idx) in schedule" :key="idx" class="round-card">
        <div class="round-label">Round {{ idx + 1 }}</div>

        <div class="match">
          <div class="team">
            <span class="player-name">{{ round.teams[0][0] }}</span>
            <span class="amp">& {{ round.teams[0][1] }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team right">
            <span class="player-name">{{ round.teams[1][0] }}</span>
            <span class="amp">& {{ round.teams[1][1] }}</span>
          </div>
        </div>

        <div class="winner-btns">
          <button
            :class="['winner-btn', round.winner === 0 ? 'selected-1' : '']"
            @click="setWinner(idx, 0)"
          >
            {{ round.winner === 0 ? '🏆' : '' }} {{ round.teams[0][0] }} & {{ round.teams[0][1] }}
          </button>
          <button
            :class="['winner-btn', round.winner === 1 ? 'selected-2' : '']"
            @click="setWinner(idx, 1)"
          >
            {{ round.winner === 1 ? '🏆' : '' }} {{ round.teams[1][0] }} & {{ round.teams[1][1] }}
          </button>
        </div>

        <div v-if="round.sitting.length" class="sitting">
          💺 Pause : {{ round.sitting.join(' · ') }}
        </div>
      </div>

      <!-- LEADERBOARD -->
      <div v-if="hasResults" class="stats-card">
        <div class="stats-title">Classement</div>
        <div v-for="p in leaderboard" :key="p.name" class="stat-row">
          <span>{{ p.name }}</span>
          <span class="stat-wins">{{ p.wins }} victoire{{ p.wins !== 1 ? 's' : '' }}</span>
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
const playerCount = ref(4)
const names = ref(['', '', '', '', '', ''])
const inputs = ref([])
const schedule = ref([])

const allFilled = computed(() =>
  names.value.slice(0, playerCount.value).every(n => n.trim() !== '')
)

function setCount(n) {
  playerCount.value = n
}

function focusNext(i) {
  if (i < playerCount.value) inputs.value[i]?.focus()
  else if (allFilled.value) start()
}

function start() {
  const players = names.value.slice(0, playerCount.value).map(n => n.trim())
  schedule.value = generateSchedule(players)
  step.value = 'schedule'
}

function reset() {
  step.value = 'setup'
  schedule.value = []
}

function setWinner(roundIdx, teamIdx) {
  const round = schedule.value[roundIdx]
  round.winner = round.winner === teamIdx ? null : teamIdx
}

const hasResults = computed(() => schedule.value.some(r => r.winner !== null))

const leaderboard = computed(() => {
  const wins = {}
  schedule.value.forEach(round => {
    if (round.winner !== null) {
      round.teams[round.winner].forEach(p => {
        wins[p] = (wins[p] || 0) + 1
      })
    }
  })
  return Object.entries(wins)
    .map(([name, w]) => ({ name, wins: w }))
    .sort((a, b) => b.wins - a.wins)
})
</script>
