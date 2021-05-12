const jwt = require('jsonwebtoken')

const secret = process.env.ACCESS_TOKEN_SECRET || "default secret"

function generateToken(data) {
  const token = jwt.sign(data, secret, {expiresIn: "86400s"})
  return token
}
exports.generateToken = generateToken

function authorize(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader ? authHeader.split(' ')[1] : null

  if (!token) {
    const errMsg = "No token sent to server"
    console.error(errMsg)
    res.status(501).send({error: errMsg})
  }

  let decoded
  try {
    decoded = jwt.verify(token, secret)
  } catch(error) {
    console.error(error)
    res.status(501).send({error: "Invalid Token"})
    return
  }

  req.user = decoded
  next()
}
exports.authorize = authorize