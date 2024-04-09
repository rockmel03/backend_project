import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken // added refresh token in user object
        await user.save({ validateBeforeSave: false }) // save refresh token on DB
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get users details from frontend
    //validation - not empty
    //check if user already exists : username , email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in DB
    //remove password and refresh token field from response
    //check for user creation
    //return response   

    const { fullName, email, username, password } = req.body
    /* 
        // we can check every field is empty or not like this 
        if (fullName === "") {
            throw new ApiError(400, "fullName is required")
        }
    */

    //we can check multiple fields in on time like this
    if (
        [fullName, email, username, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "user with username and email already exists")
    }

    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path //incase we did not get the coverImage it will return undefined
    ////SOLUTION:
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    //get data from frontend
    //validate empty
    // username or email
    //check any user exist
    // if any user validate password
    // generate access and refresh token
    // send tokens in cookies form securly

    const { username, email, password } = req.body;

    if (!(username || email)) throw new ApiError(400, "username or email is required")

    // here is alternative of above code based logic
    // if (!username && !email) throw new ApiError(400, "username or email is required")

    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    ) // find user exist in DB

    if (!user) throw new ApiError(404, "user does not exist")
    if (!password) throw new ApiError(400, "password must be required")

    const isPasswordValid = await user.isPasswordCorrect(password) // checking password is correct or not isPasswordCorrect method we got from user object not from the User modal
    if (!isPasswordValid) throw new ApiError(401, "invalid user credential")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id) // generated accessToken and refreshToken from the above defined method 

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken") // find user from database and removed password and refreshToken from the user object

    // send cookies 
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    //find user in DB => make a middleware to set user in req.user - created  auth.middleware => verifyJWT
    //remove refeshToken from user in DB
    //remove acessToken and refeshToken from cookies

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes fields form the document
            }
        }
        , { new: true } // return mein user ki updated value receive hogi
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logout Successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id).select("-password")
        if (!user) throw new ApiError(401, "Invalid Refresh Token");

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id)

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }), "Access Token refreshed")
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid Old Password");


    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) throw new ApiError(400, "All fields are required");

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { fullName, email: email }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing")

    //TODO: delete old image 

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is missing")

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) throw new ApiError(401, "cover image is missing")

    //TODO: delete old image 

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) throw new ApiError(401, "cover image is missing")

    const user = user.findByIdAndUpdate(req.user?._id,
        {
            $set: { coverImage: coverImage?.url }
        },
        { new: true },
    ).select("-password")
    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params
    if (!username?.trim()) throw new ApiError(400, "invalid username")

    const channel = await User.aggregate([
        {//$match is used to match documents according to value passed
            $match: {
                username: username?.toLowerCase()
            }
        },
        {   //$lookup used to fetch data from another collections or document
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },
        {   //addFields used for adding extra fields to Object
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {   //$project used for select only selected fields to the object
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ])

    console.log(channel)
    if (!channel?.length) throw new ApiError(400, "channel does not exists")

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "user channel fetched successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile

}