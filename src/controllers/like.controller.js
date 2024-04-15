import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    const check = isValidObjectId(videoId)
    if (!check) throw new ApiError(400, "invalid videoId")

    try {
        const savedDocument = await Like.findOne(
            { video: videoId, likedBy: req.user?._id }
        )
        if (savedDocument) {

            const deletedLike = await Like.deleteOne({ _id: savedDocument?.id })
            return res
                .status(200)
                .json(new ApiResponse(200, deletedLike, "unliked successfully"))
        }
        const createdLike = await Like.create(
            {
                video: videoId,
                likedBy: req.user?._id
            }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, createdLike, "liked successfully"))

    } catch (error) {
        throw new ApiError(400, "internal server error: " + error)
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    const check = isValidObjectId(commentId)
    if (!check) throw new ApiError(400, "invalid videoId")

    try {
        const savedDocument = await Like.findOne(
            { comment: commentId, likedBy: req.user?._id }
        )
        if (savedDocument) {

            const deletedLike = await Like.deleteOne({ _id: savedDocument?.id })
            return res
                .status(200)
                .json(new ApiResponse(200, deletedLike, "unliked successfully"))
        }
        const createdLike = await Like.create(
            {
                comment: commentId,
                likedBy: req.user?._id
            }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, createdLike, "liked successfully"))

    } catch (error) {
        throw new ApiError(400, "internal server error: " + error)
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    const check = isValidObjectId(tweetId)
    if (!check) throw new ApiError(400, "invalid videoId")

    try {
        const savedDocument = await Like.findOne(
            { tweet: tweetId, likedBy: req.user?._id }
        )
        if (savedDocument) {

            const deletedLike = await Like.deleteOne({ _id: savedDocument?.id })
            return res
                .status(200)
                .json(new ApiResponse(200, deletedLike, "unliked successfully"))
        }
        const createdLike = await Like.create(
            {
                tweet: tweetId,
                likedBy: req.user?._id
            }
        )
        return res
            .status(200)
            .json(new ApiResponse(200, createdLike, "liked successfully"))

    } catch (error) {
        throw new ApiError(400, "internal server error: " + error)
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {

        const likedVideos = await Like.aggregate([
            {
                $match: {
                    $and: [
                        { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
                        { video: { $exists: true, } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            fullName: 1,
                                            avatar: 1,
                                            coverImage: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: { $first: "$owner" },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 0,
                    video: { $first: "$video" },
                },
            },
        ]
        )

        const videos = likedVideos.map(item => item.video)
        return res
            .status(200)
            .json(new ApiResponse(200, videos, "videos fetched successfully"))
    } catch (error) {
        throw new ApiError(400, "internal server error: " + error)
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}