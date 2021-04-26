const express = require('express')

module.exports = function({authorize}) {
  const router = express.Router()

  //Return 200 for success and 501 for error
  //GET /api/ping
  router.get('/', authorize, async (req, res) => {
    res.send("Success")
  })

  return router
}