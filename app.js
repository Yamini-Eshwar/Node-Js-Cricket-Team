const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/')
})

initializeDBAndServer()

const convert = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//Get
app.get('/players', async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray.map(eachplayer => convert(eachplayer)))
})

//GET player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayeridQuery = `SELECT * FROM cricket_team WHERE player_id= ${playerId};`
  const player = await db.get(getPlayeridQuery)
  response.send(convert(player))
})

//POST
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );
  `
  const dbResponse = await db.run(addPlayerQuery)

  response.send('Player Added to Team')
})

//PUT
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  playerDetails2 = request.body
  const {playerName, jerseyNumber, role} = playerDetails2
  const updatePlayerQuery = `UPDATE cricket_team SET player_name= '${playerName}', jersey_number=${jerseyNumber}, role='${role}' WHERE player_id =${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//DELETE
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id =${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
