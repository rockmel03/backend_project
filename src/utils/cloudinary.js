import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // file has been uploaded
        // console.log("file has been uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async function (filePath) {
    try {
        const publicID = filePath.split("/").pop().split(".")[0] // getting the public Id from the url
        const response = await cloudinary.uploader.destroy(publicID); // deleting the file on cloudinary
        if (response.result != "ok") console.error("file deletion on cloudinary failed", filePath)
        return response;
    } catch (error) {
        return null;
    }
}


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); });


export { uploadOnCloudinary, deleteFromCloudinary }