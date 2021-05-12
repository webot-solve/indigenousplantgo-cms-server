# Create learn more
@desc POST single learn more

@route /api/learn mores

@access Protected -- require user login

Example request: POST /api/learn_more

# EXAMPLE REQUEST BODY
```
{
  "learn_more_title": "Learn More",
  "description": "Lavender is a perennial shrub with purple flowers that bloom during the summer.",
  "images": ["607e399e59c8feg7e2af65r7"],
  "audio_files": ["607e399459c86677e2af65r7"],
  "videos": ["607e384559c86677e2af65r7"],
  "tags": ["607e4qwee59c86677e2af65r7", "607e384559c86677e2af65r7"],
  "categories": ["607e4qwee59c86677e2ewe3447"],
  "custom_fields": [
    {
      "_id": "607e399e59c86677e2af65r7",
      "field_title": "Medical",
      "content": "Use in medical"
    }
  ]
}
```

Learn_more_title, and description are required fields
- Returns "Missing title" or "Missing description" otherwise

Learn_more_title and description must be a string
- Returns "Invalid input for (learn_more_title/description)" otherwise

If an array field is not provided it will default to empty array

On create, a new revision will be set base on the user creating the learn more

If the array field (images, audio_files, videos, tags, categories, custom_fields) is provided they must be an array, and all except custom_fields must be array of string formatted as objectId
- Returns "Invalid input for the field (images, audio_files, videos, tags, categories, custom_fields)" if not an array
- Returns "Not all elements under (images, audio_files, videos, tags, categories) are valid" if not all element within array are ObjectId

If custom_field is provided, the array of object must contain _id, field_title, and content in each object
- Returns "At least one of the custom_field is not valid" if not all element within custom_fields are object
- Returns "At least one of the custom_field is missing (_id, field_title, content)" if not all object within custom_fields contains all the required field

Custom field's _id must be an valid objectId string, meaning it is hexidecimal string of certain length
- Returns "A _id under custom_field is not valid" otherwise

# SUCCESS RESPONSE BODY
```
"Learn more added"
```