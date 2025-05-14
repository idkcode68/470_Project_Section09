import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    likes: {
        type: Array,
        default: [],
    },
    comments: [
        {
            userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
            userProfilePic: {
                type: String,
            }
        }
    ]
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;