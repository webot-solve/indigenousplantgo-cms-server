const express = require('express')

module.exports = function({database, authorize, generateToken, verifyKey}) {
  const router = express.Router()

  //Get All
  //GET /api/users?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getUsers()
      const filteredResult = []
      result.forEach((user) => {
        filteredResult.push((({_id, email, user_name, role}) => ({_id, email, user_name, role}))(user))
      })
      res.send(filteredResult)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/users - register
  router.post('/', async (req, res) => {
    try {
      const result = await database.createUser(req.body)
      const user = result.ops[0]
      const filteredResult = (({_id, email, user_name, role}) => ({_id, email, user_name, role}))(user)
      const accessToken = generateToken(filteredResult)
      res.send({accessToken, user: filteredResult})
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get and compare
  //POST /api/users/login - login
  router.post('/login', async (req, res) => {
    try {
      const result = await database.getUserLogin(req.body)
      const filteredResult = (({_id, email, user_name, role}) => ({_id, email, user_name, role}))(result)
      const accessToken = generateToken(filteredResult)
      res.send({accessToken, user: filteredResult})
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/users/:userId?key=<API_KEY>
  router.get('/:userId', verifyKey, async (req, res) => {
    try {
      const userId = req.params.userId
      const result = await database.getUser({userId})
      const filteredResult = (({_id, email, user_name, role}) => ({_id, email, user_name, role}))(result)
      res.send(filteredResult)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/users/:userId
  router.put('/:userId', authorize, async (req, res) => {
    try {
      console.log(`req: ${req}`)
      const userId = req.params.userId
      console.log(`userId ${userId}`)
      const result = await database.updateUser({userId, updatedUser: req.body, userRole: req.user.role})
      res.send("User updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //PUT /api/users/:userId
  router.delete('/:userId', authorize, async (req, res) => {
    try {
      const userId = req.params.userId
      const result = await database.deleteUser({userId})
      res.send("User deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}