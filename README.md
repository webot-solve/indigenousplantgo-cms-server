# Indigenous Plant Go
Indigenous Plant Go is a mobile application that allows BCIT Students to explore the BCIT Burnaby campus and discover plants, and points-of-interests that have significance in the indigenous culture.

**Table Of Contents**
1. [Core Application Features](#core-application-features)
2. [Application Features](#application-features)
3. [Technology Stack](#technology-stack)
4. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram)
5. [Installation Documents](#installation)

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

### Technology Stack
* Database: MongoDB Cloud
* Server: NodeJS, express

### Entity Relationship Diagram
![](https://i.imgur.com/tIDo2eS.png)

### Installation
