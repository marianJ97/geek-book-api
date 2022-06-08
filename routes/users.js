import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

const router = express.Router();

// update user
router.put("/:id", async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      return res.status(200).send("Account was updated");
    } else {
      return res.status(403).send("You cant update account that isnt yours!");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  try {
    if (req.body.userId === req.params.id || req.user.isAdmin) {
      const user = await UserModel.findByIdAndDelete(req.params.id);

      return res.status(200).send("Account was deleted");
    } else {
      return res.status(403).send("You cant delete account that isnt yours!");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get all users
router.get("/searchedUsers", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const searchedValue = new RegExp(`${req.query.searchedValue}`, "gi");
  try {
    const users = await UserModel.find({ username: searchedValue })
      .limit(limit)
      .skip((page - 1) * limit);
    if (users) {
      const usersInfos = users.map((user) => {
        const { password, updatedAt, coverPicture, ...other } = user._doc;

        return other;
      });

      return res.status(200).send(usersInfos);
    }

    return res.status(200).send("There arent no users");
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await UserModel.findById(userId)
      : await UserModel.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).send(other);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).populate(
      "following"
    );
    let friendList = [];
    user?.following.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    return res.status(200).send(friendList);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

// get followers
router.get("/followers/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).populate(
      "followers"
    );
    let followersList = [];
    user?.followers.map((follower) => {
      const { _id, username, profilePicture } = follower;
      followersList.push({ _id, username, profilePicture });
    });
    return res.status(200).send(followersList);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await UserModel.findById(req.params.id);
      const currentUser = await UserModel.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        return res.status(403).send("You already follow this user");
      }

      await user.updateOne({ $push: { followers: req.body.userId } });
      await currentUser.updateOne({ $push: { following: req.params.id } });

      return res.status(200).send("User has been followed");
    } else {
      return res.status(403).send("You cant follow yourself");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      const user = await UserModel.findById(req.params.id);
      const currentUser = await UserModel.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        return res.status(403).send("You dont follow this user");
      }

      await user.updateOne({ $pull: { followers: req.body.userId } });
      await currentUser.updateOne({ $pull: { following: req.params.id } });

      return res.status(200).send("User has been unfollowed");
    } else {
      return res.status(403).send("You cant unfollow yourself");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
