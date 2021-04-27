const express = require('express')

module.exports = function({database, authorize, verifyKey}) {
  const router = express.Router()

  //Get All
  //GET /api/waypoints?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getWaypoints()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/waypoints?key=<API_KEY>
  router.post('/', authorize, verifyKey, async (req, res) => {
    try {
      const result = await database.createWaypoint({newWaypoint: req.body, user_id: req.user._id})
      res.send("Waypoint added")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/waypoints/:waypointId?key=<API_KEY>
  router.get('/:waypointId', verifyKey, async (req, res) => {
    try {
      const waypointId = req.params.waypointId
      const result = await database.getWaypoint({waypointId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/waypoints/:waypointId?key=<API_KEY>
  router.put('/:waypointId', authorize, verifyKey, async (req, res) => {
    try {
      const waypointId = req.params.waypointId
      const result = await database.updateWaypoint({waypointId, updatedWaypoint: req.body, user_id: req.user._id})
      res.send("Waypoint updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/waypoints/:waypointId?key=<API_KEY>
  router.delete('/:waypointId', authorize, verifyKey, async (req, res) => {
    try {
      const waypointId = req.params.waypointId
      const result = await database.deleteWaypoint({waypointId})
      res.send("Waypoint deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}