const {MongoClient, ObjectID} = require('mongodb')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const url = 'mongodb://localhost:27017'
const dbName = 'indigenousPlant'
const client = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true})

module.exports = async function() {
  await client.connect()

  const db = client.db(dbName)

  const users = db.collection('users')
  const images = db.collection('images')
  const audios = db.collection('audios')
  const videos = db.collection('videos')
  const tags = db.collection('tags')
  const categories = db.collection('categories')
  const locations = db.collection('locations')
  const revisions = db.collection('revisions')

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
  //GET /api/plants
  async function getPlants({}) {
    const aggregateOptions = [
      {$unwind: '$images'},
      {
        $lookup: {
          from: 'images',
          let: {'imageId': '$_id'},
          pipline: [
            {$match: {$expr: {$eq: ['$$imageId','$images']}}}
          ]
        }
      }
    ]
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
    getPlants
  }
}
