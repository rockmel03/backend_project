import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType = "asc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    let filter = {};
    // in mongoDB $or operator is used for filtering videos form elements passed into it,
    // in mongoDB  $regex operator is used to perform regular expression pattern matching on string fields within documents.
    if (query) filter = {
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    if (userId) filter.owner = userId;

    let options = {
        limit: parseInt(limit), // parseInt() is used to convert value to integer/number , because we recieved it from the query params which is string
        skip: (parseInt(page) - 1) * parseInt(limit), // ((page -1) * limit ) it is formula to get skip value
    }

    let sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType == "asc" ? 1 : -1; // sort.sortType = "descending"/'ascending' here 1 mens ascending
    }

    const videos = await Video
        .find(filter)
        .sort(sort)
        .skip(options.skip)
        .limit(options.limit)
        .exec();

    const totalCount = await Video.countDocuments(filter); // count filtered documents

    return res.status(200)
        .json(new ApiResponse(
            200,
            {
                result: videos,
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit)),
            }
            , "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    //check title and description 
    //check  vedio and thumbnail => then upload them on cloudinary
    // create Vidio object and set values in it like urls
    // send response if every thing allwright 

    // if ([title, description].some(field => field?.trim() === "")) throw new ApiError(401, "all fields are required") // not working
    if (!(title && description)) throw new ApiError(401, "all fields are required") // not working

    const videoPath = (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) ? req.files.videoFile[0]?.path : null;
    const thumbnailPath = (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) ? req.files.thumbnail[0]?.path : null;

    if (!(videoPath && thumbnailPath)) throw new ApiError(400, "video & thumbnail both files are required")

    const uploadedVideo = await uploadOnCloudinary(videoPath)
    const uploadedThumbanail = await uploadOnCloudinary(thumbnailPath)

    if (!uploadedVideo) throw new ApiError(401, "video file is missing")
    if (!uploadedThumbanail) throw new ApiError(401, "thumbnail is missing")

    // console.log(uploadedVideo)
    // console.log(uploadedThumbanail)

    const video = await Video.create(
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
        .json(new ApiResponse(200, video, "vedio document created successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // find document using id 
    // if exists send it on response

    if (!videoId) throw new ApiError(401, "invalid credential")

    try {
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(400, "video not found")

        return res.status(200)
            .json(new ApiResponse(200, video, "video fetched successfully"))
    } catch (error) {
        throw new ApiError(400, "video not found or invalid video Id")
    }

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body
    if (!title || !description) throw new ApiError(401, "title & description are required")
    // if (!(title && description)) throw new ApiError(401, "title & description are required") // alternative of above line

    try {
        const thumbnailPath = req.file?.path
        if (!thumbnailPath) throw new ApiError(401, "thumbnail file is missing")

        const videoDoc = await Video.findById(videoId)
        if (!videoDoc) throw new ApiError(404, "video document not found");

        //delete file from cloudinary server
        await deleteFromCloudinary(videoDoc?.thumbnail)

        //uploading file on cloudinary server
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
        if (!thumbnail) throw new ApiError(400, "Error while uploading thumbnail")

        //updating values
        videoDoc.title = title;
        videoDoc.description = description;
        videoDoc.thumbnail = thumbnail.url;

        const updatedVideoDocument = await videoDoc.save({ validateBeforeSave: true });

        return res
            .status(200)
            .json(new ApiResponse(200, updatedVideoDocument, "document updated successfully"))
    } catch (error) {
        throw new ApiError(404, `video document not found Error: ${error?.message}`);
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    try {
        
        const video = await Video.findByIdAndDelete(videoId)
        if (!video) throw new ApiError(400, "video document not found");

        //delete files from cloudinary
        await deleteFromCloudinary(video.videoFile)
        await deleteFromCloudinary(video.thumbnail)

        return res.status(200)
            .json(new ApiResponse(200, {}, "video deleted successfully"))
    } catch (error) {
        throw new ApiError(400, `invalid video id :: video document not found ERROR: ${error.message}`);
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        const video = await Video.findById(videoId)
        if (!video) throw new ApiError(400, "video document not found");

        video.isPublished = !video.isPublished

        const updateVideo = await video.save(); // save the document

        return res.status(200).json(new ApiResponse(200, updateVideo, "toggled Successfully"));
    } catch (error) {
        throw new ApiError(400, `invalid video id :: video document not found ERROR: ${error.message}`);
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}