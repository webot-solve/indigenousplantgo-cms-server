# Create category
@desc POST single category

@route /api/categories

@access Protected -- require user login

Example request: POST /api/categories

# EXAMPLE REQUEST BODY
```
{
  "category_name": "Event",
  "resource": "plant"
}
```

Resource field is provided by the frontend depending on where the category is created under

Category_name and resource is required
- Returns "Require a category name" or "Require a resource" otherwise

Category_name and resource must be a string
- Returns "Invalid input for (category_name/resource)" otherwise

Resource must be either plant, waypoint, tour, or learn_more
- Returns "Invalid resource, resource must be plant, waypoint, tour, or learn_more" otherwise

Category_name must be unique within its resource group
- Returns "Category already exist in this resource group" otherwise

# SUCCESS RESPONSE BODY
```
{
  "_id": "607e399e59c86677e2af6587",
  "category_name": "Event",
  "resource": "plant"
}
```