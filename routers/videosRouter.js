const express = require('express')

module.exports = function({database, authorize, upload, s3}) {
  const router = express.Router()

  //Get All
  //GET /api/videos?key=<API_KEY>
  router.get('/', async (req, res) => {
    try {
      const result = await database.getVideos()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/videos
  router.post('/', authorize, async (req, res) => {
    try {
      const result = await database.createVideo({newVideo: req.body})
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/videos/:videoId?key=<API_KEY>
  router.get('/:videoId', async (req, res) => {
    try {
      const videoId = req.params.videoId
      const result = await database.getVideo({videoId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/videos/:videoId
  router.put('/:videoId', authorize, async (req, res) => {
    try {
      const videoId = req.params.videoId
      const result = await database.updateVideo({videoId, updatedVideo: req.body})
      res.send("Video updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/videos/:videoId
  router.delete('/:videoId', authorize, async (req, res) => {
    try {
      const videoId = req.params.videoId
      const result = await database.deleteVideo({videoId, s3})
      res.send("Video deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}