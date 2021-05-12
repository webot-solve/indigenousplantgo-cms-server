# Delete video
@desc DELETE single video

@route /api/videos/:id

@access Protected -- require user login

Example request: DELETE /api/videos/607e399e59c8feg7e2af65r7

# SUCCESS RESPONSE BODY
```
"Video deleted"
```