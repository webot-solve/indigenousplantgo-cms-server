# Create location
@desc POST single location

@route /api/locations

@access Protected -- require user login

Example request: POST /api/locations

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

Descripion will default to an empty string if it is not provided in the request body

# SUCCESS RESPONSE BODY
```
{ 
  "_id": "607e3ab0a0d3df815abfcfb1",
  "location_name": "Lot A",
  "longitude": 39.45,
  "latitude": 39.45,
  "description": ""
}
```