# Get learn mores
@desc GET all learn_more

@route /api/learn_more

Example request: GET /api/learn_more

# EXAMPLE RESPONSE BODY
```
[
  {
    "_id": "607e399e59c86677e2af6587",
    "learn_more_title": "An epic journey advances through the spring",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer pretium quis arcu non pulvinar. Donec non sodales lorem. Sed vulputate imperdiet purus varius aliquet. Vestibulum et sem sed erat aliquam volutpat. Aenean a tellus a nulla egestas rhoncus id eu eros.",
    "custom_fields": [
      {
        "_id": "607e399e59c86677e2af65r7",
        "field_title": "Date",
        "content": "<p>March 25, 2021st</p>"
      },
      {
        "_id": "607e399e59c86677e465r7",
        "field_title": "Location",
        "content": "<p>SW1 Building</p>"
      }
    ],
    "images": [
      {
        "_id": "607e399e59c8feg7e2af65r7",
        "image_url": "s3.aws.indigenousplantgo.com/images/journey.jpg",
        "caption": "A map of the journey"
      }
    ],
    "audio_files": [
      {
        "_id": "607e399459c86677e2af65r7",
        "audio_file_url": "s3.aws.indigenousplantgo.com/audio/journey-speech.mp3",
        "caption": "A speech about the journey"
      }
    ],
    "videos": [
      {
        "_id": "607e384559c86677e2af65r7",
        "video_url": "s3.aws.indigenousplantgo.com/video/journey-timelapse.mp4",
        "caption": "The journey timelapse video"
      }
    ],
    "tags": [
      {
        "_id": "607e399e59cbnsn87e2af6587",
        "tag_name": "Custom House Post"
      },
      {
        "_id": "607e399e59c86677e273ba77",
        "tag_name": "Cedar Tree"
      }
    ],
    "categories": [
      {
        "_id": "607e399e59c86677e2af6587",
        "category_name": "Indigenous"
      },
      {
        "_id": "607e399e59c86677e2asda77",
        "category_name": "Mentor Hand"
      },
      {
        "_id": "607e399e59c86677s72sda77",
        "category_name": "Indigenous Initiatives"
      }
      // ... Repeat
    ],
    "revision_history": [
      {
        "_id": "607e3ab0a0d3df815abfcfb1",
        "user": {
          "_id": "607e3ab0a0d3df815abfcfb1",
          "user_name": "Patrick Fortaleza",
          "email": "patrickfortaleza@gmail.com",
          "role": "Manager"
        },
        "date": "April 20, 2021 at 6:30am"
      },
      {
        "_id": "607e3ab0a0d3df815abfcfb1",
        "user": {
          "_id": "607e3ab0a0d3df815abfcfb1",
          "user_name": "Patrick Fortaleza",
          "email": "patrickfortaleza@gmail.com",
          "role": "Manager"
        },
        "date": "April 20, 2021 at 2:30am"
      }
    ]
  }
  // ... Repeat
]
```