const {MongoClient, ObjectID} = require('mongodb')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const nodemailer = require('nodemailer')

// const url = process.env.MONGO_DB_URL
// TEMPORARY
const url = process.env.MONGO_DB_URL_DEV

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
  const tours = db.collection('tours')
  const learn_more = db.collection('learn_more')

  //Users

  //Get all user
  //GET /api/users
  async function getUsers() {
    return await users.find().toArray()
  }

  //Create new user, use for register
  //Takes in email, username and password, role default to Manager
  //POST /api/users
  async function createUser({email, user_name, password, role="Manager"}) {
    //Check if email or username is repeating
    const user = await users.findOne({
      $or: [{email: email}, {user_name: user_name}]
    })
    if (user) {
      throw Error("Username or email is already taken")
    }

    if (!email) { //email can't be null
      throw Error("Requires an email")
    }

    if (typeof email === 'string' || email instanceof String) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if(!(re.test(email.toLowerCase()))) {
        throw Error("Incorrectly formatted email")
      }
    } else {
      throw Error("Invalid input for email")
    }

    if (!user_name) {
      throw Error("Requires an user name")
    }

    if (!(typeof user_name === 'string' || user_name instanceof String)) {
      throw Error("Invalid input for user_name")
    }

    if (!password) { //password can't be null
      throw Error("Requires a password")
    }

    if (!(typeof password === 'string' || password instanceof String)) {
      throw Error("Invalid input for password")
    }

    if (typeof role === 'string' || role instanceof String) {
      if (!(role === 'Manager' || role === 'Admin')) {
        throw Error("Invalid role, role must be Manager or Admin")
      }
    } else {
      throw Error("Invalid input for role")
    }

    //Hash password
    const encrypted = await bcrypt.hash(password, 12)

    const result = await users.insertOne({
      email,
      user_name,
      password: encrypted,
      role
    })

    //Need this to make jwt token later
    return result
  }

  //Get One user, use for login
  //Takes in email/username and password and find one user that match
  //POST /api/users/login
  async function getUserLogin({user_name, password}) {
    const user = await users.findOne({
      $or: [{email: user_name}, {user_name: user_name}]
    })
    if (!user) {
      throw Error("Invalid user")
    }

    if (!(typeof password === 'string' || password instanceof String)) {
      throw Error("Invalid input for password")
    }

    const same = await bcrypt.compare(password, user.password)
    if (!same) {
      throw Error("Password doesn't match")
    }

    return user
  }

  //Get One
  //GET /api/users/:userId
  async function getUser({userId}) {
    return await users.findOne({_id: ObjectID(userId)})
  }

  //Update One user, should be authorized
  //Update base on userId
  //PUT /api/users/:userId
  async function updateUser({userId, updatedUser, userRole}) {
    const user = await users.findOne({
      $or: [{email: updatedUser.email}, {user_name: updatedUser.user_name}]
    })
    if (user) {
      if (user._id != userId) {
        throw Error("Username or email is already taken")
      }
    }

    if (!updatedUser.email) {
      throw Error("Requires an email")
    }

    if (typeof updatedUser.email === 'string' || updatedUser.email instanceof String) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if(!(re.test(updatedUser.email.toLowerCase()))) {
        throw Error("Incorrectly formatted email")
      }
    } else {
      throw Error("Invalid input for email")
    }

    if (!updatedUser.user_name) {
      throw Error("Requires an user name")
    }

    if (!(typeof updatedUser.user_name === 'string' || updatedUser.user_name instanceof String)) {
      throw Error("Invalid input for user_name")
    }

    if (updatedUser.password != null) {
      if (!(typeof updatedUser.password === 'string' || updatedUser.password instanceof String)) {
        throw Error("Invalid input for password")
      }

      //Hash password
      const encrypted = await bcrypt.hash(updatedUser.password, 12)
      updatedUser.password = encrypted
    }
    
    if (updatedUser.role) {
      if (userRole !== "Admin") {
        throw Error("No permission to update role")
      }

      if (typeof updatedUser.role === 'string' || updatedUser.role instanceof String) {
        if (!(updatedUser.role === 'Manager' || updatedUser.role === 'Admin')) {
          throw Error("Invalid role, role must be Manager or Admin")
        }
      } else {
        throw Error("Invalid input for role")
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

  //Reset password
  //POST /api/users/resetPassword
  async function resetPassword({email}) {
    if (!email) {
      throw Error("Missing email")
    }

    const user = await users.findOne({email: email})

    if (!user) {
      throw Error("No user with that email")
    }

    //Random 8 character string that can be any of the characters here: 0-9, a-z
    var recoveryPassword = Math.random().toString(36).slice(-8)

    //Hash password
    const encrypted = await bcrypt.hash(recoveryPassword, 12)

    const result = await users.findOneAndUpdate(
      {email: email},
      {$set: {password: encrypted}}
    )

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password reset',
      text: `Dear ${user.user_name},\nYou have made a password recover/reset request to indigenous plant.\nYour recovery password is: ${recoveryPassword}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw Error(error)
      } else {
        return (`Email send: ${info.response}`)
      }
    })
  }

  //Images

  //Get All
  //GET /api/images
  async function getImages() {
    return await images.find().toArray()
  }

  //Create
  //Post /api/images
  async function createImage({url, newImage}) {
    if (!url) {
      throw Error("Missing image")
    }

    const image = await images.findOne({
      caption: newImage.caption
    })
    if (image) {
      throw Error("Image caption is already taken")
    }

    if (!newImage.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof newImage.caption === 'string' || newImage.caption instanceof String)) {
      throw Error("Invalid input for caption")
    }

    const result = await images.insertOne({
      image_url: url,
      ...newImage
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
    const image = await images.findOne({
      caption: updatedImage.caption
    })
    if (image) {
      if (image._id != imageId) {
        throw Error("Image caption is already taken")
      }
    }

    if (!updatedImage.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof updatedImage.caption === 'string' || updatedImage.caption instanceof String)) {
      throw Error("Invalid input for caption")
    }

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
  async function createAudio({url, newAudio}) {
    if (!url) {
      throw Error("Missing audio")
    }

    const audio = await audios.findOne({
      caption: newAudio.caption
    })
    if (audio) {
      throw Error("Audio caption is already taken")
    }

    if (!newAudio.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof newAudio.caption === 'string' || newAudio.caption instanceof String)) {
      throw Error("Invalid input for caption")
    }

    const result = await audios.insertOne({
      audio_file_url: url,
      ...newAudio
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
    const audio = await audios.findOne({
      caption: updatedAudio.caption
    })
    if (audio) {
      if (audio._id != audioId) {
        throw Error("Audio caption is already taken")
      }
    }

    if (!updatedAudio.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof updatedAudio.caption === 'string' || updatedAudio.caption instanceof String)) {
      throw Error("Invalid input for caption")
    }

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
  async function createVideo({newVideo}) {
    if (!newVideo.video_url) {
      throw Error("Missing video")
    }

    if (typeof newVideo.video_url === 'string' || newVideo.video_url instanceof String) {
      const re = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/
      if(!(re.test(newVideo.video_url.toLowerCase()))) {
        throw Error("Incorrectly formatted video url")
      }
    } else {
      throw Error("Invalid input for video_url")
    }

    const video = await videos.findOne({
      caption: newVideo.caption
    })
    if (video) {
      throw Error("Video caption is already taken")
    }

    if (!newVideo.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof newVideo.caption === 'string' || newVideo.caption instanceof String)) {
      throw Error("Invalid input for caption")
    }

    const result = await videos.insertOne({
      ...newVideo
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
  async function updateVideo({videoId, updatedVideo}) {
    if (!updatedVideo.video_url) {
      throw Error("Missing video")
    }

    if (typeof updatedVideo.video_url === 'string' || updatedVideo.video_url instanceof String) {
      const re = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/
      if(!(re.test(updatedVideo.video_url.toLowerCase()))) {
        throw Error("Incorrectly formatted video url")
      }
    } else {
      throw Error("Invalid input for video_url")
    }

    const video = await videos.findOne({
      caption: updatedVideo.caption
    })
    if (video) {
      if (video._id != videoId) {
        throw Error("Video caption is already taken")
      }
    }

    if (!updatedVideo.caption) {
      throw Error("Missing caption")
    }

    if (!(typeof updatedVideo.caption === 'string' || updatedVideo.caption instanceof String)) {
      throw Error("Invalid input for caption")
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
    const tag = await tags.findOne({
      tag_name: tag_name
    })
    if (tag) {
      throw Error("Tag already exist")
    }

    if (!tag_name) {
      throw Error("Require a tag name")
    }

    if (!(typeof tag_name === 'string' || tag_name instanceof String)) {
      throw Error("Invalid input for tag_name")
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
    const tag = await tags.findOne({
      tag_name: updatedTag.tag_name
    })
    if (tag) {
      if (tag._id != tagId) {
        throw Error("Tag already exist")
      }
    }

    if (!updatedTag.tag_name) {
      throw Error("Require a tag name")
    }

    if (!(typeof updatedTag.tag_name === 'string' || updatedTag.tag_name instanceof String)) {
      throw Error("Invalid input for tag_name")
    }

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
  async function createCategory({category_name, resource}) {
    const category = await categories.findOne({
      $and: [{category_name: category_name}, {resource: resource}]
    })
    if (category) {
      throw Error("Category already exist in this resource group")
    }

    if (!category_name) {
      throw Error("Require a category name")
    }

    if (!(typeof category_name === 'string' || category_name instanceof String)) {
      throw Error("Invalid input for category_name")
    }

    if (!resource) {
      throw Error("Require a resource")
    }

    if (typeof resource === 'string' || resource instanceof String) {
      if (!(resource === 'plant' || resource === 'waypoint' || resource === 'tour' || resource === 'learn_more')) {
        throw Error("Invalid resource, resource must be plant, waypoint, tour, or learn_more")
      }
    } else {
      throw Error("Invalid input for resource")
    }

    const result = await categories.insertOne({
      category_name,
      resource
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
    const category = await categories.findOne({
      $and: [{category_name: updatedCategory.category_name}, {resource: updatedCategory.resource}]
    })
    if (category) {
      if (category._id != categoryId) {
        throw Error("Category already exist in this resource group")
      }
    }

    if (!updatedCategory.category_name) {
      throw Error("Require a category name")
    }

    if (!(typeof updatedCategory.category_name === 'string' || updatedCategory.category_name instanceof String)) {
      throw Error("Invalid input for category_name")
    }

    if (!updatedCategory.resource) {
      throw Error("Require a resource")
    }

    if (typeof updatedCategory.resource === 'string' || updatedCategory.resource instanceof String) {
      if (!(updatedCategory.resource === 'plant' || updatedCategory.resource === 'waypoint' || updatedCategory.resource === 'tour' || updatedCategory.resource === 'learn_more')) {
        throw Error("Invalid resource, resource must be plant, waypoint, tour, or learn_more")
      }
    } else {
      throw Error("Invalid input for resource")
    }

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

  //Get base on resource
  //GET /api/categories/group/:group
  async function getCategoryGroup({group}) {
    return await categories.find({resource: group}).toArray()
  }

  //Locations
  
  //Get All
  //GET /api/locations
  async function getLocations() {
    return await locations.find().toArray()
  }

  //Create
  //POST /api/locations
  async function createLocation({location_name, longitude, latitude, description=""}) {
    if (!location_name) {
      throw Error("Require a location name")
    }

    if (!(typeof location_name === 'string' || location_name instanceof String)) {
      throw Error("Invalid input for location_name")
    }

    if (longitude == null) {
      throw Error("Require a longitude")
    }

    if (!(typeof longitude === 'number' && !Number.isNaN(longitude))) {
      throw Error("Invalid input for longitude")
    }

    if (latitude == null) {
      throw Error("Require a latitude")
    }

    if (!(typeof latitude === 'number' && !Number.isNaN(latitude))) {
      throw Error("Invalid input for latitude")
    }

    if (!(typeof description === 'string' || description instanceof String)) {
      throw Error("Invalid input for description")
    }

    const result = await locations.insertOne({
      location_name,
      longitude,
      latitude,
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
    if (!updatedLocation.location_name) {
      throw Error("Require a location name")
    }

    if (!(typeof updatedLocation.location_name === 'string' || updatedLocation.location_name instanceof String)) {
      throw Error("Invalid input for location_name")
    }

    if (updatedLocation.longitude == null) {
      throw Error("Require a longitude")
    }

    if (!(typeof updatedLocation.longitude === 'number' && !Number.isNaN(updatedLocation.longitude))) {
      throw Error("Invalid input for longitude")
    }

    if (updatedLocation.latitude == null) {
      throw Error("Require a latitude")
    }

    if (updatedLocation.latitude) {
      if (!(typeof updatedLocation.latitude === 'number' && !Number.isNaN(updatedLocation.latitude))) {
        throw Error("Invalid input for latitude")
      }
    }

    if (updatedLocation.description) {
      if (!(typeof updatedLocation.description === 'string' || updatedLocation.description instanceof String)) {
        throw Error("Invalid input for description")
      }
    }

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
    if (!user_id) {
      throw Error("User id missing")
    }

    const result = await revisions.insertOne({
      user: ObjectID(user_id),
      date: Date.now()
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
  //GET /api/plants/all
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
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          revision_history: {$addToSet: '$revision_history'}
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempPlants = await plants.aggregate(aggregateOptions).toArray()

    tempPlants.forEach((plant, index, self) => {
      if (!plant.revision_history[0]._id) {
        self[index].revision_history = []
      }
    })

    return tempPlants
  }

  //Get All published plants
  //GET /api/plants
  async function getPublishedPlants() {
    //Fields like images must be array of ObjectId
    //Should convert all the ObjectId array to array of their respective item
    const aggregateOptions = [
      {
        $match: {
          isPublish: true
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
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          revision_history: {$addToSet: '$revision_history'}
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          'isPublish': 0,
          root: 0
        }
      }
    ]

    const tempPlants = await plants.aggregate(aggregateOptions).toArray()

    tempPlants.forEach((plant, index, self) => {
      if (!plant.revision_history[0]._id) {
        self[index].revision_history = []
      }
    })

    return tempPlants
  }

  //Create
  //POST /api/plants
  async function createPlant({newPlant, user_id}) {
    //Check required none array field first
    if (!newPlant.plant_name) {
      throw Error("Missing plant name")
    }

    if (!(typeof newPlant.plant_name === 'string' || newPlant.plant_name instanceof String)) {
      throw Error("Invalid input for plant_name")
    }

    if (!newPlant.scientific_name) {
      throw Error("Missing scientific name")
    }

    if (!(typeof newPlant.scientific_name === 'string' || newPlant.scientific_name instanceof String)) {
      throw Error("Invalid input for scientific_name")
    }

    if (!newPlant.description) {
      throw Error("Missing description")
    }

    if (!(typeof newPlant.description === 'string' || newPlant.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //Require passing in array of string
    //Default to empty array if the field is not given
    if (newPlant.images !== null && newPlant.images !== undefined) {
      if (!Array.isArray(newPlant.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        newPlant.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    } else {
      newPlant.images = []
    }

    if (newPlant.audio_files !== null && newPlant.audio_files !== undefined) {
      if (!Array.isArray(newPlant.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        newPlant.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    } else {
      newPlant.audio_files = []
    }

    if (newPlant.videos !== null && newPlant.videos !== undefined) {
      if (!Array.isArray(newPlant.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        newPlant.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    } else {
      newPlant.videos = []
    }

    if (newPlant.tags !== null && newPlant.tags !== undefined) {
      if (!Array.isArray(newPlant.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        newPlant.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    } else {
      newPlant.tags = []
    }

    if (newPlant.categories !== null && newPlant.categories !== undefined) {
      if (!Array.isArray(newPlant.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        newPlant.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    } else {
      newPlant.categories = []
    }

    if (newPlant.locations !== null && newPlant.locations !== undefined) {
      if (!Array.isArray(newPlant.locations)) {
        throw Error("Invalid input for the field locations")
      }

      if (newPlant.locations.length < 1) {
        throw Error("Require at least one location")
      }

      try {
        newPlant.locations.forEach((location, index, self) => {
          self[index] = ObjectID(location)
        })
      } catch {
        throw Error("Not all elements under locations are valid")
      }
    } else {
      throw Error("Require at least one location")
    }

    if (newPlant.custom_fields !== null && newPlant.custom_fields !== undefined) {
      if (!Array.isArray(newPlant.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      //If custom_fields exist, it must have _id, field_title, and content
      newPlant.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(temp._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    } else {
      newPlant.custom_fields = []
    }

    //New plant start off not published
    newPlant.isPublish = false

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
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          revision_history: {$addToSet: '$revision_history'}
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempPlant = await plants.aggregate(aggregateOptions).next()

    if (!tempPlant.revision_history[0]._id) {
      tempPlant.revision_history = []
    }

    return tempPlant
  }

  //Update
  //PUT /api/plants/:plantId
  async function updatePlant({plantId, updatedPlant, user_id}) {
    if (!updatedPlant.plant_name) {
      throw Error("Missing plant name")
    }

    if (!(typeof updatedPlant.plant_name === 'string' || updatedPlant.plant_name instanceof String)) {
      throw Error("Invalid input for plant_name")
    }

    if (!updatedPlant.scientific_name) {
      throw Error("Missing scientific name")
    }

    if (!(typeof updatedPlant.scientific_name === 'string' || updatedPlant.scientific_name instanceof String)) {
      throw Error("Invalid input for scientific_name")
    }

    if (!updatedPlant.description) {
      throw Error("Missing description")
    }

    if (!(typeof updatedPlant.description === 'string' || updatedPlant.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //User should get data of the plant when they start editing
    if (updatedPlant.images !== null && updatedPlant.images !== undefined) {
      if (!Array.isArray(updatedPlant.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        updatedPlant.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    }

    if (updatedPlant.audio_files !== null && updatedPlant.audio_files !== undefined) {
      if (!Array.isArray(updatedPlant.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        updatedPlant.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    }

    if (updatedPlant.videos !== null && updatedPlant.videos !== undefined) {
      if (!Array.isArray(updatedPlant.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        updatedPlant.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    }

    if (updatedPlant.tags !== null && updatedPlant.tags !== undefined) {
      if (!Array.isArray(updatedPlant.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        updatedPlant.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    }

    if (updatedPlant.categories !== null && updatedPlant.categories !== undefined) {
      if (!Array.isArray(updatedPlant.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        updatedPlant.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    }

    if (updatedPlant.locations !== null && updatedPlant.locations !== undefined) {
      if (!Array.isArray(updatedPlant.locations)) {
        throw Error("Invalid input for the field locations")
      }

      if (updatedPlant.locations.length < 1) {
        throw Error("Require at least one location")
      }

      try {
        updatedPlant.locations.forEach((location, index, self) => {
          self[index] = ObjectID(location)
        })
      } catch {
        throw Error("Not all elements under locations are valid")
      }
    } else {
      throw Error("Require at least one location")
    }

    if (updatedPlant.custom_fields !== null && updatedPlant.custom_fields !== undefined) {
      if (!Array.isArray(updatedPlant.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      //If custom_fields exist, it must have _id, field_title, and content
      updatedPlant.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    }

    if (updatedPlant.isPublish !== null && updatedPlant.isPublish !== undefined) {
      if (!(typeof updatedPlant.isPublish === 'boolean')) {
        throw Error("Invalid input for isPublish")
      }
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
  //GET /api/waypoints/all
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
          localField: 'locations',
          foreignField: '_id',
          as: 'locations'
        }
      },
      //Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      },
      {
        $unwind: {
          path: '$plants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'plants.images',
          foreignField: '_id',
          as: 'plants.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'plants.audio_files',
          foreignField: '_id',
          as: 'plants.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'plants.videos',
          foreignField: '_id',
          as: 'plants.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'plants.tags',
          foreignField: '_id',
          as: 'plants.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'plants.categories',
          foreignField: '_id',
          as: 'plants.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'plants.locations',
          foreignField: '_id',
          as: 'plants.locations'
        }
      },
      //Plant Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'plants.revision_history',
          foreignField: '_id',
          as: 'plants.revision_history'
        }
      },
      // {
      //   $unwind: {
      //     path: '$plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'plants.revision_history.user'
      //   }
      // },
      //Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          plants: {$addToSet: '$plants'},
          revision_history: {$addToSet: '$revision_history'},
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'plants.revision_history.user.password': 0,
          'plants.revision_history.user.role': 0,
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempWaypoints = await waypoints.aggregate(aggregateOptions).toArray()

    tempWaypoints.forEach((waypoint, index, self) => {
      if (!waypoint.plants[0]._id) {
        self[index].plants = []
      }

      if (!waypoint.revision_history[0]._id) {
        self[index].revision_history = []
      }
    })

    return tempWaypoints
  }

  //Get All published waypoints
  //GET /api/waypoints
  async function getPublishedWaypoints() {
    //Fields like images must be array of ObjectId
    //Should convert all the ObjectId array to array of their respective item
    const aggregateOptions = [
      {
        $match: {
          isPublish: true
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
      //Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      },
      {
        $unwind: {
          path: '$plants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'plants.images',
          foreignField: '_id',
          as: 'plants.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'plants.audio_files',
          foreignField: '_id',
          as: 'plants.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'plants.videos',
          foreignField: '_id',
          as: 'plants.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'plants.tags',
          foreignField: '_id',
          as: 'plants.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'plants.categories',
          foreignField: '_id',
          as: 'plants.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'plants.locations',
          foreignField: '_id',
          as: 'plants.locations'
        }
      },
      //Plant Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'plants.revision_history',
          foreignField: '_id',
          as: 'plants.revision_history'
        }
      },
      // {
      //   $unwind: {
      //     path: '$plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'plants.revision_history.user'
      //   }
      // },
      //Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          plants: {$addToSet: '$plants'},
          revision_history: {$addToSet: '$revision_history'},
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'plants.revision_history.user.password': 0,
          'plants.revision_history.user.role': 0,
          'plants.isPublish': 0,
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          'isPublish': 0,
          root: 0
        }
      }
    ]

    const tempWaypoints = await waypoints.aggregate(aggregateOptions).toArray()

    tempWaypoints.forEach((waypoint, index, self) => {
      if (!waypoint.plants[0]._id) {
        self[index].plants = []
      }

      if (!waypoint.revision_history[0]._id) {
        self[index].revision_history = []
      }
    })

    return tempWaypoints
  }

  //Create
  //POST /api/waypoints
  async function createWaypoint({newWaypoint, user_id}) {
    //Check required none array field first
    if (!newWaypoint.waypoint_name) {
      throw Error("Missing waypoint name")
    }

    if (!(typeof newWaypoint.waypoint_name === 'string' || newWaypoint.waypoint_name instanceof String)) {
      throw Error("Invalid input for waypoint_name")
    }

    if (!newWaypoint.description) {
      throw Error("Missing description")
    }

    if (!(typeof newWaypoint.description === 'string' || newWaypoint.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //Require passing in array of string
    //Default to empty array if the field is not given
    if (newWaypoint.images !== null && newWaypoint.images !== undefined) {
      if (!Array.isArray(newWaypoint.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        newWaypoint.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    } else {
      newWaypoint.images = []
    }

    if (newWaypoint.audio_files !== null && newWaypoint.audio_files !== undefined) {
      if (!Array.isArray(newWaypoint.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        newWaypoint.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    } else {
      newWaypoint.audio_files = []
    }

    if (newWaypoint.videos !== null && newWaypoint.videos !== undefined) {
      if (!Array.isArray(newWaypoint.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        newWaypoint.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    } else {
      newWaypoint.videos = []
    }

    if (newWaypoint.tags !== null && newWaypoint.tags !== undefined) {
      if (!Array.isArray(newWaypoint.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        newWaypoint.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    } else {
      newWaypoint.tags = []
    }

    if (newWaypoint.categories !== null && newWaypoint.categories !== undefined) {
      if (!Array.isArray(newWaypoint.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        newWaypoint.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    } else {
      newWaypoint.categories = []
    }

    if (newWaypoint.locations !== null && newWaypoint.locations !== undefined) {
      if (!Array.isArray(newWaypoint.locations)) {
        throw Error("Invalid input for the field locations")
      }

      if (newWaypoint.locations.length < 1) {
        throw Error("Require at least one location")
      }

      try {
        newWaypoint.locations.forEach((location, index, self) => {
          self[index] = ObjectID(location)
        })
      } catch {
        throw Error("Not all elements under locations are valid")
      }
    } else {
      throw Error("Require at least one location")
    }

    if (newWaypoint.plants !== null && newWaypoint.plants !== undefined) {
      if (!Array.isArray(newWaypoint.plants)) {
        throw Error("Invalid input for the field plants")
      }

      try {
        newWaypoint.plants.forEach((plant, index, self) => {
          self[index] = ObjectID(plant)
        })
      } catch {
        throw Error("Not all elements under plants are valid")
      }
    } else {
      newWaypoint.plants = []
    }

    if (newWaypoint.custom_fields !== null && newWaypoint.custom_fields !== undefined) {
      if (!Array.isArray(newWaypoint.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      newWaypoint.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid ")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    } else {
      newWaypoint.custom_fields = []
    }

    //New waypoint start off not published
    newWaypoint.isPublish = false

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
          localField: 'locations',
          foreignField: '_id',
          as: 'locations'
        }
      },
      //Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      },
      {
        $unwind: {
          path: '$plants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'plants.images',
          foreignField: '_id',
          as: 'plants.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'plants.audio_files',
          foreignField: '_id',
          as: 'plants.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'plants.videos',
          foreignField: '_id',
          as: 'plants.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'plants.tags',
          foreignField: '_id',
          as: 'plants.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'plants.categories',
          foreignField: '_id',
          as: 'plants.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'plants.locations',
          foreignField: '_id',
          as: 'plants.locations'
        }
      },
      //Plant Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'plants.revision_history',
          foreignField: '_id',
          as: 'plants.revision_history'
        }
      },
      // {
      //   $unwind: {
      //     path: '$plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'plants.revision_history.user'
      //   }
      // },
      //Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          plants: {$addToSet: '$plants'},
          revision_history: {$addToSet: '$revision_history'},
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'plants.revision_history.user.password': 0,
          'plants.revision_history.user.role': 0,
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempWaypoint = await waypoints.aggregate(aggregateOptions).next()

    if (!tempWaypoint.plants[0]._id) {
      tempWaypoint.plants = []
    }

    if (!tempWaypoint.revision_history[0]._id) {
      tempWaypoint.revision_history = []
    }

    return tempWaypoint
  }

  //Update
  //PUT /api/waypoints/:waypointId
  async function updateWaypoint({waypointId, updatedWaypoint, user_id}) {
    if (!updatedWaypoint.waypoint_name) {
      throw Error("Missing waypoint name")
    }

    if (!(typeof updatedWaypoint.waypoint_name === 'string' || updatedWaypoint.waypoint_name instanceof String)) {
      throw Error("Invalid input for waypoint_name")
    }

    if (!updatedWaypoint.description) {
      throw Error("Missing description")
    }

    if (!(typeof updatedWaypoint.description === 'string' || updatedWaypoint.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //User should get data of the waypoint when they start editing
    if (updatedWaypoint.images !== null && updatedWaypoint.images !== undefined) {
      if (!Array.isArray(updatedWaypoint.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        updatedWaypoint.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    }

    if (updatedWaypoint.audio_files !== null && updatedWaypoint.audio_files !== undefined) {
      if (!Array.isArray(updatedWaypoint.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        updatedWaypoint.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    }

    if (updatedWaypoint.videos !== null && updatedWaypoint.videos !== undefined) {
      if (!Array.isArray(updatedWaypoint.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        updatedWaypoint.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    }

    if (updatedWaypoint.tags !== null && updatedWaypoint.tags !== undefined) {
      if (!Array.isArray(updatedWaypoint.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        updatedWaypoint.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    }

    if (updatedWaypoint.categories !== null && updatedWaypoint.categories !== undefined) {
      if (!Array.isArray(updatedWaypoint.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        updatedWaypoint.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    }

    if (updatedWaypoint.locations !== null && updatedWaypoint.locations !== undefined) {
      if (!Array.isArray(updatedWaypoint.locations)) {
        throw Error("Invalid input for the field locations")
      }

      if (updatedWaypoint.locations.length < 1) {
        throw Error("Require at least one location")
      }

      try {
        updatedWaypoint.locations.forEach((location, index, self) => {
          self[index] = ObjectID(location)
        })
      } catch {
        throw Error("Not all elements under locations are valid")
      }
    } else {
      throw Error("Require at least one location")
    }

    if (updatedWaypoint.plants !== null && updatedWaypoint.plants !== undefined) {
      if (!Array.isArray(updatedWaypoint.plants)) {
        throw Error("Invalid input for the field plants")
      }

      try {
        updatedWaypoint.plants.forEach((plant, index, self) => {
          self[index] = ObjectID(plant)
        })
      } catch {
        throw Error("Not all elements under plants are valid")
      }
    }

    if (updatedWaypoint.custom_fields !== null && updatedWaypoint.custom_fields !== undefined) {
      if (!Array.isArray(updatedWaypoint.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      updatedWaypoint.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    }

    if (updatedWaypoint.isPublish !== null && updatedWaypoint.isPublish !== undefined) {
      if (!(typeof updatedWaypoint.isPublish === 'boolean')) {
        throw Error("Invalid input for isPublish")
      }
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

  //Tour

  //Get All
  //GET /api/tours
  async function getTours() {
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
      //Plants
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      },
      {
        $unwind: {
          path: '$plants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'plants.images',
          foreignField: '_id',
          as: 'plants.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'plants.audio_files',
          foreignField: '_id',
          as: 'plants.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'plants.videos',
          foreignField: '_id',
          as: 'plants.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'plants.tags',
          foreignField: '_id',
          as: 'plants.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'plants.categories',
          foreignField: '_id',
          as: 'plants.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'plants.locations',
          foreignField: '_id',
          as: 'plants.locations'
        }
      },
      //Plant Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'plants.revision_history',
          foreignField: '_id',
          as: 'plants.revision_history'
        }
      },
      // {
      //   $unwind: {
      //     path: '$plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'plants.revision_history.user'
      //   }
      // },
      //Waypoint
      {
        $lookup: {
          from: 'waypoints',
          localField: 'waypoints',
          foreignField: '_id',
          as: 'waypoints'
        }
      },
      {
        $unwind: {
          path: '$waypoints',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'waypoints.images',
          foreignField: '_id',
          as: 'waypoints.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'waypoints.audio_files',
          foreignField: '_id',
          as: 'waypoints.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'waypoints.videos',
          foreignField: '_id',
          as: 'waypoints.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'waypoints.tags',
          foreignField: '_id',
          as: 'waypoints.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'waypoints.categories',
          foreignField: '_id',
          as: 'waypoints.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'waypoints.location',
          foreignField: '_id',
          as: 'waypoints.location'
        }
      },
      //Waypoint Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'waypoints.plants',
          foreignField: '_id',
          as: 'waypoints.plants'
        }
      },
      // {
      //   $unwind: {
      //     path: '$waypoints.plants',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'images',
      //     localField: 'waypoints.plants.images',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.images'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'audios',
      //     localField: 'waypoints.plants.audio_files',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.audio_files'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'videos',
      //     localField: 'waypoints.plants.videos',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.videos'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'tags',
      //     localField: 'waypoints.plants.tags',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.tags'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'categories',
      //     localField: 'waypoints.plants.categories',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.categories'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'locations',
      //     localField: 'waypoints.plants.locations',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.locations'
      //   }
      // },
      // //Waypoint Plant Revision
      // {
      //   $lookup: {
      //     from: 'revisions',
      //     localField: 'waypoints.plants.revision_history',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.revision_history'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$waypoints.plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'waypoints.plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'waypoints.plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.revision_history.user'
      //   }
      // },
      //Waypoint Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'waypoints.revision_history',
          foreignField: '_id',
          as: 'waypoints.revision_history'
        }
      },
      {
        $unwind: {
          path: '$waypoints.revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'waypoints.revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'waypoints.revision_history.user',
          foreignField: '_id',
          as: 'waypoints.revision_history.user'
        }
      },
      //Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          plants: {$addToSet: '$plants'},
          waypoints: {$addToSet: '$waypoints'},
          revision_history: {$addToSet: '$revision_history'},
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'plants.revision_history.user.password': 0,
          'plants.revision_history.user.role': 0,
          'waypoints.plants.revision_history.user.password': 0,
          'waypoints.plants.revision_history.user.role': 0,
          'waypoints.revision_history.user.password': 0,
          'waypoints.revision_history.user.role': 0,
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempTours = await tours.aggregate(aggregateOptions).toArray()

    tempTours.forEach((tour, index, self) => {
      if (!tour.plants[0]._id) {
        self[index].plants = []
      }

      if (!tour.waypoints[0]._id) {
        self[index].waypoints = []
      }
    })

    return tempTours
  }

  //Create
  //POST /api/tours
  async function createTour({newTour, user_id}) {
    //Check required none array field first
    if (!newTour.tour_name) {
      throw Error("Missing tour name")
    }

    if (!(typeof newTour.tour_name === 'string' || newTour.tour_name instanceof String)) {
      throw Error("Invalid input for tour_name")
    }

    if (!newTour.description) {
      throw Error("Missing description")
    }

    if (!(typeof newTour.description === 'string' || newTour.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //Require passing in array of string
    //Default to empty array if the field is not given
    if (newTour.images !== null && newTour.images !== undefined) {
      if (!Array.isArray(newTour.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        newTour.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    } else {
      newTour.images = []
    }

    if (newTour.audio_files !== null && newTour.audio_files !== undefined) {
      if (!Array.isArray(newTour.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        newTour.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    } else {
      newTour.audio_files = []
    }

    if (newTour.videos !== null && newTour.videos !== undefined) {
      if (!Array.isArray(newTour.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        newTour.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    } else {
      newTour.videos = []
    }

    if (newTour.tags !== null && newTour.tags !== undefined) {
      if (!Array.isArray(newTour.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        newTour.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    } else {
      newTour.tags = []
    }

    if (newTour.categories !== null && newTour.categories !== undefined) {
      if (!Array.isArray(newTour.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        newTour.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    } else {
      newTour.categories = []
    }

    if (newTour.plants !== null && newTour.plants !== undefined) {
      if (!Array.isArray(newTour.plants)) {
        throw Error("Invalid input for the field plants")
      }

      try {
        newTour.plants.forEach((plant, index, self) => {
          self[index] = ObjectID(plant)
        })
      } catch {
        throw Error("Not all elements under plants are valid")
      }
    } else {
      newTour.plants = []
    }

    if (newTour.waypoints !== null && newTour.waypoints !== undefined) {
      if (!Array.isArray(newTour.waypoints)) {
        throw Error("Invalid input for the field waypoints")
      }

      try {
        newTour.waypoints.forEach((waypoint, index, self) => {
          self[index] = ObjectID(waypoint)
        })
      } catch {
        throw Error("Not all elements under waypoints are valid")
      }
    } else {
      newTour.waypoints = []
    }

    if (newTour.custom_fields !== null && newTour.custom_fields !== undefined) {
      if (!Array.isArray(newTour.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      newTour.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    } else {
      newTour.custom_fields = []
    }

    //New revision for when tour is created
    const revision = await createRevision({user_id: user_id})

    newTour.revision_history = [ObjectID(revision.ops[0]._id)]

    const result = await tours.insertOne({
      ...newTour
    })
    return result
  }

  //Get One
  //GET /api/tours/:tourId
  async function getTour({tourId}) {
    const aggregateOptions = [
      {
        $match: {
          _id: ObjectID(tourId)
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
      //Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'plants',
          foreignField: '_id',
          as: 'plants'
        }
      },
      {
        $unwind: {
          path: '$plants',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'plants.images',
          foreignField: '_id',
          as: 'plants.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'plants.audio_files',
          foreignField: '_id',
          as: 'plants.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'plants.videos',
          foreignField: '_id',
          as: 'plants.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'plants.tags',
          foreignField: '_id',
          as: 'plants.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'plants.categories',
          foreignField: '_id',
          as: 'plants.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'plants.locations',
          foreignField: '_id',
          as: 'plants.locations'
        }
      },
      //Plant Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'plants.revision_history',
          foreignField: '_id',
          as: 'plants.revision_history'
        }
      },
      // {
      //   $unwind: {
      //     path: '$plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'plants.revision_history.user'
      //   }
      // },
      //Waypoint
      {
        $lookup: {
          from: 'waypoints',
          localField: 'waypoints',
          foreignField: '_id',
          as: 'waypoints'
        }
      },
      {
        $unwind: {
          path: '$waypoints',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'images',
          localField: 'waypoints.images',
          foreignField: '_id',
          as: 'waypoints.images'
        }
      },
      {
        $lookup: {
          from: 'audios',
          localField: 'waypoints.audio_files',
          foreignField: '_id',
          as: 'waypoints.audio_files'
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'waypoints.videos',
          foreignField: '_id',
          as: 'waypoints.videos'
        }
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'waypoints.tags',
          foreignField: '_id',
          as: 'waypoints.tags'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'waypoints.categories',
          foreignField: '_id',
          as: 'waypoints.categories'
        }
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'waypoints.location',
          foreignField: '_id',
          as: 'waypoints.location'
        }
      },
      //Waypoint Plant
      {
        $lookup: {
          from: 'plants',
          localField: 'waypoints.plants',
          foreignField: '_id',
          as: 'waypoints.plants'
        }
      },
      // {
      //   $unwind: {
      //     path: '$waypoints.plants',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'images',
      //     localField: 'waypoints.plants.images',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.images'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'audios',
      //     localField: 'waypoints.plants.audio_files',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.audio_files'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'videos',
      //     localField: 'waypoints.plants.videos',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.videos'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'tags',
      //     localField: 'waypoints.plants.tags',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.tags'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'categories',
      //     localField: 'waypoints.plants.categories',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.categories'
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'locations',
      //     localField: 'waypoints.plants.locations',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.locations'
      //   }
      // },
      // //Waypoint Plant Revision
      // {
      //   $lookup: {
      //     from: 'revisions',
      //     localField: 'waypoints.plants.revision_history',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.revision_history'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$waypoints.plants.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'waypoints.plants.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'waypoints.plants.revision_history.user',
      //     foreignField: '_id',
      //     as: 'waypoints.plants.revision_history.user'
      //   }
      // },
      //Waypoint Revision
      // {
      //   $lookup: {
      //     from: 'revisions',
      //     localField: 'waypoints.revision_history',
      //     foreignField: '_id',
      //     as: 'waypoints.revision_history'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$waypoints.revision_history',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $sort: {
      //     'waypoints.revision_history.date': -1
      //   }
      // },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'waypoints.revision_history.user',
      //     foreignField: '_id',
      //     as: 'waypoints.revision_history.user'
      //   }
      // },
      //Revision
      {
        $lookup: {
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          root: {$mergeObjects: '$$ROOT'},
          plants: {$addToSet: '$plants'},
          waypoints: {$addToSet: '$waypoints'},
          revision_history: {$addToSet: '$revision_history'},
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$root', '$$ROOT']
          }
        }
      },
      {
        $project: {
          'plants.revision_history.user.password': 0,
          'plants.revision_history.user.role': 0,
          // 'waypoints.plants.revision_history.user.password': 0,
          // 'waypoints.plants.revision_history.user.role': 0,
          // 'waypoints.revision_history.user.password': 0,
          // 'waypoints.revision_history.user.role': 0,
          'revision_history.user.password': 0,
          'revision_history.user.role': 0,
          root: 0
        }
      }
    ]

    const tempTour = await tours.aggregate(aggregateOptions).next()
    console.log(tempTour)

    if (!tempTour.plants[0]._id) {
      tempTour.plants = []
    }

    if (!tempTour.waypoints[0]._id) {
      tempTour.waypoints = []
    }

    return tempTour
  }

  //Update
  //PUT /api/tours/:tourId
  async function updateTour({tourId, updatedTour, user_id}) {
    if (!updatedTour.tour_name) {
      throw Error("Missing tour name")
    }

    if (!(typeof updatedTour.tour_name === 'string' || updatedTour.tour_name instanceof String)) {
      throw Error("Invalid input for tour_name")
    }

    if (!updatedTour.description) {
      throw Error("Missing description")
    }

    if (!(typeof updatedTour.description === 'string' || updatedTour.description instanceof String)) {
      throw Error("Invalid input for description")
    }

    //Convert all passed in array of id to ObjectId
    //User should get data of the tour when they start editing
    if (updatedTour.images !== null && updatedTour.images !== undefined) {
      if (!Array.isArray(updatedTour.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        updatedTour.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    }

    if (updatedTour.audio_files !== null && updatedTour.audio_files !== undefined) {
      if (!Array.isArray(updatedTour.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        updatedTour.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    }

    if (updatedTour.videos !== null && updatedTour.videos !== undefined) {
      if (!Array.isArray(updatedTour.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        updatedTour.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    }

    if (updatedTour.tags !== null && updatedTour.tags !== undefined) {
      if (!Array.isArray(updatedTour.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        updatedTour.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    }

    if (updatedTour.categories !== null && updatedTour.categories !== undefined) {
      if (!Array.isArray(updatedTour.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        updatedTour.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    }

    if (updatedTour.plants !== null && updatedTour.plants !== undefined) {
      if (!Array.isArray(updatedTour.plants)) {
        throw Error("Invalid input for the field plants")
      }

      try {
        updatedTour.plants.forEach((plant, index, self) => {
          self[index] = ObjectID(plant)
        })
      } catch {
        throw Error("Not all elements under plants are valid")
      }
    }

    if (updatedTour.waypoints !== null && updatedTour.waypoints !== undefined) {
      if (!Array.isArray(updatedTour.waypoints)) {
        throw Error("Invalid input for the field waypoints")
      }

      try {
        updatedTour.waypoints.forEach((waypoint, index, self) => {
          self[index] = ObjectID(waypoint)
        })
      } catch {
        throw Error("Not all elements under waypoints are valid")
      }
    }

    if (updatedTour.custom_fields !== null && updatedTour.custom_fields !== undefined) {
      if (!Array.isArray(updatedTour.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      updatedTour.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    }

    //New revision for when tour is updated
    const revision = await createRevision({user_id: user_id})

    const tour = await tours.findOne({_id: ObjectID(tourId)})
    updatedTour.revision_history = tour.revision_history
    updatedTour.revision_history.push(ObjectID(revision.ops[0]._id))

    const result = await tours.findOneAndUpdate(
      {_id: ObjectID(tourId)},
      {$set: {...updatedTour}}
    )
    return result
  }
  
  //Delete
  //DELETE /api/tours/:tourId
  async function deleteTour({tourId}) {
    const tour = await tours.findOne({_id: ObjectID(tourId)})
    tour.revision_history.forEach(async(revision) => {
      await deleteRevision({revisionId: revision})
    })

    const result = await tours.findOneAndDelete({
      _id: ObjectID(tourId)
    })
    return result
  }

  //Learn More

  //Get All
  //GET /api/learn_more
  async function getLearnMores(){
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
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          learn_more_title: {$first: '$learn_more_title'},
          description: {$first: '$description'},
          images: {$first: '$images'},
          audio_files: {$first: '$audio_files'},
          videos: {$first: '$videos'},
          tags: {$first: '$tags'},
          categories: {$first: '$categories'},
          custom_fields: {$first: '$custom_fields'},
          revision_history: {$addToSet: '$revision_history'},
          isPublish:{$first: '$isPublish'}
          
        }
      },
      {
        $project: {
          'revision_history.user.password': 0,
          'revision_history.user.role': 0
        }
      }
    ]
    console.log(await learn_more.find().toArray())
    return await learn_more.aggregate(aggregateOptions).toArray()
  }

  //Create
  //POST /api/learn_more
  async function createLearnMore({newLearnMore, user_id}) {
    //Check required none array field first
    if (!newLearnMore.learn_more_title) {
      throw Error("Missing title")
    }

    if (!(typeof newLearnMore.learn_more_title === 'string' || newLearnMore.learn_more_title instanceof String)) {
      throw Error("Invalid input for learn_more_title")
    }

    if (!newLearnMore.description) {
      throw Error("Missing description")
    }

    if (!(typeof newLearnMore.description === 'string' || newLearnMore.description instanceof String)) {
      throw Error("Invalid input for description")
    }
   
    if (newLearnMore.images !== null && newLearnMore.images !== undefined) {
      if (!Array.isArray(newLearnMore.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        newLearnMore.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    } else {
      newLearnMore.images = []
    }

    if (newLearnMore.audio_files !== null && newLearnMore.audio_files !== undefined) {
      if (!Array.isArray(newLearnMore.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        newLearnMore.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    } else {
      newLearnMore.audio_files = []
    }

    if (newLearnMore.videos !== null && newLearnMore.videos !== undefined) {
      if (!Array.isArray(newLearnMore.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        newLearnMore.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    } else {
      newLearnMore.videos = []
    }

    if (newLearnMore.tags !== null && newLearnMore.tags !== undefined) {
      if (!Array.isArray(newLearnMore.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        newLearnMore.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    } else {
      newLearnMore.tags = []
    }

    if (newLearnMore.categories !== null && newLearnMore.categories !== undefined) {
      if (!Array.isArray(newLearnMore.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        newLearnMore.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    } else {
      newLearnMore.categories = []
    }

    if (newLearnMore.custom_fields !== null && newLearnMore.custom_fields !== undefined) {
      if (!Array.isArray(newLearnMore.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      newLearnMore.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    } else {
      newLearnMore.custom_fields = []
    }


    //New revision for when learn_more is created
    const revision = await createRevision({user_id: user_id})

    newLearnMore.revision_history = [ObjectID(revision.ops[0]._id)]

    const result = await learn_more.insertOne({
      ...newLearnMore
    })
    return result
  }

  //Get One
  //GET /api/learn_more/:learnMoreId
  async function getLearnMore({learnMoreId}) {
    const aggregateOptions = [
      {
        $match: {
          _id: ObjectID(learnMoreId)
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
          from: 'revisions',
          localField: 'revision_history',
          foreignField: '_id',
          as: 'revision_history'
        }
      },
      {
        $unwind: {
          path: '$revision_history',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          'revision_history.date': -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'revision_history.user',
          foreignField: '_id',
          as: 'revision_history.user'
        }
      },
      {
        $group: {
          _id: '$_id',
          learn_more_title: {$first: '$learn_more_title'},
          description: {$first: '$description'},
          images: {$first: '$images'},
          audio_files: {$first: '$audio_files'},
          videos: {$first: '$videos'},
          tags: {$first: '$tags'},
          categories: {$first: '$categories'},
          custom_fields: {$first: '$custom_fields'},
          revision_history: {$addToSet: '$revision_history'}
        }
      },
      {
        $project: {
          'revision_history.user.password': 0,
          'revision_history.user.role': 0
        }
      }
    ]

    return await learn_more.aggregate(aggregateOptions).next()
  }

  //Update
  //PUT /api/learn_more/:learnMoreId
  async function updateLearnMore({learnMoreId, updatedLearnMore, user_id}) {
    if (!updatedLearnMore.learn_more_title) {
      throw Error("Missing title")
    }

    if (!(typeof updatedLearnMore.learn_more_title === 'string' || updatedLearnMore.learn_more_title instanceof String)) {
      throw Error("Invalid input for learn_more_title")
    }

    if (!updatedLearnMore.description) {
      throw Error("Missing description")
    }

    if (!(typeof updatedLearnMore.description === 'string' || updatedLearnMore.description instanceof String)) {
      throw Error("Invalid input for description")
    }
    
    if (updatedLearnMore.images !== null && updatedLearnMore.images !== undefined) {
      if (!Array.isArray(updatedLearnMore.images)) {
        throw Error("Invalid input for the field images")
      }

      try {
        updatedLearnMore.images.forEach((image, index, self) => {
          self[index] = ObjectID(image)
        })
      } catch {
        throw Error("Not all elements under images are valid")
      }
    }

    if (updatedLearnMore.audio_files !== null && updatedLearnMore.audio_files !== undefined) {
      if (!Array.isArray(updatedLearnMore.audio_files)) {
        throw Error("Invalid input for the field audio_files")
      }

      try {
        updatedLearnMore.audio_files.forEach((audio, index, self) => {
          self[index] = ObjectID(audio)
        })
      } catch {
        throw Error("Not all elements under audio_files are valid")
      }
    }

    if (updatedLearnMore.videos !== null && updatedLearnMore.videos !== undefined) {
      if (!Array.isArray(updatedLearnMore.videos)) {
        throw Error("Invalid input for the field videos")
      }

      try {
        updatedLearnMore.videos.forEach((video, index, self) => {
          self[index] = ObjectID(video)
        })
      } catch {
        throw Error("Not all elements under videos are valid")
      }
    }

    if (updatedLearnMore.tags !== null && updatedLearnMore.tags !== undefined) {
      if (!Array.isArray(updatedLearnMore.tags)) {
        throw Error("Invalid input for the field tags")
      }

      try {
        updatedLearnMore.tags.forEach((tag, index, self) => {
          self[index] = ObjectID(tag)
        })
      } catch {
        throw Error("Not all elements under tags are valid")
      }
    }
    
    if (updatedLearnMore.categories !== null && updatedLearnMore.categories !== undefined) {
      if (!Array.isArray(updatedLearnMore.categories)) {
        throw Error("Invalid input for the field categories")
      }

      try {
        updatedLearnMore.categories.forEach((category, index, self) => {
          self[index] = ObjectID(category)
        })
      } catch {
        throw Error("Not all elements under categories are valid")
      }
    }

    if (updatedLearnMore.custom_fields !== null && updatedLearnMore.custom_fields !== undefined) {
      if (!Array.isArray(updatedLearnMore.custom_fields)) {
        throw Error("Invalid input for the field custom_fields")
      }

      updatedLearnMore.custom_fields.forEach((custom_field, index, self) => {
        //Check if element is type object
        if (!(typeof custom_field === 'object' && custom_field !== null)) {
          throw Error("At least one of the custom_field is not valid")
        }

        if (!custom_field._id) {
          throw Error("At least one of the custom_field is missing _id")
        }

        if (!custom_field.field_title) {
          throw Error("At least one of the custom_field is missing field_title")
        }

        if (!custom_field.content) {
          throw Error("At least one of the custom_field is missing content")
        }

        try {
          let temp = custom_field
          temp._id = ObjectID(custom_field._id)
          self[index] = temp
        } catch {
          throw Error("A _id under custom_field is not valid")
        }
      })
    }

    const revision = await createRevision({user_id: user_id})
    
    const learnmore = await learn_more.findOne({_id: ObjectID(learnMoreId)})
    updatedLearnMore.revision_history = learnmore.revision_history
    updatedLearnMore.revision_history.push(ObjectID(revision.ops[0]._id))

    const result = await learn_more.findOneAndUpdate(
      {_id: ObjectID(learnMoreId)},
      {$set: {...updatedLearnMore}}
    )
    return result
  }

  //Delete
  //DELETE /api/learn_more/:learnMoreId
  async function deleteLearnMore({learnMoreId}) {
    const learnMore = await learn_more.findOne({_id: ObjectID(learnMoreId)})
    learnMore.revision_history.forEach(async(revision) => {
      await deleteRevision({revisionId: revision})
    })

    const result = await learn_more.findOneAndDelete({
      _id: ObjectID(learnMoreId)
    })
    return result
  }

  return {
    //User
    getUsers,
    createUser,
    getUserLogin,
    getUser,
    updateUser,
    deleteUser,
    resetPassword,
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
    getCategoryGroup,
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
    getPublishedPlants,
    createPlant,
    getPlant,
    updatePlant,
    deletePlant,
    //Waypoint
    getWaypoints,
    getPublishedWaypoints,
    createWaypoint,
    getWaypoint,
    updateWaypoint,
    deleteWaypoint,
    //Tour
    getTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    //Learn More
    getLearnMores,
    createLearnMore,
    getLearnMore,
    updateLearnMore,
    deleteLearnMore
  }
}
