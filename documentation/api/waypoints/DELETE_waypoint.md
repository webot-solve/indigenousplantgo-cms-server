# Delete waypoint
@desc DELETE single waypoint

@route /api/waypoints/:id

@access Protected -- require user login

Example request: DELETE /api/waypoints/607e399e59c8feg7e2af65r7

This will also delete all the revision under the deleted waypoint

# SUCCESS RESPONSE BODY
```
"Waypoint deleted"
```