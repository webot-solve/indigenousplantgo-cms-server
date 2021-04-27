const express = require('express')

module.exports = function({database, authorize, verifyKey}) {
  const router = express.Router()

  //Get All
  //GET /api/tours?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getTours()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/tours?key=<API_KEY>
  router.post('/', authorize, verifyKey, async (req, res) => {
    try {
      const result = await database.createTour({newTour: req.body, user_id: req.user._id})
      res.send("Tour added")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/tours/:tourId?key=<API_KEY>
  router.get('/:tourId', verifyKey, async (req, res) => {
    try {
      const tourId = req.params.tourId
      const result = await database.getTour({tourId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/tours/:tourId?key=<API_KEY>
  router.put('/:tourId', authorize, verifyKey, async (req, res) => {
    try {
      const tourId = req.params.tourId
      const result = await database.updateTour({tourId, updatedTour: req.body, user_id: req.user._id})
      res.send("Tour updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/tours/:tourId?key=<API_KEY>
  router.delete('/:tourId', authorize, verifyKey, async (req, res) => {
    try {
      const tourId = req.params.tourId
      const result = await database.deleteTour({tourId})
      res.send("Tour deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}