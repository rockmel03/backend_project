import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    //check title and description 
    //check  vedio and thumbnail => then upload them on cloudinary
    // create Vidio object and set values in it like urls
    // send response if every thing allwright 

    if ([title, description].some(field => field?.trim() === "")) {
        throw new ApiError(401, "all fields are required")
    }
    const videoPath = req.files.videoFile[0]?.path
    const thumbnailPath = req.files.thumbnail[0]?.path

    const uploadedVideo = await uploadOnCloudinary(videoPath)
    const uploadedThumbanail = await uploadOnCloudinary(thumbnailPath)

    if (!uploadedVideo) throw new ApiError(401, "video file is missing")
    if (!uploadedThumbanail) throw new ApiError(401, "thumbnail is missing")

    console.log(uploadedVideo)
    console.log(uploadedThumbanail)

    const video = new Video.create(
        {
            videoFile: uploadedVideo.url,
            thumbnail: uploadedThumbanail.url,
            title,
            description,
            duration: uploadedVideo.duration,
            owner: req.user._id
        }
    )

    if (!video) throw new ApiError(500, "Something went wrong while creating the video");

    return res.status(200)
        .json(new ApiError(200, video, "vedio document created successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // find document using id 
    // if exists send it on response

    if (!videoId) throw new ApiError(401, "invalid credential")

    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(400, "video not found")

    return res.status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body
    if (!title || !description) throw new ApiError(401, "title & description are required")

    const thumbnailPath = req.file?.path
    if (!thumbnailPath) throw new ApiError(401, "thumbnail file is missing")

    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    if (!thumbnail) throw new ApiError(400, "Error while uploading thumbnail")

    const updatedVideoDocument = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { title, description, thumbnail: thumbnail?.url },
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideoDocument, "document updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findByIdAndDelete(videoId)
    console.log(video)

    return res.status(200)
        .json(new ApiResponse(200, {}, "video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(400, "video document not found");

    video.isPublished = !video.isPublished

    const updateVideo = await video.save(); // save the document
    if (!updateVideo) throw new ApiError(500, "something went wrong while saving video");

    return res.status(200).json(new ApiResponse(200, updateVideo, "toggled Successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}