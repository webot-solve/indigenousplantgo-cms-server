# Reset password
@desc Reset the password of an email

@route /api/users/reset_password

Example request: POST /api/users/reset_password

# EXAMPLE REQUEST BODY
```
{
  "email": "test@test.com"
}
```

If email is not a string, it will just fail to find user with that email input
- Returns "No user with that email" most likely
  
# SUCCESS RESPONSE BODY
```
"Email sent"
```