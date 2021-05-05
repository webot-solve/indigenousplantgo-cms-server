const express = require('express')

module.exports = function({database, authorize, verifyKey, upload, s3}) {
  const router = express.Router()

  //Get All
  //GET /api/videos?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getVideos()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/videos?key=<API_KEY>
  router.post('/', authorize, verifyKey, upload.single('video'), async (req, res) => {
    try {
      const url = req.file ? req.file.location : null
      const result = await database.createVideo({url: url, newVideo: req.body})
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/videos/:videoId?key=<API_KEY>
  router.get('/:videoId', verifyKey, async (req, res) => {
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
  //PUT /api/videos/:videoId?key=<API_KEY>
  router.put('/:videoId', authorize, verifyKey, upload.single('video'), async (req, res) => {
    try {
      const url = req.file ? req.file.location : null
      const videoId = req.params.videoId
      const result = await database.updateVideo({videoId, url: url, updatedVideo: req.body, s3})
      res.send("Video updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/videos/:videoId?key=<API_KEY>
  router.delete('/:videoId', authorize, verifyKey, async (req, res) => {
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