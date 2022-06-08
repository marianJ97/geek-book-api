import express from "express";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

const router = express.Router();

// create a post
router.post("/", async (req, res) => {
  try {
    const newPost = await new PostModel(req.body);

    await newPost.save();

    return res.status(200).send(newPost);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post.userId === req.body.userId) {
      return res.status(403).send("You cant update post you didnt write");
    }

    await post.updateOne({ $set: req.body });

    return res.status(200).send("The post has been updated");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post.userId === req.body.userId) {
      return res.status(403).send("You cant delete post you didnt write");
    }

    await post.deleteOne();

    return res.status(200).send("The post has been deleted");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// like/ dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({ $pull: { likes: req.body.userId } });

      return res.status(200).send("The post has been disliked");
    }

    await post.updateOne({ $push: { likes: req.body.userId } });

    return res.status(200).send("The post has been liked");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    return res.status(200).send(post);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get timeline posts (user posts)
router.get("/timeline/:userId", async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  try {
    const currentUser = await UserModel.findById(req.params.userId);
    const userPosts = await PostModel.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return PostModel.find({ userId: friendId });
      })
    );

    const allPosts = userPosts.concat(...friendPosts);
    const sortedPosts = allPosts.sort((post1, post2) => {
      return new Date(post2.createdAt) - new Date(post1.createdAt);
    });

    const allPages = Math.ceil(sortedPosts.length / limit);
    const indexOfLastPost = page * limit;
    const indexOfFirstPost = indexOfLastPost - limit;

    const paginatedPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    return res
      .status(200)
      .send({ page: page, data: paginatedPosts, totalPages: allPages });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get user posts (user posts)
router.get("/profile/:username", async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const user = await UserModel.findOne({ username: req.params.username });
    const posts = await PostModel.find({ userId: user._id })
      .sort({ createdAt: "desc" })
      .limit(limit)
      .skip((page - 1) * limit);

    const allPosts = await PostModel.find({
      userId: user._id,
    }).countDocuments();
    const totalPages = Math.ceil(allPosts / limit);

    return res
      .status(200)
      .send({ page: page, data: posts, totalPages: totalPages });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
