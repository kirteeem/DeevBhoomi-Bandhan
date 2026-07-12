#!/usr/bin/env ts-node

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "i6ccxacj",
  api_key: "985349199952832",
  api_secret: "jx5hlV0geEZfKXS0CaVJX9wgV2A",
});

async function main() {
  try {
    // Upload a sample image from Cloudinary's demo account
    const uploadResult = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );

    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // Fetch image details
    const details = await cloudinary.api.resource(uploadResult.public_id);

    console.log("Width:", details.width);
    console.log("Height:", details.height);
    console.log("Format:", details.format);
    console.log("File Size (bytes):", details.bytes);

    // f_auto = automatically serves the best image format for the browser
    // q_auto = automatically chooses an optimal compression quality
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    console.log(
      "\nDone! Click link below to see optimized version of the image."
    );
    console.log("Check the size and the format.");
    console.log(transformedUrl);
  } catch (err) {
    console.error(err);
  }
}

main();