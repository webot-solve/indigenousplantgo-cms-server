# Update category
@desc PUT single category

@route /api/categories/:id

@access Protected -- require user login

Example request: PUT /api/categories/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "category_name": "Event"
}
```

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
"Category updated"
```