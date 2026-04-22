function pairKey(i, j) {
  return `${Math.min(i, j)}-${Math.max(i, j)}`
}

function getAllPairs(arr) {
  const pairs = []
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      pairs.push([arr[i], arr[j]])
  return pairs
}

function findMatchup(playing, usedPairs) {
  const [a, b, c, d] = playing
  const options = [[[a, b], [c, d]], [[a, c], [b, d]], [[a, d], [b, c]]]
  for (const [p1, p2] of options) {
    if (!usedPairs.has(pairKey(...p1)) && !usedPairs.has(pairKey(...p2)))
      return [p1, p2]
  }
  return null
}

function findRound(indices, usedPairs, sitCounts) {
  const n = indices.length

  if (n === 4) {
    const matchup = findMatchup(indices, usedPairs)
    return matchup ? { teams: matchup, sitting: [] } : null
  }

  // n === 6: choose 2 to sit out, prefer those who sat out least
  const sitOptions = getAllPairs(indices).sort(
    (a, b) => (sitCounts[a[0]] + sitCounts[a[1]]) - (sitCounts[b[0]] + sitCounts[b[1]])
  )

  for (const sitting of sitOptions) {
    const playing = indices.filter(i => !sitting.includes(i))
    const matchup = findMatchup(playing, usedPairs)
    if (matchup) return { teams: matchup, sitting }
  }
  return null
}

export function generateSchedule(playerNames) {
  const n = playerNames.length
  const indices = playerNames.map((_, i) => i)
  const usedPairs = new Set()
  const sitCounts = new Array(n).fill(0)
  const rounds = []

  while (true) {
    const round = findRound(indices, usedPairs, sitCounts)
    if (!round) break
    round.teams.forEach(([i, j]) => usedPairs.add(pairKey(i, j)))
    round.sitting.forEach(i => sitCounts[i]++)
    rounds.push({
      teams: round.teams.map(([i, j]) => [playerNames[i], playerNames[j]]),
      sitting: round.sitting.map(i => playerNames[i]),
      winner: null
    })
  }

  return rounds
}
