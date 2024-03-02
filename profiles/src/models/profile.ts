import mongoose from "mongoose";

/**
 * An interface that describes the properties that are required to create a Profile.
 */
interface ProfileAttrs {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  phone?: string;
  about?: string;
}

/**
 * An interface that describes the properties that a User model has.
 */
interface ProfileModel extends mongoose.Model<ProfileDoc> {
  build(attrs: ProfileAttrs): ProfileDoc;
}

/**
 * An interface that describes the properties that a User Document has.
 */
export interface ProfileDoc extends mongoose.Document {
  userName: string;
  fullName: string;
  email: string;
  phone?: string;
  about?: string;
  followers: number;
  following: number;
  profilePictureURL?: string;
}

const profileSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    about: {
      type: String,
      required: false,
    },
    followers: {
      type: Number,
      default: 0,
    },
    following: {
      type: Number,
      default: 0,
    },
    profilePictureURL: {
      type: String,
      default: null,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * A static method that creates a new Profile document based on the provided attributes.
 */
profileSchema.statics.build = (attrs: ProfileAttrs): ProfileDoc => {
  return new Profile({
    _id: attrs.id,
    userName: attrs.userName,
    fullName: attrs.fullName,
    email: attrs.email,
    phone: attrs.phone,
    about: attrs.about,
    followers: 0,
    following: 0,
    profilePictureURL: null,
  });
};

/**
 * The Profile model.
 */
const Profile = mongoose.model<ProfileDoc, ProfileModel>(
  "Profile",
  profileSchema
);

export { Profile };
