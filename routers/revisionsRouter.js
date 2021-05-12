const express = require('express')

module.exports = function({database, authorize}) {
  const router = express.Router()

  //Get All
  //GET /api/revisions?key=<API_KEY>
  router.get('/', async (req, res) => {
    try {
      const result = await database.getRevisions()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/revisions
  router.post('/', authorize, async (req, res) => {
    try {
      const result = await database.createRevision({user_id: req.user._id})
      res.send("Revision added")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/revisions/:revisionId?key=<API_KEY>
  router.get('/:revisionId', async (req, res) => {
    try {
      const revisionId = req.params.revisionId
      const result = await database.getRevision({revisionId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/revisions/:revisionId
  router.delete('/:revisionId', authorize, async (req, res) => {
    try {
      const revisionId = req.params.revisionId
      const result = await database.deleteRevision({revisionId})
      res.send("Revison deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}
