import express from 'express';
import Repository from '../models/Repository';
import { authenticate } from './auth';
import Activity from '../models/Activity';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

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

    const activity = new Activity({
      user: req.user.userId,
      type: 'CREATE_REPO',
      repoId: repo._id,
      repoName: repo.name,
    });
    await activity.save();

    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Import a new repository (Real Clone)
router.post('/import', authenticate, async (req: any, res) => {
  try {
    const { name, cloneUrl, isPrivate } = req.body;
    
    if (!cloneUrl.startsWith('https://github.com/') && !cloneUrl.startsWith('https://gitlab.com/')) {
      return res.status(400).json({ error: 'Only GitHub and GitLab URLs are currently supported for security.' });
    }
    
    const existingRepo = await Repository.findOne({ owner: req.user.userId, name });
    if (existingRepo) {
      return res.status(400).json({ error: 'Repository with this name already exists' });
    }

    // Prepare temp directory
    const tempDir = path.join(os.tmpdir(), `import-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
    
    // Execute git clone
    await new Promise((resolve, reject) => {
      exec(`git clone --depth 1 "${cloneUrl}" "${tempDir}"`, (error, stdout, stderr) => {
        if (error) {
          console.error("Git clone failed:", error);
          reject(new Error('Failed to clone repository'));
        } else {
          resolve(stdout);
        }
      });
    });

    const files: any[] = [];
    
    // Helper to walk directory and push to files array
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Ignore heavy or irrelevant directories
          if (['.git', 'node_modules', 'dist', 'build', '.next', 'out', '.vscode', '.idea'].includes(entry.name)) continue;
          walkDir(fullPath);
        } else {
          // Ignore heavy binaries and media to respect MongoDB 16MB document size limit
          const ext = path.extname(entry.name).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.pdf', '.zip', '.tar', '.gz', '.ico', '.svg', '.lock', '.woff', '.woff2', '.ttf'].includes(ext)) continue;
          
          const stat = fs.statSync(fullPath);
          if (stat.size > 200 * 1024) continue; // Skip files > 200KB

          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relativePath = path.relative(tempDir, fullPath).replace(/\\/g, '/');
            files.push({
              path: relativePath,
              content,
              updatedBy: req.user.userId,
              updatedAt: new Date()
            });
          } catch (e) {
             // Skip if read error or non-utf8
          }
        }
      }
    };

    walkDir(tempDir);

    // Clean up temporary directory (recursive delete)
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Fallback if the repository was empty
    if (files.length === 0) {
      files.push({
        path: 'README.md',
        content: `# ${name}\n\nImported from ${cloneUrl}\n\n*Note: No source code files were found or they exceeded the size limit.*`,
        updatedBy: req.user.userId,
        updatedAt: new Date()
      });
    }

    const repo = new Repository({
      name,
      description: `Imported from ${cloneUrl}`,
      owner: req.user.userId,
      isPrivate,
      files,
      commits: [{
        sha: Math.random().toString(16).substring(2, 10),
        filePatches: [],
        message: `Initial import from ${cloneUrl}`,
        author: 'System',
        timestamp: new Date()
      }],
      kanban: []
    });

    await repo.save();

    const activity = new Activity({
      user: req.user.userId,
      type: 'CREATE_REPO',
      repoId: repo._id,
      repoName: repo.name,
    });
    await activity.save();

    res.status(201).json(repo);
  } catch (error: any) {
    console.error("Import error:", error);
    res.status(500).json({ error: error.message || 'Server error during import' });
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

    const forksCount = await Repository.countDocuments({ parentRepo: repo._id });
    const repoObj = repo.toObject();
    (repoObj as any).forksCount = forksCount;

    res.json(repoObj);
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

    const activity = new Activity({
      user: req.user.userId,
      type: 'COMMIT',
      repoId: repo._id,
      repoName: repo.name,
      metadata: { commitSha: repo.commits[repo.commits.length - 1].sha }
    });
    await activity.save();

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

// Delete a file
router.delete('/:id/files', authenticate, async (req: any, res) => {
  try {
    const { path } = req.body;
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    
    // Check access
    if (repo.owner._id.toString() !== req.user.userId && !repo.collaborators.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileIndex = repo.files.findIndex((f) => f.path === path);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    repo.files.splice(fileIndex, 1);
    
    repo.commits.push({
      sha: Math.random().toString(36).substring(2, 15),
      filePatches: [{ path, content: '' }],
      author: req.user.userId,
      message: `Delete ${path}`,
      timestamp: new Date()
    });

    await repo.save();

    const activity = new Activity({
      user: req.user.userId,
      type: 'COMMIT',
      repoId: repo._id,
      repoName: repo.name,
      metadata: { commitSha: repo.commits[repo.commits.length - 1].sha }
    });
    await activity.save();

    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete repository
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    if (repo.owner._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only the owner can delete the repository' });
    }

    await Repository.findByIdAndDelete(req.params.id);
    await Activity.deleteMany({ repoId: req.params.id });
    
    res.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Star/Unstar a repository
router.post('/:id/star', authenticate, async (req: any, res) => {
  try {
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const userId = req.user.userId;
    const isStarred = repo.stars.includes(userId);

    if (isStarred) {
      repo.stars = repo.stars.filter(id => id.toString() !== userId);
    } else {
      repo.stars.push(userId);
    }

    await repo.save();
    res.json({ stars: repo.stars });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fork a repository
router.post('/:id/fork', authenticate, async (req: any, res) => {
  try {
    const originalRepo = await Repository.findById(req.params.id);
    if (!originalRepo) return res.status(404).json({ error: 'Repository not found' });

    // Ensure uniqueness
    const existingFork = await Repository.findOne({ owner: req.user.userId, name: originalRepo.name });
    if (existingFork) {
      return res.status(400).json({ error: 'You already have a repository with this name' });
    }

    const forkedRepo = new Repository({
      name: originalRepo.name,
      description: originalRepo.description,
      owner: req.user.userId,
      isPrivate: originalRepo.isPrivate,
      parentRepo: originalRepo._id,
      files: originalRepo.files,
      commits: originalRepo.commits,
      kanban: originalRepo.kanban,
    });

    await forkedRepo.save();

    const activity = new Activity({
      user: req.user.userId,
      type: 'CREATE_REPO',
      repoId: forkedRepo._id,
      repoName: forkedRepo.name,
    });
    await activity.save();

    res.status(201).json(forkedRepo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a discussion comment
router.post('/:id/discussions', authenticate, async (req: any, res) => {
  try {
    const { content } = req.body;
    const repo = await Repository.findById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const User = require('../models/User').default;
    const user = await User.findById(req.user.userId);

    // Add discussion
    repo.discussions = repo.discussions || [];
    repo.discussions.push({
      author: user.username,
      content,
      timestamp: new Date()
    });

    await repo.save();
    res.json(repo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
