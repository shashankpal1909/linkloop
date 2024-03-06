import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@linkloop/common";

import { Profile } from "../../models/profile";

// Create an Express router
const router = express.Router();

/**
 * Route handler for updating a user profile.
 */
router.put(
  "/api/profile/",
  requireAuth,
  [
    body("fullName")
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Invalid Name"),
    body("userName")
      .optional()
      .trim()
      .isLength({ min: 4, max: 32 })
      .withMessage("Invalid Username"),
    body("phone")
      .optional()
      .isMobilePhone("any")
      .withMessage("Invalid Phone Number"),
    body("about").optional().trim().not().isEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { fullName, userName, phone, about } = req.body;

    // Find the profile
    const profile = await Profile.findById(req.currentUser!.id);

    // If profile not found, throw a "Not Found" error
    if (!profile) {
      throw new NotFoundError();
    }

    // Update the profile if fields are provided
    if (fullName) {
      profile.fullName = fullName;
    }
    if (userName && userName !== profile.userName) {
      // Check if the username already exists
      const existingProfile = await Profile.findOne({ userName });
      if (existingProfile) {
        throw new BadRequestError("Username already in use");
      }
      profile.userName = userName;
    }
    if (phone) {
      profile.phone = phone;
    }
    if (about) {
      profile.about = about;
    }

    await profile.save();

    // Send the updated profile data as the response
    res.send(profile);
  }
);

// Export the router
export { router as updateProfileRouter };
