# Update location
@desc PUT single location (Update)

@route /api/locations/:id

@access Protected -- require user login

Example request: PUT /api/locations/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{ 
  "location_name": "Lot A",
  "longitude": 39.45,
  "latitude": 39.45,
  "description": ""
}
```

Location_name, longitude, and latitude is required
- Returns "Require a tag name" or "Require a (longitude/latitude)" otherwise

Location_name and description must be a string
- Returns "Invalid input for (location_name/description)" otherwise

Longitude and latitude must be a number
- Returns "Invalid input for (longitude/latitude)" otherwise

# SUCCESS RESPONSE BODY
```
"Location updated"
```