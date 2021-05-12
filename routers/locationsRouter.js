const express = require('express')

module.exports = function({database, authorize}) {
  const router = express.Router()

  //Get All
  //GET /api/locations?key=<API_KEY>
  router.get('/', async (req, res) => {
    try {
      const result = await database.getLocations()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/locations
  router.post('/', authorize, async (req, res) => {
    try {
      const result = await database.createLocation(req.body)
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/locations/:locationId?key=<API_KEY>
  router.get('/:locationId', async (req, res) => {
    try {
      const locationId = req.params.locationId
      const result = await database.getLocation({locationId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/locations/:locationId
  router.put('/:locationId', authorize, async (req, res) => {
    try {
      const locationId = req.params.locationId
      const result = await database.updateLocation({locationId, updatedLocation: req.body})
      res.send("Location updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/locations/:locationId
  router.delete('/:locationId', authorize, async (req, res) => {
    try {
      const locationId = req.params.locationId
      const result = await database.deleteLocation({locationId})
      res.send("Location deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}
