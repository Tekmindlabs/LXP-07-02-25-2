import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
	},
});

export const generateUploadUrl = async (
	key: string,
	contentType: string,
	maxSize: number = 10485760 // 10MB default
) => {
	const { url, fields } = await createPresignedPost(s3Client, {
		Bucket: process.env.AWS_BUCKET_NAME || "",
		Key: key,
		Conditions: [
			["content-length-range", 0, maxSize],
			["starts-with", "$Content-Type", contentType],
		],
		Expires: 600, // URL expires in 10 minutes
	});

	return { url, fields };
};

export { s3Client };