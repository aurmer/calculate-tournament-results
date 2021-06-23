function calculateResultsArray (tournament) {
  const finishedGames = Object.values(tournament.games).filter( (game) => game.status === "final" )
  const teamsObject = finishedGames.reduce(gamesToTeamsObject.bind(null,tournament.teams),{})
  const teamsArray = Object.keys(teamsObject).map(teamsObjectToArray.bind(null,teamsObject))
  const rankedTeamsArray = teamsArray.sort( (a,b) => b['victory-points'] - a['victory-points'] )
                                     .map( (team,idx) => ({ ...team, place: idx+1}))

  return rankedTeamsArray
}

function calculateResultsObject (tournament) {
  const finishedGames = Object.values(tournament.games).filter( (game) => game.status === "final" )
  const teamsObject = finishedGames.reduce(gamesToTeamsObject.bind(null,tournament.teams),{})
  const rankedTeamIDs = Object.keys(teamsObject).sort( (a,b) => teamsObject[b].victoryPoints - teamsObject[a].victoryPoints )
  for (idx in rankedTeamIDs) {
    teamsObject[rankedTeamIDs[idx]].place = parseInt(idx) + 1
  }

  return teamsObject
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

function gamesToTeamsObject (teams, acc, game) {
  const gameStats = calcGameStats(game)

  for(teamLetter of "AB") {
    const TEAM_ID = game[`team${teamLetter}-id`]
    if(!acc[TEAM_ID]) acc[TEAM_ID] = initTeamData(teams[TEAM_ID])
  }
    
  for(teamLetter of "AB") {
    const TEAM_ID = game[`team${teamLetter}-id`]
    const DID_TEAM_WIN = gameStats[`${teamLetter}Won`]
    const DID_TEAM_LOSE = !DID_TEAM_WIN && !gameStats.isTie
    const POINTS_WON = game[`score${teamLetter}`]
    const POINT_DIFF = gameStats[`${teamLetter}PointsDiff`]
    const POINTS_LOST = gameStats[`${teamLetter}PointsLost`]
    const VIC_POINTS = gameStats[`${teamLetter}VicPoints`]

    acc[TEAM_ID].gamesLost += DID_TEAM_LOSE ? 1 : 0
    acc[TEAM_ID].gamesPlayed += 1
    acc[TEAM_ID].gamesTied += gameStats.isTie ? 1 : 0
    acc[TEAM_ID].gamesWon += DID_TEAM_WIN ? 1 : 0
    acc[TEAM_ID].pointDiff += POINT_DIFF
    acc[TEAM_ID].pointsLost += POINTS_LOST
    acc[TEAM_ID].pointsPlayed += gameStats.pointsPlayed
    acc[TEAM_ID].pointsWon += POINTS_WON
    acc[TEAM_ID].victoryPoints += VIC_POINTS
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
