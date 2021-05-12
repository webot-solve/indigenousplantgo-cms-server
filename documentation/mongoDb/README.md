# MongoDb Atlas Documentation
## MongoDb Atlas setup
1. Create a new project and a new cluster within that project on MongoDb Atlas.
  - The cloud provider shouldn't matter and for region pick one closest to you.
  - For the tier pick the service best for you but do mind that different service cost different amount accordingly, can use free tier which has 512MB of storage.
  - Feel free to name the cluster but since we are only going to use one cluster it doesn't really matter.
2. Once the cluster is set up, click connect button on the cluster.
3. For the IP address set it for everyone (0.0.0.0/0).
  - The heroku set up we have now doesn't have a fix IP address which is something worth looking into later on.
4. For database user, create any user and remember the username and password.
  - This user is used to grant access to modify the database, you can create more users but it is not necessary.
5. For choosing the connection method, click on connect your application. You will be given an url where you need to fill in the username and password and the database name in there. This is the url you will need to put in the environment variable `MONGO_DB_URL`.
  - For local installation of the server side code you put it in .env file.
  - For heroku deployment you put this in the config vars.
6. This should be all you need to do.