const express = require('express')

module.exports = function({database, authorize, verifyKey}) {
  const router = express.Router()

  //Get All
  //GET /api/categories?key=<API_KEY>
  router.get('/', verifyKey, async (req, res) => {
    try {
      const result = await database.getCategories()
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Create
  //POST /api/categories?key=<API_KEY>
  router.post('/', authorize, verifyKey, async (req, res) => {
    try {
      const result = await database.createCategory(req.body)
      res.send(result.ops[0])
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get One
  //GET /api/categories/:categoryId?key=<API_KEY>
  router.get('/:categoryId', verifyKey, async (req, res) => {
    try {
      const categoryId = req.params.categoryId
      const result = await database.getCategory({categoryId})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Update
  //PUT /api/categories/:categoryId?key=<API_KEY>
  router.put('/:categoryId', authorize, verifyKey, async (req, res) => {
    try {
      const categoryId = req.params.categoryId
      const result = await database.updateCategory({categoryId, updatedCategory: req.body})
      res.send("Category updated")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Delete
  //DELETE /api/categories/:categoryId?key=<API_KEY>
  router.delete('/:categoryId', authorize, verifyKey, async (req, res) => {
    try {
      const categoryId = req.params.categoryId
      const result = await database.deleteCategory({categoryId})
      res.send("Category deleted")
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  //Get base on resource
  //GET /api/categories/group/:group?key=<API_KEY>
  router.get('/group/:group', verifyKey, async (req, res) => {
    try {
      const group = req.params.group
      const result = await database.getCategoryGroup({group})
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(401).send({error: error.message})
    }
  })

  return router
}
