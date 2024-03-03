import mongoose from "mongoose";

import { Password } from "../services/password";

/**
 * An interface that describes the properties required to create a User.
 */
interface UserAttrs {
  email: string;
  password: string;
  fullName: string;
  userName: string;
}

/**
 * An interface that describes the properties a User model has.
 */
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

/**
 * An interface that describes the properties a User Document has.
 */
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  fullName: string;
  userName: string;
}

/**
 * Schema for the user collection
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;

        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Middleware: Hash the password before saving
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

/**
 * Builds a new user document
 * @param attrs - attributes for the user document
 */
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

/**
 * Model for the user collection
 */
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
