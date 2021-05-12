# Update tour
@desc PUT single tour

@route /api/tours/:id

@access Protected -- require user login

Example request: PUT /api/tours/607e399e59c8feg7e2af65r7

# EXAMPLE REQUEST BODY
```
{
  "tour_name": "test",
  "description": "test",
  "images": ["607fa01931325a2e700a4307"],
  "audio_files": ["607fa01931325a2e700a4307"],
  "videos": ["607fa01931325a2e700a4307"],
  "tags": ["607fa01931325a2e700a4307", "607fa01931325a2e700a4307"],
  "categories": ["607fa01931325a2e700a4307"],
  "plants": ["607fa01931325a2e700a4307"],
  "waypoints": ["607fa01931325a2e700a4307"],
  "custom_fields": [
    {
      "_id": "607e399e59c86677e2af65r7",
      "field_title": "Medical",
      "content": "Use in medical"
    }
  ]
}
```

We set it to overwrite existing data

New revision is added on whenever update is made

Tour_name, and description are required fields
- Returns "Missing tour name" or "Missing description" otherwise

Tour_name and description must be a string
- Returns "Invalid input for (tour_name/description)" otherwise

If the array field (images, audio_files, videos, tags, categories, plants, waypoints, custom_fields) is provided they must be an array, and all except custom_fields must be array of string formatted as objectId
- Returns "Invalid input for the field (images, audio_files, videos, tags, categories, plants, waypoints, custom_fields)" if not an array
- Returns "Not all elements under (images, audio_files, videos, tags, categories, plants, waypoints) are valid" if not all element within array are ObjectId

If custom_field is provided, the array of object must contain _id, field_title, and content in each object
- Returns "At least one of the custom_field is not valid" if not all element within custom_fields are object
- Returns "At least one of the custom_field is missing (_id, field_title, content)" if not all object within custom_fields contains all the required field

Custom field's _id must be an valid objectId string, meaning it is hexidecimal string of certain length
- Returns "A _id under custom_field is not valid" otherwise

# SUCCESS RESPONSE BODY
```
"Tour updated"
```