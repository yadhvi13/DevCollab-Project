import express from 'express';
import Repository from '../models/Repository';
import { authenticate } from './auth';

const router = express.Router();

// Get all accessible repos for the logged in user
router.get('/', authenticate, async (req: any, res) => {
  try {
    const repos = await Repository.find({
      $or: [
        { owner: req.user.userId },
        { collaborators: req.user.userId },
        { isPrivate: false }
      ]
    }).populate('owner', 'username avatar');
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new repository
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, description, isPrivate, initReadme } = req.body;
    
    const existingRepo = await Repository.findOne({ owner: req.user.userId, name });
    if (existingRepo) {
      return res.status(400).json({ error: 'Repository with this name already exists' });
    }

    const files = initReadme ? [{ path: 'README.md', content: `# ${name}\n\n${description}`, updatedBy: req.user.userId, updatedAt: new Date() }] : [];

    const repo = new Repository({
      name,
      description,
      owner: req.user.userId,
      isPrivate,
      files,
      commits: [],
      kanban: []
    });

    await repo.save();
    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single repository by ID
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const repo = await Repository.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('collaborators', 'username avatar');
      
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    
    // Check access
    if (repo.isPrivate && 
        repo.owner._id.toString() !== req.user.userId && 
        !repo.collaborators.some((c: any) => c._id.toString() === req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a file in the repository (simulating a commit for simplicity)
router.post('/:id/files', authenticate, async (req: any, res) => {
  try {
    const { path, content, commitMessage } = req.body;
    const repo = await Repository.findById(req.params.id);
    
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    // Update or add file
    const fileIndex = repo.files.findIndex(f => f.path === path);
    if (fileIndex >= 0) {
      repo.files[fileIndex].content = content;
      repo.files[fileIndex].updatedAt = new Date();
      repo.files[fileIndex].updatedBy = req.user.userId;
    } else {
      repo.files.push({
        path,
        content,
        updatedBy: req.user.userId,
        updatedAt: new Date()
      });
    }

    // Add a commit record
    repo.commits.push({
      sha: Math.random().toString(36).substring(2, 15),
      filePatches: [{ path, content }],
      author: req.user.userId,
      message: commitMessage || `Update ${path}`,
      timestamp: new Date()
    });

    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update kanban board
router.post('/:id/kanban', authenticate, async (req: any, res) => {
  try {
    const { kanban } = req.body;
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    repo.kanban = kanban;
    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
