function generateKey() {
}
exports.generateKey = generateKey

function verifyKey(req, res, next) {
  // For comparing key
  // This is key from the url
  console.log(req.query.key)
  next()
}
exports.verifyKey = verifyKey