# Update video
@desc PUT single video

@route /api/videos/:id

@access Protected -- require user login

Example request: PUT /api/videos/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "video_url": "https://www.youtube.com/watch?v=-vJ0NMOH2vA&ab_channel=vivivivivi",
  "caption": "lavender in a big field"
}
```

Video_url and caption are both required
- Returns "Missing video" or "Missing caption" if missing the field

Video_url and caption must be a string
- Returns "Invalid input for (video_url/caption)" otherwise

Video_url takes a youtube video
- Returns "Incorrectly formatted video url" if not a valid youtube link

Caption must be unique
- Returns "Video caption is already taken" otherwise

If you don't provide a field that field will just remain as the old value

# SUCCESS RESPONSE BODY
```
"Video updated"
```