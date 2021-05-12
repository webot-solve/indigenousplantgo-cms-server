# Get waypoints
@desc GET all waypoints

@route /api/waypoints/all

Example request: GET /api/waypoints/all

# EXAMPLE RESPONSE BODY
```
[
  {
    "_id": "607e399e59c86677e2af6587",
    "waypoint_name": "The Indigenous Initiatives Gathering Place",
    "locations": [{
      "_id": "607e3ab0a0d3df815abfcfb1",
      "location_name": "SW1",
      "coordinates": "49.2508575,-123.0030182",
      "description": ""
    }],
    "description:": "The Indigenous Gathering Place is a comfortable, welcoming and safe space for students, families and staff. Mi Chap Tukw, the BCIT Indigenous Gathering Place (IGP) is located on the Burnaby campus at SW1-1521.",
    "custom_fields": [
      {
        "_id": "607e399e59c86677e2af65r7",
        "field_title": "Activities:",
        "content": "<ul><li>Activity 1</li><li>Activity 2</li></ul>"
      },
      {
        "_id": "607e399e59c86677e465r7",
        "field_title": "Campus",
        "content": "<p>Burnaby</p>"
      }
    ],
    "images": [
      {
        "_id": "607e399e59c8feg7e2af65r7",
        "image_url": "s3.aws.indigenousplantgo.com/images/gathering-place.jpg",
        "caption": "The Indigenous Initiatives Gathering Place"
      }
    ],
    "audio_files": [
      {
        "_id": "607e399459c86677e2af65r7",
        "audio_file_url": "s3.aws.indigenousplantgo.com/audio/gathering-place.mp3",
        "caption": "A speech about The Indigenous Initiatives "
      }
    ],
    "videos": [
      {
        "_id": "607e384559c86677e2af65r7",
        "video_url": "s3.aws.indigenousplantgo.com/video/lavender-bloom.mp4",
        "caption": "The construction of The Indigenous Initiatives Gathering Place"
      }
    ],
    "tags": [
      {
        "_id": "607e4qwee59c86677e2af65r7",
        "tag_name": "gathering place"
      },
      {
        "_id": "607e4qwee59c86677e2ewe5r7",
        "tag_name": "Burnaby Campus"
      }
    ],
    "categories": [
      {
        "_id": "607e4qwee59c86677e2ewe3447",
        "tag_name": "Building"
      }
    ],
    "plants": [
      {
        "_id": "607e399e59c86677e2af6587",
        "plant_name": "Lavender",
        "scientific_name": "Lavandula",
        "location": [{
          "_id": "607e3ab0a0d3df815abfcfb1",
          "location_name": "Lot A",
          "coordinates": "49°15&#39;16.2&quot;N 122°59&#39;53.7&quot;W",
          "description": ""
        }],
        "description:": "Lavender is a perennial shrub with purple flowers that bloom during the summer.",
        "custom_fields": [
          {
            "_id": "607e399e59c86677e2af65r7",
            "field_title": "Medicial Properties",
            "content": "<p>Helps alleviate headaches and nausea</p>"
          },
          {
            "_id": "607e399e59c86677e465r7",
            "field_title": "Aroma",
            "content": "<p>Sweet</p>"
          }
        ],
        "images": [
          {
            "_id": "607e399e59c8feg7e2af65r7",
            "image_url": "s3.aws.indigenousplantgo.com/images/lavender-1.jpg",
            "caption": "lavender in a big field"
          }
        ],
        "audio_files": [
          {
            "_id": "607e399459c86677e2af65r7",
            "audio_file_url": "s3.aws.indigenousplantgo.com/audio/lavender-speech.mp3",
            "caption": "A speech about lavender"
          }
        ],
        "videos": [
          {
            "_id": "607e384559c86677e2af65r7",
            "video_url": "s3.aws.indigenousplantgo.com/video/lavender-bloom.mp4",
            "caption": "A lavender flower blooming timelapse"
          }
        ],
        "tags": [
          {
            "_id": "607e4qwee59c86677e2af65r7",
            "tag_name": "flower"
          },
          {
            "_id": "607e4qwee59c86677e2ewe5r7",
            "tag_name": "purple"
          }
        ],
        "categories": [
          {
            "_id": "607e4qwee59c86677e2ewe3447",
            "category_name": "Prennenial"
          }
        ],
        "revision_history": [
          {
            "_id": "607e3ab0a0d3df815abfcfb1",
            "user": "607e3ab0a0d3df815abfcfb1",
            "date": "April 20, 2021 at 6:30am"
          },
          {
            "_id": "607e3ab0a0d3df815abfcfb1",
            "user": "607e3ab0a0d3df815abfcfb1",
            "date": "April 20, 2021 at 2:30am"
          }
        ],
        "isPublish": false
      }
      // ...Repeat
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
    ],
    "isPublish": false
  }
  // ...Repeat
]
```

Get all plants and show the publish status