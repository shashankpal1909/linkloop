import express from "express";
import multer from "multer";

import { BadRequestError, requireAuth } from "@linkloop/common";

import { minio } from "../../../minio-wrapper";

// Create an Express router
const router = express.Router();

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define your upload route
router.put(
  "/api/profile/picture",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const bucketName = "my-bucket"; // Replace with your bucket name

    if (!req.file) {
      throw new BadRequestError("Image not uploaded");
    }

    const filename = req.file.originalname;
    const buffer = req.file.buffer;

    try {
      await minio.client.putObject(bucketName, filename, buffer);
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Error uploading file" });
    }
  }
);

export { router as uploadProfilePictureRouter };
