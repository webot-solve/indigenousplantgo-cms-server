const express = require('express')

module.exports = function({database, authorize}) {
  const router = express.Router()

  //Get All
  //GET /api/tags?key=<API_KEY>
  router.get('/', async (req, res) => {
    try {
      const result = await database.getTags()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/tags
  router.post('/', authorize, async (req, res) => {
    try {
      const result = await database.createTag(req.body)
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/tags/:tagId?key=<API_KEY>
  router.get('/:tagId', async (req, res) => {
    try {
      const tagId = req.params.tagId
      const result = await database.getTag({tagId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/tags/:tagId
  router.put('/:tagId', authorize, async (req, res) => {
    try {
      const tagId = req.params.tagId
      const result = await database.updateTag({tagId, updatedTag: req.body})
      res.send("Tag updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/tags/:tagId
  router.delete('/:tagId', authorize, async (req, res) => {
    try {
      const tagId = req.params.tagId
      const result = await database.deleteTag({tagId})
      res.send("Tag deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}