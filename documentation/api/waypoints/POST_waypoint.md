# Create waypoint
@desc POST single waypoint

@route /api/waypoints

@access Protected -- require user login

Example request: POST /api/waypoints

# EXAMPLE REQUEST BODY
```
{
  "waypoint_name": "test",
  "description": "test",
  "images": ["607fa01931325a2e700a4307"],
  "audio_files": ["607fa01931325a2e700a4307"],
  "videos": ["607fa01931325a2e700a4307"],
  "tags": ["607fa01931325a2e700a4307", "607fa01931325a2e700a4307"],
  "categories": ["607fa01931325a2e700a4307"],
  "locations": ["607fa01931325a2e700a4307"],
  "plants": ["607fa01931325a2e700a4307"],
  "custom_fields": [
    {
      "_id": "607e399e59c86677e2af65r7",
      "field_title": "Medical",
      "content": "Use in medical"
    }
  ]
}
```

Waypoint_name, description and location are required fields
- Returns "Missing waypoint name" or "Missing description" for waypoint_name and description
- Returns "Require at least one location" for location

Waypoint_name and description must be a string
- Returns "Invalid input for (waypoint_name/description)" otherwise

If an array field is not provided it will default to empty array

On create, a new revision will be set base on the user creating the waypoint and isPublish will be set to false

If the array field (images, audio_files, videos, tags, categories, locations, plants, custom_fields) is provided they must be an array, and all except custom_fields must be array of string formatted as objectId
- Returns "Invalid input for the field (images, audio_files, videos, tags, categories, locations, plants, custom_fields)" if not an array
- Returns "Not all elements under (images, audio_files, videos, tags, categories, locations, plants) are valid" if not all element within array are ObjectId

If custom_field is provided, the array of object must contain _id, field_title, and content in each object
- Returns "At least one of the custom_field is not valid" if not all element within custom_fields are object
- Returns "At least one of the custom_field is missing (_id, field_title, content)" if not all object within custom_fields contains all the required field

Custom field's _id must be an valid objectId string, meaning it is hexidecimal string of certain length
- Returns "A _id under custom_field is not valid" otherwise

# SUCCESS RESPONSE BODY
```
"Waypoint added"
```