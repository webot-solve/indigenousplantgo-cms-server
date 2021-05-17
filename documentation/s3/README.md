# S3 Documentation
## S3 setup
1. Create the s3 bucket on aws, note the region you create the bucket.
  - For this you can uncheck the block all public access here or you can do that later.
2. Once you create the bucket go in it and go to properties to grab your arn and go to permissions.
3. Make sure you have block all public access uncheck and edit the bucket policy with something similar to this:
```
{
    "Version": "2008-10-17",
    "Id": "myPublicPolicy",
    "Statement": [
        {
            "Sid": "publicBucketPolicy",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": [
                "<Your arn here>/*",
                "<Your arn here>"
            ]
        }
    ]
}
```
4. Go to your IAM dashboard and to policies to create a new one.
5. For the permission of the new policy you should go to JSON tab and have something similar to the following:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "<Your arn here>/*"
        }
    ]
}
```
- Also you don't need to worry about tags, just give it whatever name you like.
6. Now go to user and create a new user.
7. Create a user with access type programmatic access.
8. For permission select attach existing policies and find the policy you created.
9. Now just skip tags and to the complete screen and grab the access key and the secret key.
  - Secret key can only be accessed here, so keep it save.
10. Go back to the code and create a .env file under the server folder.
11. In it add the following:
```
AWS_BUCKET_NAME=<Your bucket name>
AWS_BUCKET_REGION=<Your bucket region>
AWS_ACCESS_KEY=<Access key you got from creating user>
AWS_SECRET_KEY=<Secret key you got from creating user>
```
12. After that you should be good.