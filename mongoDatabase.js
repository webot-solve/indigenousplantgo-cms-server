const {MongoClient, ObjectID} = require('mongodb')
const bcrypt = require('bcryptjs')
const e = require('express')
require('dotenv').config()

const url = process.env.MONGO_DB_URL
const client = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

module.exports = async function() {
  await client.connect()

  const db = client.db()

  const users = db.collection('users')
  const images = db.collection('images')
  const audios = db.collection('audios')
  const videos = db.collection('videos')
  const tags = db.collection('tags')
  const categories = db.collection('categories')
  const locations = db.collection('locations')
  const revisions = db.collection('revisions')
  const plants = db.collection('plants')
  const waypoints = db.collection('waypoints')

  //Users

  //Create new user, use for register
  //Takes in email, username and password, role default to Manager
  //POST /api/users
  async function createUser({email, username, password, role="Manager"}) {
    //Check if email or username is repeating
    const user = await users.findOne({
      $or: [{email: email}, {username: username}]
    })
    if (user) {
      throw Error("Username or email is already taken")
    }

    if (!email) { //email can't be null
      throw Error("Requires an email")
    }

    if (!password) { //password can't be null
      throw Error("Requires a password")
    }

    //Hash password
    const encrypted = await bcrypt.hash(password, 12)

    const result = await users.insertOne({
      email,
      username,
      password: encrypted,
      role
    })

    //Need this to make jwt token later
    return result
  }

  //Get One user, use for login
  //Takes in email/username and password and find one user that match
  //POST /api/users/login
  async function getUser({username, password}) {
    const user = await users.findOne({
      $or: [{email: username}, {username: username}]
    })
    if (!user) {
      throw Error("Invalid user")
    }

    const same = await bcrypt.compare(password, user.password)
    if (!same) {
      throw Error("Password doesn't match")
    }

    return user
  }

  //Update One user, should be authorized
  //Update base on userId
  //PUT /api/users/:userId
  async function updateUser({userId, updatedUser, userRole}) {
    if (updatedUser.email || updatedUser.username) {
      const user = await users.findOne({
        $or: [{email: updatedUser.email}, {username: updatedUser.username}]
      })
      if (user) {
        if (user._id != userId) {
          throw Error("Username or email is already taken")
        }
      }
    }

    if (updatedUser.password) {
      //Hash password
      const encrypted = await bcrypt.hash(updatedUser.password, 12)
      updatedUser.password = encrypted
    }
    
    if (updatedUser.role) {
      if (userRole !== "Admin") {
        throw Error("No permission to update role")
      }
    }

    const result = await users.findOneAndUpdate(
      {_id: ObjectID(userId)},
      {$set: {...updatedUser}}
    )

    return result
  }

  //Delete One user, should be authorized
  //Delete user base on userId
  //DELETE /api/users/:userId
  async function deleteUser({userId}) {
    const result = await users.findOneAndDelete({
      _id: ObjectID(userId)
    })

    return result
  }

  //Images

  //Get All
  //GET /api/images
  async function getImages() {
    return await images.find().toArray()
  }

  //Create
  //Post /api/images
  async function createImage({url, updatedImage}) {
    if (!url) {
      throw Error("Missing image")
    }

    if (!updatedImage.caption) {
      throw Error("Missing caption")
    }

    const result = await images.insertOne({
      image_url: url,
      ...updatedImage
    })
    return result
  }

  //Get One
  //GET /api/images/:imageId
  async function getImage({imageId}) {
    return await images.findOne({_id: ObjectID(imageId)})
  }

  //Update
  //PUT /api/images/:imageId
  async function updateImage({imageId, url, updatedImage, s3}) {
    //There is a new url, delete the old one from s3
    if (url) {
      const image = await images.findOne({_id: ObjectID(imageId)})
      if (image.image_url) {
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.image_url.split(".com/")[1]
        }, function(err, data) {
          if (err) {
            console.log(err)
          } else {
            console.log("Success")
          }
        })
      }

      await images.findOneAndUpdate(
        {_id: ObjectID(imageId)},
        {$set: {
          image_url: url
        }}
      )
    }

    const result = await images.findOneAndUpdate(
      {_id: ObjectID(imageId)},
      {$set: {
        ...updatedImage
      }}
    )

    return result
  }

  //Delete
  //DELETE /api/images/:imageId
  async function deleteImage({imageId, s3}) {
    //Delete the image from s3 if there is any
    const image = await images.findOne({_id: ObjectID(imageId)})
    if (image.image_url) {
      s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: image.image_url.split(".com/")[1]
      }, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          console.log("Success")
        }
      })
    }

    const result = await images.findOneAndDelete({
      _id: ObjectID(imageId)
    })

    return result
  }

  //Audios

  //Get All
  //GET /api/audios
  async function getAudios() {
    return await audios.find().toArray()
  }

  //Create
  //Post /api/audios
  async function createAudio({url, updatedAudio}) {
    if (!url) {
      throw Error("Missing audio")
    }

    if (!updatedAudio.caption) {
      throw Error("Missing caption")
    }

    const result = await audios.insertOne({
      audio_file_url: url,
      ...updatedAudio
    })
    return result
  }

  //Get One
  //GET /api/audios/:audioId
  async function getAudio({audioId}) {
    return await audios.findOne({_id: ObjectID(audioId)})
  }

  //Update
  //PUT /api/audios/:audioId
  async function updateAudio({audioId, url, updatedAudio, s3}) {
    //There is a new url, delete the old one from s3
    if (url) {
      const audio = await audios.findOne({_id: ObjectID(audioId)})
      if (audio.audio_file_url) {
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: audio.audio_file_url.split(".com/")[1]
        }, function(err, data) {
          if (err) {
            console.log(err)
          } else {
            console.log("Success")
          }
        })
      }

      await audios.findOneAndUpdate(
        {_id: ObjectID(audioId)},
        {$set: {
          audio_file_url: url
        }}
      )
    }

    const result = await audios.findOneAndUpdate(
      {_id: ObjectID(audioId)},
      {$set: {
        ...updatedAudio
      }}
    )

    return result
  }

  //Delete
  //DELETE /api/audios/:audioId
  async function deleteAudio({audioId, s3}) {
    //Delete file from s3
    const audio = await audios.findOne({_id: ObjectID(audioId)})
    if (audio.audio_file_url) {
      s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: audio.audio_file_url.split(".com/")[1]
      }, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          console.log("Success")
        }
      })
    }

    const result = await audios.findOneAndDelete({
      _id: ObjectID(audioId)
    })

    return result
  }

  //Videos

  //Get All
  //GET /api/videos
  async function getVideos() {
    return await videos.find().toArray()
  }

  //Create
  //Post /api/videos
  async function createVideo({url, updatedVideo}) {
    if (!url) {
      throw Error("Missing video")
    }

    if (!updatedVideo.caption) {
      throw Error("Missing caption")
    }

    const result = await videos.insertOne({
      video_url: url,
      ...updatedVideo
    })
    return result
  }

  //Get One
  //GET /api/videos/:videoId
  async function getVideo({videoId}) {
    return await videos.findOne({_id: ObjectID(videoId)})
  }

  //Update
  //PUT /api/videos/:videoId
  async function updateVideo({videoId, url, updatedVideo, s3}) {
    //There is a new url, delete the old one from s3
    if (url) {
      const video = await videos.findOne({_id: ObjectID(videoId)})
      if (video.video_url) {
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: video.video_url.split(".com/")[1]
        }, function(err, data) {
          if (err) {
            console.log(err)
          } else {
            console.log("Success")
          }
        })
      }

      await videos.findOneAndUpdate(
        {_id: ObjectID(videoId)},
        {$set: {
          video_url: url
        }}
      )
    }

    const result = await videos.findOneAndUpdate(
      {_id: ObjectID(videoId)},
      {$set: {
        ...updatedVideo
      }}
    )

    return result
  }

  //Delete
  //DELETE /api/videos/:videoId
  async function deleteVideo({videoId, s3}) {
    //Delete file from s3
    const video = await videos.findOne({_id: ObjectID(videoId)})
    if (video.video_url) {
      s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: video.video_url.split(".com/")[1]
      }, function(err, data) {
        if (err) {
          console.log(err)
        } else {
          console.log("Success")
        }
      })
    }

    const result = await videos.findOneAndDelete({
      _id: ObjectID(videoId)
    })

    return result
  }

  //Tags
  
  //Get All
  //GET /api/tags
  async function getTags() {
    return await tags.find().toArray()
  }

  //Create
  //POST /api/tags
  async function createTag({tag_name}) {
    if (!tag_name) {
      throw Error("Require a tag name")
    }

    const result = await tags.insertOne({
      tag_name
    })
    return result
  }

  //Get One
  //Get /api/tags/:tagId
  async function getTag({tagId}) {
    return await tags.findOne({_id: ObjectID(tagId)})
  }

  //Update
  //PUT /api/tags/:tagId
  async function updateTag({tagId, updatedTag}) {
    const result = await tags.findOneAndUpdate(
      {_id: ObjectID(tagId)},
      {$set: {...updatedTag}}
    )
    return result
  }

  //Delete
  //DELETE /api/tags/:tagId
  async function deleteTag({tagId}) {
    const result = await tags.findOneAndDelete({
      _id: ObjectID(tagId)
    })
    return result
  }

  //Categories

  //Get All
  //GET /api/categories
  async function getCategories() {
    return await categories.find().toArray()
  }

  //Create
  //POST /api/categories
  async function createCategory({category_name}) {
    if (!category_name) {
      throw Error("Require a category name")
    }

    const result = await categories.insertOne({
      category_name
    })
    return result
  }

  //Get One
  //GET /api/categories/:categoryId
  async function getCategory({categoryId}) {
    return await categories.findOne({_id: ObjectID(categoryId)})
  }

  //Update
  //PUT /api/categories/:categoryId
  async function updateCategory({categoryId, updatedCategory}) {
    const result = await categories.findOneAndUpdate(
      {_id: ObjectID(categoryId)},
      {$set: {...updatedCategory}}
    )
    return result
  }
  
  //Delete
  //DELETE /api/categories/:categoryId
  async function deleteCategory({categoryId}) {
    const result = await categories.findOneAndDelete({
      _id: ObjectID(categoryId)
    })
    return result
  }

  //Locations
  
  //Get All
  //GET /api/locations
  async function getLocations() {
    return await locations.find().toArray()
  }

  //Create
  //POST /api/locations
  async function createLocation({location_name, coordinates, description=""}) {
    if (!location_name) {
      throw Error("Require a location name")
    }

    if (!coordinates) {
      throw Error("Require a coordinate")
    }

    const result = await locations.insertOne({
      location_name,
      coordinates,
      description
    })
    return result
  }

  //Get One
  //GET /api/locations/:locationId
  async function getLocation({locationId}) {
    return await locations.findOne({_id: ObjectID(locationId)})
  }

  //Update
  //PUT /api/locations/:locationId
  async function updateLocation({locationId, updatedLocation}) {
    const result = await locations.findOneAndUpdate(
      {_id: ObjectID(locationId)},
      {$set: {...updatedLocation}}
    )
    return result
  }
  
  //Delete
  //DELETE /api/locations/:locationId
  async function deleteLocation({locationId}) {
    const result = await locations.findOneAndDelete({
      _id: ObjectID(locationId)
    })
    return result
  }

  //Revisions
  
  //Get All
  //GET /api/revisions
  async function getRevisions() {
    return await revisions.find().toArray()
  }

  //Create
  //POST /api/revisions
  async function createRevision({user_id}) {
    if(!user_id) {
      throw Error("User id missing")
    }

    const result = await revisions.insertOne({
      user_id,
      date: Date.now().toString()
    })
    return result
  }

  //Get One
  //GET /api/revisions/:revisionId
  async function getRevision({revisionId}) {
    return await revisions.findOne({_id: ObjectID(revisionId)})
  }
  
  //Delete
  //DELETE /api/revisions/:revisionId
  async function deleteRevision({revisionId}) {
    const result = await revisions.findOneAndDelete({
      _id: ObjectID(revisionId)
    })
    return result
  }

  //Plant

  //Get All
  //GET /api/plants
  async function getPlants() {
    //Fields like images must be array of ObjectId
    //Should convert all the ObjectId array to array of their respective item
    const aggregateOptions = [
      {
        $lookup: {
          from: 'images',
          localField: 'images',
          foreignField: '_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'audio_files',
          foreignField: '_id',
          as: 'audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'videos',
          foreignField: '_id',
          as: 'videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locations',
          foreignField: '_id',
          as: 'locations'
        }
      },
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      }
    ]

    return await plants.aggregate(aggregateOptions).toArray()
  }

  //Create
  //POST /api/plants
  async function createPlant({newPlant, user_id}) {
    //Check required none array field first
    if(!newPlant.plant_name) {
      throw Error("Missing plant name")
    }

    if(!newPlant.scientific_name) {
      throw Error("Missing scientific name")
    }

    if(!newPlant.description) {
      throw Error("Missing description")
    }

    //Convert all passed in array of id to ObjectId
    //Require passing in array of string
    //Default to empty array if the field is not given
    if(newPlant.images) {
      newPlant.images.forEach((image, index, self) => {
        self[index] = ObjectID(image)
      })
    } else {
      newPlant.images = []
    }

    if(newPlant.audio_files) {
      newPlant.audio_files.forEach((audio, index, self) => {
        self[index] = ObjectID(audio)
      })
    } else {
      newPlant.audio_files = []
    }

    if(newPlant.videos) {
      newPlant.videos.forEach((video, index, self) => {
        self[index] = ObjectID(video)
      })
    } else {
      newPlant.videos = []
    }

    if(newPlant.tags) {
      newPlant.tags.forEach((tag, index, self) => {
        self[index] = ObjectID(tag)
      })
    } else {
      newPlant.tags = []
    }

    if(newPlant.categories) {
      newPlant.categories.forEach((category, index, self) => {
        self[index] = ObjectID(category)
      })
    } else {
      newPlant.categories = []
    }

    if(newPlant.locations) {
      newPlant.locations.forEach((location, index, self) => {
        self[index] = ObjectID(location)
      })
    } else {
      newPlant.locations = []
    }

    if(!newPlant.custom_fields) {
      newPlant.custom_fields = []
    }

    //New revision for when plant is created
    const revision = await createRevision({user_id: user_id})

    newPlant.revision_history = [ObjectID(revision.ops[0]._id)]

    const result = await plants.insertOne({
      ...newPlant
    })
    return result
  }

  //Get One
  //GET /api/plants/:plantId
  async function getPlant({plantId}) {
    const aggregateOptions = [
      {
        $match: {
          _id: ObjectID(plantId)
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'images',
          foreignField: '_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'audio_files',
          foreignField: '_id',
          as: 'audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'videos',
          foreignField: '_id',
          as: 'videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'locations',
          foreignField: '_id',
          as: 'locations'
        }
      },
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      }
    ]

    return await plants.aggregate(aggregateOptions).next()
  }

  //Update
  //PUT /api/plants/:plantId
  async function updatePlant({plantId, updatedPlant, user_id}) {
    //Convert all passed in array of id to ObjectId
    //User should get data of the plant when they start editing
    if(updatedPlant.images) {
      updatedPlant.images.forEach((image, index, self) => {
        self[index] = ObjectID(image)
      })
    }

    if(updatedPlant.audio_files) {
      updatedPlant.audio_files.forEach((audio, index, self) => {
        self[index] = ObjectID(audio)
      })
    }

    if(updatedPlant.videos) {
      updatedPlant.videos.forEach((video, index, self) => {
        self[index] = ObjectID(video)
      })
    }

    if(updatedPlant.tags) {
      updatedPlant.tags.forEach((tag, index, self) => {
        self[index] = ObjectID(tag)
      })
    }

    if(updatedPlant.categories) {
      updatedPlant.categories.forEach((category, index, self) => {
        self[index] = ObjectID(category)
      })
    }

    if(updatedPlant.locations) {
      updatedPlant.locations.forEach((location, index, self) => {
        self[index] = ObjectID(location)
      })
    }

    //New revision for when plant is updated
    const revision = await createRevision({user_id: user_id})

    const plant = await plants.findOne({_id: ObjectID(plantId)})
    updatedPlant.revision_history = plant.revision_history
    updatedPlant.revision_history.push(ObjectID(revision.ops[0]._id))

    const result = await plants.findOneAndUpdate(
      {_id: ObjectID(plantId)},
      {$set: {...updatedPlant}}
    )
    return result
  }
  
  //Delete
  //DELETE /api/plants/:plantId
  async function deletePlant({plantId}) {
    const plant = await plants.findOne({_id: ObjectID(plantId)})
    plant.revision_history.forEach(async(revision) => {
      await deleteRevision({revisionId: revision})
    })

    const result = await plants.findOneAndDelete({
      _id: ObjectID(plantId)
    })
    return result
  }

  //Waypoint

  //Get All
  //GET /api/waypoints
  async function getWaypoints() {
    //Fields like images must be array of ObjectId
    //Should convert all the ObjectId array to array of their respective item
    const aggregateOptions = [
      {
        $lookup: {
          from: 'images',
          localField: 'images',
          foreignField: '_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'audio_files',
          foreignField: '_id',
          as: 'audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'videos',
          foreignField: '_id',
          as: 'videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      }
    ]

    return await waypoints.aggregate(aggregateOptions).toArray()
  }

  //Create
  //POST /api/waypoints
  async function createWaypoint({newWaypoint, user_id}) {
    //Check required none array field first
    if(!newWaypoint.waypoint_name) {
      throw Error("Missing waypoint name")
    }

    if(!newWaypoint.description) {
      throw Error("Missing description")
    }

    //Convert all passed in array of id to ObjectId
    //Require passing in array of string
    //Default to empty array if the field is not given
    if(newWaypoint.images) {
      newWaypoint.images.forEach((image, index, self) => {
        self[index] = ObjectID(image)
      })
    } else {
      newWaypoint.images = []
    }

    if(newWaypoint.audio_files) {
      newWaypoint.audio_files.forEach((audio, index, self) => {
        self[index] = ObjectID(audio)
      })
    } else {
      newWaypoint.audio_files = []
    }

    if(newWaypoint.videos) {
      newWaypoint.videos.forEach((video, index, self) => {
        self[index] = ObjectID(video)
      })
    } else {
      newWaypoint.videos = []
    }

    if(newWaypoint.tags) {
      newWaypoint.tags.forEach((tag, index, self) => {
        self[index] = ObjectID(tag)
      })
    } else {
      newWaypoint.tags = []
    }

    if(newWaypoint.categories) {
      newWaypoint.categories.forEach((category, index, self) => {
        self[index] = ObjectID(category)
      })
    } else {
      newWaypoint.categories = []
    }

    if(newWaypoint.location) {
      newWaypoint.location = ObjectID(newWaypoint.location)
    } else {
      newWaypoint.location = ""
    }

    if(newWaypoint.plants) {
      newWaypoint.plants.forEach((plant, index, self) => {
        self[index] = ObjectID(plant)
      })
    } else {
      newWaypoint.plants = []
    }

    if(!newWaypoint.custom_fields) {
      newWaypoint.custom_fields = []
    }

    //New revision for when waypoint is created
    const revision = await createRevision({user_id: user_id})

    newWaypoint.revision_history = [ObjectID(revision.ops[0]._id)]

    const result = await waypoints.insertOne({
      ...newWaypoint
    })
    return result
  }

  //Get One
  //GET /api/waypoints/:waypointId
  async function getWaypoint({waypointId}) {
    const aggregateOptions = [
      {
        $match: {
          _id: ObjectID(waypointId)
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'images',
          foreignField: '_id',
          as: 'images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'audio_files',
          foreignField: '_id',
          as: 'audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'videos',
          foreignField: '_id',
          as: 'videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      }
    ]

    return await waypoints.aggregate(aggregateOptions).next()
  }

  //Update
  //PUT /api/waypoints/:waypointId
  async function updateWaypoint({waypointId, updatedWaypoint, user_id}) {
    //Convert all passed in array of id to ObjectId
    //User should get data of the waypoint when they start editing
    if(updatedWaypoint.images) {
      updatedWaypoint.images.forEach((image, index, self) => {
        self[index] = ObjectID(image)
      })
    }

    if(updatedWaypoint.audio_files) {
      updatedWaypoint.audio_files.forEach((audio, index, self) => {
        self[index] = ObjectID(audio)
      })
    }

    if(updatedWaypoint.videos) {
      updatedWaypoint.videos.forEach((video, index, self) => {
        self[index] = ObjectID(video)
      })
    }

    if(updatedWaypoint.tags) {
      updatedWaypoint.tags.forEach((tag, index, self) => {
        self[index] = ObjectID(tag)
      })
    }

    if(updatedWaypoint.categories) {
      updatedWaypoint.categories.forEach((category, index, self) => {
        self[index] = ObjectID(category)
      })
    }

    if(updatedWaypoint.location) {
      updatedWaypoint.location = ObjectID(updatedWaypoint.location)
    }

    if(updatedWaypoint.plants) {
      updatedWaypoint.plants.forEach((plant, index, self) => {
        self[index] = ObjectID(plant)
      })
    }

    //New revision for when waypoint is updated
    const revision = await createRevision({user_id: user_id})

    const waypoint = await waypoints.findOne({_id: ObjectID(waypointId)})
    updatedWaypoint.revision_history = waypoint.revision_history
    updatedWaypoint.revision_history.push(ObjectID(revision.ops[0]._id))

    const result = await waypoints.findOneAndUpdate(
      {_id: ObjectID(waypointId)},
      {$set: {...updatedWaypoint}}
    )
    return result
  }
  
  //Delete
  //DELETE /api/waypoints/:waypointId
  async function deleteWaypoint({waypointId}) {
    const waypoint = await waypoints.findOne({_id: ObjectID(waypointId)})
    waypoint.revision_history.forEach(async(revision) => {
      await deleteRevision({revisionId: revision})
    })

    const result = await waypoints.findOneAndDelete({
      _id: ObjectID(waypointId)
    })
    return result
  }

  return {
    //User
    createUser,
    getUser,
    updateUser,
    deleteUser,
    //Image
    getImages,
    createImage,
    getImage,
    updateImage,
    deleteImage,
    //Audio
    getAudios,
    createAudio,
    getAudio,
    updateAudio,
    deleteAudio,
    //Video
    getVideos,
    createVideo,
    getVideo,
    updateVideo,
    deleteVideo,
    //Tag
    getTags,
    createTag,
    getTag,
    updateTag,
    deleteTag,
    //Category
    getCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    //Location
    getLocations,
    createLocation,
    getLocation,
    updateLocation,
    deleteLocation,
    //Revision
    getRevisions,
    createRevision,
    getRevision,
    deleteRevision,
    //Plant
    getPlants,
    createPlant,
    getPlant,
    updatePlant,
    deletePlant,
    //Waypoint
    getWaypoints,
    createWaypoint,
    getWaypoint,
    updateWaypoint,
    deleteWaypoint
  }
}
