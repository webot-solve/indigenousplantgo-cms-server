# Get users
@desc GET all users

@route /api/users

Example request: GET /api/users

# EXAMPLE RESPONSE BODY
```
[
  {
    "_id": "608a2493ec961b39ec741b0a",
    "email": "bob@test.ca",
    "user_name": "bob",
    "role": "Admin"
  }, 
  {
    "_id": "608a2493ec961b39ec741b0b",
    "email": "charli@test.ca",
    "user_name": "charli",
    "role": "Manager"
  }
]
```