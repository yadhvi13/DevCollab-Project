import express from 'express';
import Post from '../models/Post';
import { authenticate } from './auth';

const router = express.Router();

// Get social feed
router.get('/', authenticate, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar level xp')
      .populate('comments.user', 'username avatar');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Create a new post
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { content, type } = req.body;
    const post = new Post({
      user: req.user.userId,
      content,
      type
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id).populate('user', 'username avatar level xp');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like a post
router.post('/:id/like', authenticate, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const index = post.likes.indexOf(req.user.userId);
    if (index === -1) {
      post.likes.push(req.user.userId);
    } else {
      post.likes.splice(index, 1);
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Comment on a post
router.post('/:id/comment', authenticate, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      user: req.user.userId,
      content: req.body.content,
      createdAt: new Date()
    };
    
    post.comments.push(newComment as any);
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar level xp')
      .populate('comments.user', 'username avatar');
      
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
