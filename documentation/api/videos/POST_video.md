# Create video
@desc POST single video

@route /api/videos

@access Protected -- require user login

Example request: POST /api/videos

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

# SUCCESS RESPONSE BODY
```
{
  "_id": "607e384559c86677e2af65r7",
  "video_url": "https://www.youtube.com/watch?v=-vJ0NMOH2vA&ab_channel=vivivivivi",,
  "caption": "A lavender flower blooming timelapse"
}
```