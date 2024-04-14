import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    const check = isValidObjectId(channelId)
    if (!check) throw new ApiError(400, "invalid channelId")

    const user = await User.findById(channelId).select("-password")
    if (!user) throw new ApiError(400, "channel not found invalid channelId")

    const subscription = await Subscription.findOne(
        {
            subscriber: req.user?._id,
            channel: channelId,
        }
    )
    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id)
        return res
            .status(200)
            .json(
                new ApiResponse(200, "subscription deleted successfully")
            )
    }

    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    })
    return res
        .status(200)
        .json(
            new ApiResponse(200, newSubscription, "subscription created successfully")
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const check = isValidObjectId(channelId)
    if (!check) throw new ApiError(400, "invalid channelId")

    try {
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId),
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscriber",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                avatar: 1,
                                coverImage: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    subscriberData: { $first: "$subscriber" }
                }
            }
        ])

        const allSubscribersData = subscribers.map(sub => sub.subscriberData)

        return res
            .status(200)
            .json(new ApiResponse(200, allSubscribersData, "subscribers fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const check = isValidObjectId(subscriberId)
    if (!check) throw new ApiError(400, "invalid subscriberId")

    try {
        const subscribedChannels = await Subscription.aggregate([
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(subscriberId),
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channel",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                avatar: 1,
                                coverImage: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    channelData: {
                        $arrayElemAt: ["$channel", 0]
                    }
                }
            }
        ]
        )

        const allSubscribedChannels = subscribedChannels.map(chnl => chnl.channelData)

        res.status(200)
            .json(
                new ApiResponse(200, allSubscribedChannels, "subscribed channels fetched successfully")
            )
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}