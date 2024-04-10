import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
    ],
    owner: {
        type: String,
        ref: "User"
    },
}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)