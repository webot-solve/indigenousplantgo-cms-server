# Register user
@desc POST single user (Register)

@route /api/users

Example request: POST /api/users

# EXAMPLE REQUEST BODY
```
{
  "email": "test@email.com",
  "user_name": "test",
  "password": "test",
  "role": "Admin"
}
```

Role is default to Manager if no role is inputed

Email, user_name, and password are required
- Returns "Requires an email" or "Requires a (user_name/password)" otherwise

Email, user_name, password, role must be a string
- Returns "Invalid input for (email/user_name/password)" otherwise

Email must be formatted like a email
- Returns "Incorrectly formatted email" otherwise

Role can only be Manager or Admin
- Returns "Invalid role, role must be Manager or Admin" otherwise

# EXAMPLE RESPONSE BODY
```
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDgxYzJkZDFkMDgzNzM4ZjQ0NTg4NjIiLCJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdDIiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2MTkxMjc1NjQsImV4cCI6MTAwMTYxOTEyNzU2NH0.ACW4x2FQie1e_gj76PVkuYryMTCKpRwxWjbD-Ri1f8E",
  "user": {
      "_id": "6081c2dd1d083738f4458862",
      "email": "test@email.com",
      "user_name": "test",
      "role": "Admin"
  }
}
```