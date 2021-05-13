# Indigenous Plant Go
Indigenous Plant Go is a mobile application that allows BCIT Students to explore the BCIT Burnaby campus and discover plants, and points-of-interests that have significance in the indigenous culture.

**Table Of Contents**
1. [Core Application Features](#core-application-features)
2. [Application Features](#application-features)
3. [Technology Stack](#technology-stack)
4. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram)
5. [Road-mapped Features](#road-mapped-features)
6. [Installation Documents](#installation)

### Content Management System (Server)
This specific repository houses the server-side functions of the mobile application's content management system (cms).

#### Core Application Features
* User authentication
* Users can create, read, update, delete resources:
    * Plants
    * Waypoints
    * Locations
    * Media (Images, Video, Audio)
    * Categories + Tags
* CMS Exposes a Restful API for the Mobile application to consume

#### Application Features
* Authentication with JWT
* User credentials are stored encrypted into the database
* Forgot password function allows users to recover their accounts
* Server-side & client-side input type and format validation
* Image and Audio uploads are stored in s3 and read from s3
* Videos will be uploaded exclusively via youtube link.
* PERMISSIONS are currently not implemented.

#### Road-mapped Features
* Programmatic database backups stored to S3
* Allow input for QR code data on a plant and/or waypoint resource
* Implement (2) more resource types: "tours", and "learn more"

### Technology Stack
* Database: MongoDB Cloud
* Server: NodeJS, express

### Entity Relationship Diagram
![](https://i.imgur.com/tIDo2eS.png)

### Installation
#### Local Installment
1. Clone the repo with the following code:
```
git clone https://github.com/BCITConstruction/indigenousplantgo-cms-server.git
```
And navigate into the folder:
```
cd indigenousplantgo-cms-server
```
2. Install all the node module with `npm install`.
3. Few things related to .env file needs to be set up:
  1. To run this locally you will need to set up a S3, see [S3 doc](./documentation/s3/README.md) for how to set that up.
  2. To run this locally you will need to set up mongoDb, if you have mongo shell and stuff you can just set `MONGO_DB_URL=mongodb://localhost:27017/<Your Db name>` in .env file. For mongoDb atlas set up, see [MongoDb Atlas doc](./documentation/mongoDb/README.md).
    - This also includes a seeder to fill the database with sample data, see [Seeder doc](./documentation/seeder/README.md) for how to use the seeder.
  3. One more thing to set up in .env file is sender email for recovering password.
    - For gmail you do need to have less secure app access on
Final .env file should have the following field: 
```
MONGO_DB_URL=<Your mongo_db url>
AWS_BUCKET_NAME=<Your s3 bucket name>
AWS_BUCKET_REGION=<Your s3 bucket region>
AWS_ACCESS_KEY=<Your s3 access key>
AWS_SECRET_KEY=<Your s3 secret key>
SENDER_EMAIL=<Your email that handles sending recovery email>
SENDER_PASSWORD=<Your password for the email above>
```
4. Running `npm start` now should run the api stuff at `http://localhost:8080`, for the routes see [All route docs](./documentation/api) for all the routes.
#### To deploy to heroku (using heroku cli)
1. Set up the app on heroku site and download heroku cli, typing heroku --version in your terminal to check if you install heroku cli correctly. 
2. Add add the heroku git url as a remote to this repo (you can get this from the setting from the app you set up on heroku site) and push to heroku.
```
git add remote heroku <Your heroku git url>
git push heroku master
```
3. You also need to set up s3 and mongoDb separately, but you put the variable that is suppose to go in .env file into config vars in heroku app's setting, see above to run locally step 2 to see what environmental variables are required.
  - An extra variable you can add is ACCESS_TOKEN_SECRET to separate the jwt token generated from your local with ones generated from your deployed app, the secret can be anything you want.
4. Once you set up all the environmental variables in config vars on heroku, you should be able to run it on your deployed domain, route still follow those in [All route docs](./documentation/api).
