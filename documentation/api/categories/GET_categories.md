# Get categories
@desc GET all categories

@route /api/categories

Example request: GET /api/categories

# EXAMPLE RESPONSE BODY
```
[
  {
    "_id": "607e399e59c86677e2af6587",
    "category_name": "Event",
    "resource": "plant"
  },
  {
    "_id": "607e399e59c86677e2asda77",
    "category_name": "Community Outreach",
    "resource": "waypoint"
  },
  {
    "_id": "607e399e59c86677s72sda77",
    "category_name": "Students",
    "resource": "tour"
  }
  // ... Repeat
]
```