# Delete learn more
@desc DELETE single learn more

@route /api/learn_mores/:id

@access Protected -- require user login

Example request: DELETE /api/learn_mores/607e399e59c8feg7e2af65r7

This will also delete all the revision under the deleted learn more

# SUCCESS RESPONSE BODY
```
"Learn more deleted"
```