const express = require("express");
const Blog = require("../models/blog");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const router = express.Router();

const allowedCategories = [
  "Technology",
  "Education",
  "Sports",
  "Entertainment",
  "Others"
];


// 1. Get All Blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json(blogs);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not load blogs"
    });
  }
});


// 2. Get My Blogs
router.get("/my", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.userId
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(blogs);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not load your blogs"
    });
  }
});


// 3. Get Individual Blog Details
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findById(req.params.id)
      .populate("author", "name email")
      .lean();

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found"
      });
    }

    return res.json(blog);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not load blog details"
    });
  }
});


// 4. Create Blog
router.post("/", auth, async (req, res) => {
  try {

    const { title, content, category } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200 ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const selectedCategory = category || "Others";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        message: "Invalid blog category"
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      author: req.userId
    });

    return res.status(201).json({
      message: "Blog published successfully",
      blog
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not create blog"
    });
  }
});


// 5. Update Blog
router.put("/:id", auth, async (req, res) => {
  try {

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog ID"
      });
    }

    const { title, content, category } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200 ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const selectedCategory = category || "Others";

    if (!allowedCategories.includes(selectedCategory)) {
      return res.status(400).json({
        message: "Invalid blog category"
      });
    }

    const blog = await Blog.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.userId
      },
      {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found or not yours"
      });
    }

    return res.json({
      message: "Blog updated successfully",
      blog
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not update blog"
    });
  }
});


// 6. Delete Blog
router.delete("/:id", auth, async (req, res) => {
  try {

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.userId
    });

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found or not yours"
      });
    }

    return res.json({
      message: "Blog deleted successfully"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Could not delete blog"
    });
  }
});


module.exports = router;