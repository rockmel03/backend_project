import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id
    try {

        const totalSubscribers = await Subscription.countDocuments({ channel: userId })
        const videos = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes",
                }
            },
            {
                $addFields: {
                    likes: {
                        $size: "$likes"
                    }
                }
            }
        ])

        const totalVideos = videos.length
        const totalVideosViews = videos.reduce((acc, curr) => acc + curr?.views, 0)
        const totalLikes = videos.reduce((acc, curr) => acc + curr?.likes, 0)

        let dashboardData = {
            totalSubscribers,
            totalVideos,
            totalVideosViews,
            totalLikes
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dashboardData, "dashboard stats fetched sucessfully"))
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    try {
        const videos = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $project: {
                    owner: 0,
                }
            }
        ])

        return res
            .status(200)
            .json(new ApiResponse(200, videos, "videos fetched sucessfully"))
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

export {
    getChannelStats,
    getChannelVideos
}