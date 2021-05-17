## Implementation
### Run Seeder
1. Go to folder /database/seederDeploy
2. Add .env file and place:
```
MONGO_DB_URL = <--MongoDB URL Connection in cluster-->
MONGO_DB_NAME = <--DatabaseName-->
```
3. On the terminal, enter the command
```
node seederBackup.js or node <--name of seeder file-->
```
