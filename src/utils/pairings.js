// 1-factorization of K_n: generates perfect pair sessions where no partner repeats
// For 6 players → 5 sessions of 3 pairs each
// For 4 players → 3 sessions of 2 pairs each

function buildSessions(players) {
  const n = players.length // 4 or 6
  const indices = players.map((_, i) => i)

  // Circle method: fix index 0, rotate the rest
  const sessions = []
  const rotating = indices.slice(1) // indices 1..n-1

  for (let r = 0; r < n - 1; r++) {
    const circle = [indices[0], ...rotating]
    const pairs = []
    for (let i = 0; i < n / 2; i++) {
      pairs.push([circle[i], circle[n - 1 - i]])
    }
    sessions.push(pairs)
    // rotate: move last element to front of rotating
    rotating.unshift(rotating.pop())
  }

  return sessions.map(pairs => ({
    pairs: pairs.map(([i, j]) => [players[i], players[j]]),
    matches: buildMatches(pairs.map(([i, j]) => [players[i], players[j]])),
  }))
}

function buildMatches(pairs) {
  // All combinations of pairs playing each other
  const matches = []
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const sitting = pairs.filter((_, k) => k !== i && k !== j)
      matches.push({
        team1: pairs[i],
        team2: pairs[j],
        sitting: sitting.flat(),
        winner: null,
      })
    }
  }
  return matches
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateSchedule(playerNames) {
  return buildSessions(shuffle(playerNames))
}
