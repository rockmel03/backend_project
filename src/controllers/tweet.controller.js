import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (content?.trim() == "") throw new ApiError(400, "content required")

    try {
        const tweet = await Tweet.create({
            content: content,
            owner: req.user?._id, // ObjectId
        })
        res.status(201).json({
            success: true,
            data: tweet,
            message: "Tweet created successfully"
        })
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    const check = isValidObjectId(userId);
    if (!check) throw new ApiError(400, "invalid userId");

    try {
        const tweets = await Tweet.find(
            { owner: userId }
        ).select("-owner")

        return res
            .status(200)
            .json(new ApiResponse(500, tweets, "tweets fetched successfully"))

    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    const check = isValidObjectId(tweetId);
    if (!check) throw new ApiError(400, "invalid tweetId")
    if (content.trim() == "") throw new ApiError(400, "content is empty")

    try {
        const tweet = await Tweet.findOneAndUpdate(
            { _id: tweetId, owner: req.user?._id },
            {
                $set: { content: content }
            },
            { new: true }
        ).select("-owner")

        if (!tweet) throw new ApiError(500, "tweet not found or invalid user")

        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "tweet updated successfully"))
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    const check = isValidObjectId(tweetId);
    if (!check) throw new ApiError(400, "invalid tweetId")

    try {
        const tweet = await Tweet.findByIdAndDelete(tweetId)

        if (!tweet) throw new ApiError(500, "tweet not found or already deleted")

        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "tweet deleted successfully"))
    } catch (error) {
        throw new ApiError(500, "internal server error: " + error)
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}