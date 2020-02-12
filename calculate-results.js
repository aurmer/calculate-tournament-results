function calculateResultsArray (tournament) {
  //filter out unfinished games from the list
  const finishedGames = Object.keys(tournament.games).filter( (ele) => tournament.games[ele].status === "final" )

  //iterate through all games to accumulate stats about teams
  let teamsObject = finishedGames.reduce(gamesToTeamsObject.bind(null,tournament),{})

  //map teamsObject to teamsArray
  let teamsArray = Object.keys(teamsObject).map(teamsObjectToArray.bind(null,teamsObject))

  //sort by victory points and assign place properties based on order
  const rankedTeamsArray = teamsArray.sort( (a,b) => b['victory-points'] - a['victory-points'] )

  for (idx in rankedTeamsArray) {
    rankedTeamsArray[idx].place = parseInt(idx) + 1
  }

  return rankedTeamsArray
}

function calculateResultsObject (tournament) {
  //filter out unfinished games from the list
  const finishedGames = Object.keys(tournament.games).filter( (ele) => tournament.games[ele].status === "final" )

  //iterate through all games to accumulate stats about teams
  let teamsObject = finishedGames.reduce(gamesToTeamsObject.bind(null,tournament),{})

  //get a copy of teams ordered by victory points
  const rankedTeamIDs = Object.keys(teamsObject).sort( (a,b) => teamsObject[b].victoryPoints - teamsObject[a].victoryPoints )

  //once sorted by victory points, assign each team their ranking
  for (idx in rankedTeamIDs) {
    teamsObject[rankedTeamIDs[idx]].place = parseInt(idx) + 1
  }

  return teamsObject
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

function gamesToTeamsObject (tournament, accumulator, gameId) {
  const game = tournament.games[gameId]
  const gameStats = calcGameStats(game)


  let result = {
    [game[`teamA-id`]]: {},
    [game[`teamB-id`]]: {},
    ...accumulator //will replace empty team objects if applicable
  }

  for(teamLetter of "AB") {
    const TEAM_ID = game[`team${teamLetter}-id`]
    const TEAM_WON = gameStats[`is${teamLetter}Winner`]
    const TEAM_LOST = !TEAM_WON && !gameStats.isGameTied
    const POINT_DIFF = gameStats[`points${teamLetter}Diff`]
    const POINTS_LOST = gameStats[`points${teamLetter}Lost`]
    const POINTS_WON = game[`score${teamLetter}`]
    const VIC_POINTS = gameStats[`vicPoints${teamLetter}`]

    result[TEAM_ID] = {
      gamesLost: incrementPropertyIfTrue(TEAM_LOST,result[TEAM_ID].gamesLost),
      gamesPlayed: incrementProperty(result[TEAM_ID].gamesPlayed),
      gamesTied: incrementPropertyIfTrue(gameStats.isGameTied,result[TEAM_ID].gamesTied),
      gamesWon: incrementPropertyIfTrue(TEAM_WON,result[TEAM_ID].gamesWon),
      pointDiff: addToProperty(POINT_DIFF,result[TEAM_ID].pointDiff),
      pointsLost: addToProperty(POINTS_LOST,result[TEAM_ID].pointsLost),
      pointsPlayed: addToProperty(gameStats.pointsPlayed,result[TEAM_ID].pointsPlayed),
      pointsWon: addToProperty(POINTS_WON,result[TEAM_ID].pointsWon),
      teamCaptain: tournament.teams[TEAM_ID].captain,
      teamName: tournament.teams[TEAM_ID].name,
      victoryPoints: addToProperty(VIC_POINTS,result[TEAM_ID].victoryPoints)
    }
  }
  return result
}

function calcGameStats (game) {
  return {
    isAWinner: game.scoreA > game.scoreB,
    isBWinner: game.scoreA < game.scoreB,
    isGameTied: game.scoreA === game.scoreB,
    pointsPlayed: game.scoreA + game.scoreB,
    pointsALost: game.scoreB,
    pointsBLost: game.scoreA,
    pointsADiff: game.scoreA - game.scoreB,
    pointsBDiff: game.scoreB - game.scoreA,
    vicPointsA: (game.scoreA > game.scoreB) * 3000 + (game.scoreA === game.scoreB) * 1000 + game.scoreA - game.scoreB,
    vicPointsB: (game.scoreA < game.scoreB) * 3000 + (game.scoreA === game.scoreB) * 1000 + game.scoreB - game.scoreA
  }
}

function incrementProperty (number = 0) {
  return number + 1
}

function incrementPropertyIfTrue (bool1,number = 0) {
  return (bool1) ? number + 1 : number
}

function addToProperty (sumOperand,number = 0) {
  return number + sumOperand
}

// this line is needed to export your functions so they can be used by the test suite
module.exports = {
  calculateResultsArray: calculateResultsArray,
  calculateResultsObject: calculateResultsObject
}
