# Youtube Backend

This backend project is built with Node.js, express.js, mongoDB, mongoose, multer, JWT, bcrypt and many more. This project have all those features that a backend project have.

Services used to storing the data and files are mongoDB and cloudinary.

Project uses all standard practices like access token refresh token password increption and many more.

Project provides features like user authentication, upload images and videos, like/unlike, comment, subscribe and many more.


## Data Model

[Model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## Acknowledgements
- [Chai aur Code](https://www.youtube.com/@chaiaurcode)

## Lessons Learned

- while working on this project I have learned about data modeling, error handling, middleware, user authentication dealing with database, etc.

- one of the key learning points for me understanding about the mongoDB aggergigation pipelines.

- I also learned about how to write code according to industrial standards and also got know the importance of reusable code.

Api Routes 

### for user

- ```api/v1/users```
    - ```/register``` - POST - register a user
    - ```/login``` - POST - login a user
    - ```/logout``` - POST - logout a user
    - ```/refresh-token``` - POST - refresh-token a user
    - ```/change-password``` - POST - change-password a user
    - ```/current-user``` - GET - to get current user
    - ```/update-account``` - PATCH - update account details
    - ```/avatar``` - PATCH - update avatar
    - ```/cover-image``` - PATCH - cover-image update
    - ```/c/:username``` - GET - get channel details
    - ```/history``` - get - get watch history of a user


### for video
- ```api/v1/videos```
    - ```/``` -POST - publish a video
    - ```/?``` -GET - get videos
    - ```/:videoId``` -GET - search video
    - ```/:videoId``` -Patch - update video details
    - ```/:videoId``` -DELETE - Delete a video
    - ```/toggle/publish/:videoId``` -PATCH - toggle video publishing status