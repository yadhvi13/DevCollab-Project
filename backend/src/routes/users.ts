import express from 'express';
import User from '../models/User';
import { authenticate } from './auth';
import Activity from '../models/Activity';

const router = express.Router();

const calculateGamification = async (userId: string) => {
  const activities = await Activity.find({ user: userId }).sort({ timestamp: -1 });
  
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Group activities by local date string
  const activitiesByDay: { [dateStr: string]: number } = {};
  activities.forEach(act => {
    const dateStr = formatDate(new Date(act.timestamp));
    activitiesByDay[dateStr] = (activitiesByDay[dateStr] || 0) + 1;
  });

  // Calculate XP based on active days and contribution counts per day
  let xp = 0;
  Object.keys(activitiesByDay).forEach(dateStr => {
    const count = activitiesByDay[dateStr];
    // 10 XP base for the active day, plus 2 XP per contribution, capped at 20 XP max per day
    const dayXp = Math.min(10 + count * 2, 20);
    xp += dayXp;
  });

  const level = Math.floor(xp / 100) + 1;

  // Calculate streak
  const activeDays = new Set(activities.map(act => formatDate(new Date(act.timestamp))));
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

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
      const dateStr = formatDate(currDate);
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
