# Get locations
@desc GET all locations

@route /api/locations

Example request: GET /api/locations

# EXAMPLE RESPONSE BODY
```
[
  { 
    "_id": "607e3ab0a0d3df815abfcfb1",
    "location_name": "Lot A",
    "coordinates": "49°15&#39;16.2&quot;N 122°59&#39;53.7&quot;W",
    "description": ""
  },
  {
    "_id": "607e3ab0a0d3df815abfcfb1",
    "location_name": "SW1",
    "coordinates": "49.2508575,-123.0030182",
    "description": ""
  }
  // ... Repeat
]
```