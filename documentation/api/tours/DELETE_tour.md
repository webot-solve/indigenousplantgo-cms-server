# Delete tour
@desc DELETE single tour

@route /api/tours/:id

@access Protected -- require user login

Example request: DELETE /api/tours/607e399e59c8feg7e2af65r7

This will also delete all the revision under the deleted tour

# SUCCESS RESPONSE BODY
```
"Tour deleted"
```