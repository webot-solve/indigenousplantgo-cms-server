const express = require('express')

module.exports = function({database}) {
  const router = express.Router()

  //Get All
  //GET /api/plants?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getPlants()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}