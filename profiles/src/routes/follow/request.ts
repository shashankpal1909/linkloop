import express, { Request, Response } from "express";

import { BadRequestError, currentUser, NotFoundError, validateRequest } from "@linkloop/common";

import { Follow, FollowStatus } from "../../models/follow";
import { Profile, ProfileDoc } from "../../models/profile";

/**
 * The follow request router.
 */
const router = express.Router();

/**
 * Creates a follow request.
 *
 * @param req - The request.
 * @param res - The response.
 */
router.post(
  "/api/profile/:slug/follow",
  currentUser,
  validateRequest,
  async (req: Request, res: Response) => {
    let profile: ProfileDoc | null;

    try {
      profile = await Profile.findById(req.params.slug);
    } catch (error) {
      profile = await Profile.findOne({ userName: req.params.slug });
    }

    if (!profile) {
      throw new NotFoundError();
    }

    if (profile.id === req.currentUser?.id) {
      throw new BadRequestError("You cannot follow yourself.");
    }

    const existingFollow = await Follow.findOne({
      from: req.currentUser!.id,
      to: profile.id,
    });

    if (existingFollow) {
      if (existingFollow.status === FollowStatus.Accepted) {
        throw new BadRequestError("You are already following this user.");
      }

      if (existingFollow.status === FollowStatus.Pending) {
        throw new BadRequestError(
          "You have already requested to follow this user."
        );
      }

      if (existingFollow.status === FollowStatus.Rejected) {
        throw new BadRequestError("Your follow request has been rejected.");
      }
    }

    const follow = Follow.build({
      from: req.currentUser!.id,
      to: profile.id,
    });
    await follow.save();

    res.send(follow);
  }
);

export { router as followRequestRouter };
