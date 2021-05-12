# Delete plant
@desc DELETE single plant

@route /api/plants/:id

@access Protected -- require user login

Example request: DELETE /api/plants/607e399e59c8feg7e2af65r7

This will also delete all the revision under the deleted plant

# SUCCESS RESPONSE BODY
```
"Plant deleted"
```