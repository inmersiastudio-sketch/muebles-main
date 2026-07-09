
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from the backend .env file
const envPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error(`.env file not found at ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

const env = process.env;

if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION || !env.AWS_BUCKET_NAME) {
  console.error("Error: Missing AWS credentials or bucket name in .env");
  console.error("AWS_BUCKET_NAME:", env.AWS_BUCKET_NAME);
  process.exit(1);
}

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

async function configureCors() {
  const bucketName = env.AWS_BUCKET_NAME;
  console.log(`Configuring CORS for bucket: ${bucketName}...`);
  // ... rest of code

  const command = new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
          AllowedOrigins: ["*"], // Allow all origins (localhost, production domain, etc.)
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    await client.send(command);
    console.log("Successfully configured CORS!");
  } catch (error) {
    console.error("Failed to configure CORS:", error);
  }
}

configureCors();
