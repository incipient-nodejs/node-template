import dotenv from 'dotenv';
dotenv.config();
const cloudinary = require('cloudinary').v2;

let uploadedImageUrl;
let publicId;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

export async function upload(filePath: any) {
    try {
        const options = {
            use_filename: true,
            unique_filename: false
        };

        const uploadToCloudinary = await cloudinary.uploader.upload(filePath, options);

        uploadedImageUrl = uploadToCloudinary.secure_url;
        publicId = uploadToCloudinary.public_id;

        return { uploadedImageUrl, publicId };
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function removeImageFromCloudinary(url: any) {
    try {
        const publicIdOfThumbURL = extractPublicIdFromUrl(url);
        await cloudinary.uploader.destroy(publicIdOfThumbURL);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export function extractPublicIdFromUrl(url: string): string {
    const pathSegments: string[] = new URL(url).pathname.split("/");
    const publicId = pathSegments[pathSegments.length - 1].split(".")[0];
    return decodeURIComponent(publicId);
}