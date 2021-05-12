# Delete user
@desc DELETE single user

@route /api/users/:id

@access Protected -- require user login

Example request: DELETE /api/users/607e399e59c8feg7e2af65r7

# SUCCESS RESPONSE BODY
```
"User deleted"
```