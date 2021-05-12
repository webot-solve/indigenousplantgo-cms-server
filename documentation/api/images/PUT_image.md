# Update image
@desc PUT single image

@route /api/images/:id

@access Protected -- require user login

Example request: PUT /api/images/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "image": "<file>",
  "caption": "lavender in a big field"
}
```

"<file>" represent file input

The image file must have key name "image"

If image is not a file type it will just ignore the image input

Caption are required
- Returns "Missing caption" if missing the field

Caption must be a string
- Returns "Invalid input for caption" otherwise

Caption must be unique
- Returns "Image caption is already taken" otherwise

If you don't provide a field that field will just remain as the old value

# SUCCESS RESPONSE BODY
```
"Image updated"
```

