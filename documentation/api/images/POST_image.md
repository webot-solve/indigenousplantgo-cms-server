# Create image
@desc POST single image

@route /api/images

@access Protected -- require user login

Example request: POST /api/images

# EXAMPLE REQUEST BODY
```
{
  "image": "<file>",
  "caption": "lavender in a big field"
}
```

`<file>` represent file input

The image file must have key name "image"

Image and caption are both required
- Returns "Missing image" or "Missing caption" if missing the field

If image is not a file type it will just return "Missing image"

Caption must be a string
- Returns "Invalid input for caption" otherwise

Caption must be unique
- Returns "Image caption is already taken" otherwise

# SUCCESS RESPONSE BODY
```
{
  "_id": "607e399e59c8feg7e2af65r7",
  "image_url": "s3.aws.indigenousplantgo.com/images/lavender-1",
  "caption": "lavender in a big field"
}
```

