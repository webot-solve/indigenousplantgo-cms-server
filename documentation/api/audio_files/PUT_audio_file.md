# Update audio
@desc PUT single audio file (Update)

@route /api/audios/:id

@access Protected -- require user login

Example request: PUT /api/audios/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "audio": "<file>",
  "caption": "lavender in a big field"
}
```

`<file>` represent file input

The audio file must have key name "audio"

If audio is not a file type it will just ignore the audio input

Caption are required
- Returns "Missing caption" if missing the field

Caption must be a string
- Returns "Invalid input for caption" otherwise

Caption must be unique
- Returns "Audio caption is already taken" otherwise

If you don't provide a field that field will just remain as the old value

# SUCCESS RESPONSE BODY
```
"Audio file updated"
```

