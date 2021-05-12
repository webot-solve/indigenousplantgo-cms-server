# Update user
@desc PUT single user

@route /api/users/:id

@access Protected -- require user login

Example request: PUT /api/users/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "email": "test@email.com",
  "user_name": "test",
  "password": "test",
  "role": "Admin"
}
```

Email, user_name, and password are required
- Returns "Requires an email" or "Requires a (user_name/password)" otherwise

Email, user_name, password, role must be a string
- Returns "Invalid input for (email/user_name/password)" otherwise

Email must be formatted like a email
- Returns "Incorrectly formatted email" otherwise

Role can only be Manager or Admin
- Returns "Invalid role, role must be Manager or Admin" otherwise

Role can only be editted if the user that send this request is an Admin
- Returns "No permission to update role" otherwise

# SUCCESS RESPONSE BODY
```
"User updated"
```