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

### For User

- `api/v1/users`
  - `/register` - POST - register a user
  - `/login` - POST - login a user
  - `/logout` - POST - logout a user
  - `/refresh-token` - POST - refresh-token a user
  - `/change-password` - POST - change-password a user
  - `/current-user` - GET - to get current user
  - `/update-account` - PATCH - update account details
  - `/avatar` - PATCH - update avatar
  - `/cover-image` - PATCH - cover-image update
  - `/c/:username` - GET - get channel details
  - `/history` - get - get watch history of a user

### For Video

- `api/v1/videos`
  - `/` -POST - publish a video
  - `/?` -GET - get videos
  - `/:videoId` -GET - search video
  - `/:videoId` -Patch - update video details
  - `/:videoId` -DELETE - Delete a video
  - `/toggle/publish/:videoId` -PATCH - toggle video publishing status

### For Playlist

- `/api/v1/playlist`

  - `/:playlistId` - GET - To fetch the playlist
  -PATCH - To update the playlist
  -DELETE - To delete the playlist

  - `/add/:videoId/:playlistId`- PATCH - To add video to the playlist

  - `/remove/:videoId/:playlistId`- PATCH - To remove video from the playlist

  - `/user/:userId`- GET - To get user playlists

### For Comments

- `/api/v1/comments`

  - `/:videoId` - GET - To get video comments
  -POST - To comment into a video

  - `/c/:commentId`- PATCH - To update the comment - DELETE- To delete the comment

### For Likes

- `/api/v1/likes`

  - `/toggle/v/:videoId`- POST - To toggle video like

  - `/toggle/c/:commentId`- POST - To toggle comment like

  - `/toggle/t/:tweetId`- POST - To toggle tweet like

  - `/videos`- GET - To get the liked videos of the logged in user

### For Subscription

- `/api/v1/subscriptions`

  - `/c/:channelId` - GET - To get Channel Subscribers
  -POST - To toggle subscription on the channel

  - `/u/:subscriberId`- GET - To get Subscribed channels

### For Tweets

- `/api/v1/tweets`

  - `/`- POST - To create a tweet

  - `/user/:userId`- GET - To get user tweets

  - `/:tweetId`- GET - To update the tweet

  - `/:tweetId`- DELETE - To delete the tweet

### For Dashboard

- `/api/v1/dashboard`

  - `/stats`- GET - To get channel stats(logged in)

  - `/videos`- GET - TTo get channel videos(logged in)

### For Health Check

- `/api/v1/healthcheck`

  - `/`- GET - Return OK Status

## Run Locally

Clone the project

```bash
  git clone https://github.com/rockmel03/backend_project.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Documentation

[mongoose](https://mongoosejs.com/docs/guide.html)

[multer](https://www.npmjs.com/package/multer)

[jason web tokens](https://www.npmjs.com/package/jsonwebtoken)

[cloudinary](https://cloudinary.com/documentation/node_integration)


## Feedback

If you have any feedback, please reach out to me at kamalmelkani03@gmail.com