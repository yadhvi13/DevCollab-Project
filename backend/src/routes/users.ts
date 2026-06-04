import express from 'express';
import User from '../models/User';
import { authenticate } from './auth';
import Activity from '../models/Activity';

const router = express.Router();

const calculateGamification = async (userId: string) => {
  const activities = await Activity.find({ user: userId }).sort({ timestamp: -1 });
  
  let xp = 0;
  activities.forEach(act => {
    if (act.type === 'CREATE_REPO') xp += 50;
    else if (act.type === 'COMMIT') xp += 10;
    else xp += 5;
  });

  const level = Math.floor(xp / 1000) + 1;

  // Calculate streak
  const activeDays = new Set(activities.map(act => new Date(act.timestamp).toISOString().split('T')[0]));
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let streak = 0;
  let currDate = new Date();

  if (activeDays.has(todayStr)) {
    streak = 1;
    currDate.setDate(currDate.getDate() - 1);
  } else if (activeDays.has(yesterdayStr)) {
    // If not today, but yesterday, they are still on a streak, it just hasn't been extended today
    streak = 1;
    currDate.setDate(currDate.getDate() - 2);
  }

  if (streak > 0) {
    while (true) {
      const dateStr = currDate.toISOString().split('T')[0];
      if (activeDays.has(dateStr)) {
        streak++;
        currDate.setDate(currDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { xp, level, streak };
};

// Get current user profile
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await calculateGamification(user._id.toString());
    user.xp = stats.xp;
    user.level = stats.level;
    user.streak = stats.streak;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: any, res) => {
  try {
    const { bio, skills, techStack, openToWork, portfolioLinks, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { bio, skills, techStack, openToWork, portfolioLinks, avatar },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user profile by username
router.get('/:username', authenticate, async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const stats = await calculateGamification(user._id.toString());
      user.xp = stats.xp;
      user.level = stats.level;
      user.streak = stats.streak;
      await user.save();

      const userObj = user.toObject();
      delete userObj.password;

      res.json(userObj);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get user activities (Contributions)
router.get('/:username/activities', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Determine the available years
    const firstActivity = await Activity.findOne({ user: user._id }).sort({ timestamp: 1 });
    const currentYear = new Date().getFullYear();
    const firstYear = firstActivity ? new Date(firstActivity.timestamp).getFullYear() : currentYear;
    
    const availableYears = [];
    for (let y = currentYear; y >= firstYear; y--) {
      availableYears.push(y);
    }

    const requestedYear = req.query.year ? parseInt(req.query.year as string) : currentYear;
    const startDate = new Date(requestedYear, 0, 1);
    const endDate = new Date(requestedYear, 11, 31, 23, 59, 59, 999);

    const activities = await Activity.find({
      user: user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    res.json({
      availableYears,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;
