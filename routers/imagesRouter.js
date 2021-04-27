const express = require('express')

module.exports = function({database, authorize, verifyKey, upload, s3}) {
  const router = express.Router()

  //Get All
  //GET /api/images?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getImages()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/images?key=<API_KEY>
  router.post('/', authorize, verifyKey, upload.single('image'), async (req, res) => {
    try {
      const url = req.file ? req.file.location : null
      const result = await database.createImage({url: url, updatedImage: req.body})
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/images/:imageId?key=<API_KEY>
  router.get('/:imageId', verifyKey, async (req, res) => {
    try {
      const imageId = req.params.imageId
      const result = await database.getImage({imageId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/images/:imageId?key=<API_KEY>
  router.put('/:imageId', authorize, verifyKey, upload.single('image'), async (req, res) => {
    try {
      const url = req.file ? req.file.location : null
      const imageId = req.params.imageId
      const result = await database.updateImage({imageId, url: url, updatedImage: req.body, s3})
      res.send("Image updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/images/:imageId?key=<API_KEY>
  router.delete('/:imageId', authorize, verifyKey, async (req, res) => {
    try {
      const imageId = req.params.imageId
      const result = await database.deleteImage({imageId, s3})
      res.send("Image deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}