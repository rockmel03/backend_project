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

    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}