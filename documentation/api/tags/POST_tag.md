# Create tag
@desc POST single tag

@route /api/tags

@access Protected -- require user login

Example request: POST /api/tags

# EXAMPLE REQUEST BODY
```
{
  "tag_name": "Event"
}
```

Tag_name is required
- Returns "Require a tag name" otherwise

Tag_name must be a string
- Returns "Invalid input for tag_name" otherwise

Tag_name must be unique
- Returns "Tag already exist" otherwise

# SUCCESS RESPONSE BODY
```
{
  "_id": "607e399e59c86677e2af6587",
  "tag_name": "Event"
}
```