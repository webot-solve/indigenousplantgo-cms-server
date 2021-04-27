const express = require('express')

module.exports = function({database, authorize, verifyKey}) {
  const router = express.Router()

  //Get All
  //GET /api/tags?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getTags()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/tags?key=<API_KEY>
  router.post('/', authorize, verifyKey, async (req, res) => {
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
  router.get('/:tagId', verifyKey, async (req, res) => {
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
  //PUT /api/tags/:tagId?key=<API_KEY>
  router.put('/:tagId', authorize, verifyKey, async (req, res) => {
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
  //DELETE /api/tags/:tagId?key=<API_KEY>
  router.delete('/:tagId', authorize, verifyKey, async (req, res) => {
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