const express = require('express')

module.exports = function({database, authorize, verifyKey}) {
  const router = express.Router()

  //Get All (published ones)
  //GET /api/plants?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getPublishedPlants()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get All plants include none published ones
  //GET /api/plants/all?key=<API_KEY>
  router.get('/all', verifyKey, async (req, res) => {
    try {
      const result = await database.getPlants()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/plants
  router.post('/', authorize, async (req, res) => {
    try {
      const result = await database.createPlant({newPlant: req.body, user_id: req.user._id})
      res.send("Plant added")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/plants/:plantId?key=<API_KEY>
  router.get('/:plantId', verifyKey, async (req, res) => {
    try {
      const plantId = req.params.plantId
      const result = await database.getPlant({plantId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/plants/:plantId
  router.put('/:plantId', authorize, async (req, res) => {
    try {
      const plantId = req.params.plantId
      const result = await database.updatePlant({plantId, updatedPlant: req.body, user_id: req.user._id})
      res.send("Plant updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/plants/:plantId
  router.delete('/:plantId', authorize, async (req, res) => {
    try {
      const plantId = req.params.plantId
      const result = await database.deletePlant({plantId})
      res.send("Plant deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}