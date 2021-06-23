function calculateResultsArray (tournament) {
  const teamsObject = tournamentToTeamsObj(tournament)
  const teamsArray = Object.keys(teamsObject).map(teamsObjectToArray.bind(null,teamsObject))
  const rankedTeamsArray = teamsArray.sort( (a,b) => b['victory-points'] - a['victory-points'] )
                                     .map( (team,idx) => ({ ...team, place: idx+1}))

  return rankedTeamsArray
}

function calculateResultsObject (tournament) {
  const teamsObject = tournamentToTeamsObj(tournament)
  const rankedTeamIDs = Object.keys(teamsObject).sort( (a,b) => teamsObject[b].victoryPoints - teamsObject[a].victoryPoints )
  for (idx in rankedTeamIDs) {
    teamsObject[rankedTeamIDs[idx]].place = parseInt(idx) + 1
  }

  return teamsObject
}

function tournamentToTeamsObj (tournament) {
  const finishedGames = Object.values(tournament.games).filter( (game) => game.status === "final" )
  return finishedGames.reduce(gamesToTeamsObject.bind(null,tournament.teams),{})
}

function gamesToTeamsObject (teams, acc, game) {
  const gameStats = calcGameStats(game)

  if(!acc[game[`teamA-id`]]) acc[game[`teamA-id`]] = initTeamData(teams[game[`teamA-id`]])
  if(!acc[game[`teamB-id`]]) acc[game[`teamB-id`]] = initTeamData(teams[game[`teamB-id`]])
    
  for(letter of "AB") {
    const teamId = game[`team${letter}-id`]
    const didTeamWin = gameStats[`${letter}Won`]
    const didTeamLose = !didTeamWin && !gameStats.isTie
    const ptWon = game[`score${letter}`]
    const ptDiff = gameStats[`${letter}PointsDiff`]
    const ptLost = gameStats[`${letter}PointsLost`]
    const vicPt = gameStats[`${letter}VicPoints`]

    acc[teamId].gamesLost += didTeamLose ? 1 : 0
    acc[teamId].gamesPlayed += 1
    acc[teamId].gamesTied += gameStats.isTie ? 1 : 0
    acc[teamId].gamesWon += didTeamWin ? 1 : 0
    acc[teamId].pointDiff += ptDiff
    acc[teamId].pointsLost += ptLost
    acc[teamId].pointsPlayed += gameStats.pointsPlayed
    acc[teamId].pointsWon += ptWon
    acc[teamId].victoryPoints += vicPt
  }

  return acc
}

function calcGameStats (game) {
  return {
    AWon: game.scoreA > game.scoreB,
    BWon: game.scoreA < game.scoreB,
    isTie: game.scoreA === game.scoreB,
    pointsPlayed: game.scoreA + game.scoreB,
    APointsLost: game.scoreB,
    BPointsLost: game.scoreA,
    APointsDiff: game.scoreA - game.scoreB,
    BPointsDiff: game.scoreB - game.scoreA,
    AVicPoints: (game.scoreA > game.scoreB) * 3000 + (game.scoreA === game.scoreB) * 1000 + game.scoreA - game.scoreB,
    BVicPoints: (game.scoreA < game.scoreB) * 3000 + (game.scoreA === game.scoreB) * 1000 + game.scoreB - game.scoreA
  }
}

function initTeamData (team) {
  return {
    gamesLost: 0,
    gamesPlayed: 0,
    gamesTied: 0,
    gamesWon: 0,
    pointDiff: 0,
    pointsLost: 0,
    pointsPlayed: 0,
    pointsWon: 0,
    victoryPoints: 0,
    teamCaptain: team.captain,
    teamName: team.name
  }
}

function teamsObjectToArray (teamsObject, thisTeam) {
  return {
     "games-lost": teamsObject[thisTeam].gamesLost,
     "games-played": teamsObject[thisTeam].gamesPlayed,
     "games-tied": teamsObject[thisTeam].gamesTied,
     "games-won": teamsObject[thisTeam].gamesWon,
     "points-diff": teamsObject[thisTeam].pointDiff,
     "points-lost": teamsObject[thisTeam].pointsLost,
     "points-played": teamsObject[thisTeam].pointsPlayed,
     "points-won": teamsObject[thisTeam].pointsWon,
     "team-captain": teamsObject[thisTeam].teamCaptain,
     "team-id": thisTeam,
     "team-name": teamsObject[thisTeam].teamName,
     "victory-points": teamsObject[thisTeam].victoryPoints
   }
}

// this line is needed to export your functions so they can be used by the test suite
module.exports = {
  calculateResultsArray: calculateResultsArray,
  calculateResultsObject: calculateResultsObject
}
