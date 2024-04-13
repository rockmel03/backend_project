import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist
    if (name?.trim() == "") throw new ApiError(400, "name required")

    const playlist = await Playlist.create({
        name,
        description: description ? description : "",
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating the playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!userId?.trim()) throw new ApiError(400, `userId required`)

    const user = await User.findById(userId)
    if (!user) throw new ApiError(400, `user not found invalid userId`)

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId("6612e9b5ac7d6ca5c4cc51f5"),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                ownerDetails: {
                    $first: "$ownerDetails",
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                ownerDetails: 1,
            },
        },
        /*
         // if you wants to send video detail and video owner details use this stage of pipeline 
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
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
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ]
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        */
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId?.trim()) throw new ApiError(400, "playlistId required")

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
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
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatart: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
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
                owner: {
                    $first: "$owner",
                },
            },
        },
    ])

    if (!playlist?.length > 0) throw new ApiError(400, "invalid credentials")

    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(400, "video not found invalid videoId")

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(400, "playlist not found invalid playlistId")

    // playlist.videos.push(new mongoose.Types.ObjectId(videoId));
    // const updatePlaylist = await playlist.save()

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            /* // $addToSet is used for push data into array it prevents from duplicating the value
             we can also use $push but it does not prvent from duplicating the values */
            $addToSet: { videos: videoId },
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "video added successfully"))
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(400, "video not found invalid videoId")

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(400, "playlist not found invalid playlistId")

    // playlist.videos.push(new mongoose.Types.ObjectId(videoId));
    // const updatePlaylist = await playlist.save()

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }, // $pull is used for remove data  
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatePlaylist, "video removed successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!playlistId) throw new ApiError(400, "playlistId required")
    if (!(name && description)) {
        throw new ApiError(400, "name & description both are required")
    }

    let playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name: name, description: description },
        },
        { new: true }
    )

    if (!playlist) throw new ApiError(500, "playlist not found")

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}