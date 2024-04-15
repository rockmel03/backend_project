import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    const check = isValidObjectId(videoId);
    if (!check) throw new ApiError(400, "invalid videoId")

    let filter = {
        video: videoId
    }

    let options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
    }

    try {
        const comments = await Comment
            .find(filter)
            .sort({ createdAt: 1 }) // short by createdAt and 1 means accending
            .limit(options.limit)
            .skip(options.skip)
            .exec();

        const totalCommentsCount = await Comment.countDocuments(filter) // count all the documents

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        result: comments,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalCommentsCount,
                        totalpages: Math.ceil(totalCommentsCount / parseInt(limit))
                    },
                    "comments fetched successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, "Internal server error " + error);
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { comment } = req.body

    const check = mongoose.Types.ObjectId.isValid(videoId);
    if (!check) throw new ApiError(400, "invalid videoId ");
    if (comment.trim() == "") throw new ApiError(400, "comment required");

    try {
        const commentDocument = await Comment.create(
            {
                content: comment,
                video: videoId,
                owner: req.user?._id,
            }
        )

        if (!commentDocument) throw new ApiError(500, "something went wrong while creating documnent")

        return res
            .status(200)
            .json(new ApiResponse(200, commentDocument, "comment added successfully"))
    } catch (error) {
        throw new ApiError(500, "Internal server error " + error);
    }

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { comment } = req.body

    const check = mongoose.Types.ObjectId.isValid(commentId);
    if (!check) throw new ApiError(400, "invalid videoId ");
    if (comment.trim() == "") throw new ApiError(400, "comment required");

    try {
        const commentDocument = await Comment.findOneAndUpdate(
            { _id: commentId, owner: req.user?._id },
            {
                $set: { comment }
            },
            { new: true }
        )

        if (!commentDocument) throw new ApiError(500, "something went wrong while updating documnent")

        return res
            .status(200)
            .json(new ApiResponse(200, commentDocument, "comment updated successfully"))
    } catch (error) {
        throw new ApiError(500, "Internal server error " + error);
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    const check = mongoose.Types.ObjectId.isValid(commentId);
    if (!check) throw new ApiError(400, "invalid videoId ");

    try {
        const commentDocument = await Comment.findByIdAndDelete(commentDocument)
        if (!commentDocument) throw new ApiError(500, "something went wrong while deleting documnent")

        return res
            .status(200)
            .json(new ApiResponse(200, commentDocument, "comment deleted successfully"))
    } catch (error) {
        throw new ApiError(500, "Internal server error " + error);
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}