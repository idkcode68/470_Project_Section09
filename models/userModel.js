import mongoose from "mongoose";

 const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 20,
      required: true,
    },
     username: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: "https://iconarchive.com/download/i107713/Flat-User-Interface/User-Profile-2.ico",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
      timestamp: true,
    }
  );

  const User = mongoose.model("User", userSchema);

  export default User;