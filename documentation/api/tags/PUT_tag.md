# Update tag
@desc PUT single tag

@route /api/tags/:id

@access Protected -- require user login

Example request: PUT /api/tags/607e399e59c8feg7e2af65r7

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
"Tag updated"
```