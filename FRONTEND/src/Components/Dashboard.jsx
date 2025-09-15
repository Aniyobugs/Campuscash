import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Coffee as CoffeeIcon,
  LocalGroceryStore as LocalGroceryStoreIcon,
  ReceiptLong as ReceiptLongIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// Placeholder data - this would come from your backend API
const tasks = [
  { id: 1, name: 'Math Assignment #5', dueDate: 'Aug 8', points: 40, status: 'pending' },
  { id: 2, name: 'Seminar: AI Trends', points: 25, status: 'completed' },
];

const rewards = [
  { id: 1, name: 'Free Coffee', cost: 150, icon: <CoffeeIcon /> },
  { id: 2, name: '10% Bookstore Discount', cost: 500, icon: <LocalGroceryStoreIcon /> },
  { id: 3, name: 'Transcript Waiver', cost: 200, icon: <ReceiptLongIcon /> },
];

const achievements = ['Taskmaster', 'Consistent Coder', 'Bookworm'];

const Dashboard = () => {
  const user = {
    name: 'ASHWIN',
    totalPoints: 1340,
    leaderboardRank: 4,
  };

  const nextReward = {
    name: 'Free Coffee',
    cost: 150,
  };

  const streak = {
    days: 5,
    badge: 'Taskmaster',
  };

  const pointsToNextReward = nextReward.cost - (user.totalPoints % nextReward.cost); // This is a simplified calculation

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/path_to_ashwin_avatar.png" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h5">Welcome back, {user.name} 👋</Typography>
            <Typography variant="body2" color="text.secondary">
              You've earned {user.totalPoints} points this semester!
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Leaderboard Rank:
          </Typography>
          <Typography variant="h6" sx={{ mr: 1 }}>
            #{user.leaderboardRank}
          </Typography>
          <Button href="#" size="small">
            View all
          </Button>
        </Box>
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* My Points Card */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Points
              </Typography>
              <Typography variant="h3" color="primary" sx={{ my: 1 }}>
                {user.totalPoints} pts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {pointsToNextReward} pts to next reward (Free Coffee)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(user.totalPoints / (user.totalPoints + pointsToNextReward)) * 100}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              <Button variant="contained" color="success">
                Redeem Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Streak Card */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Streak</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{streak.days}-day</strong> assignment streak!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlineIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Badge Unlocked: <strong>{streak.badge}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Your Tasks Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Your Tasks
        </Typography>
        <Card>
          <CardContent>
            {tasks.map((task, index) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: index < tasks.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <Box>
                  <Typography variant="body1">{task.name}</Typography>
                  {task.status === 'pending' && (
                    <Typography variant="body2" color="text.secondary">
                      Due: {task.dueDate}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" color="primary" sx={{ mr: 2 }}>
                    +{task.points} pts
                  </Typography>
                  {task.status === 'pending' ? (
                    <Button variant="contained" size="small">
                      Mark Complete
                    </Button>
                  ) : (
                    <Typography variant="body2" color="success.main">
                      Completed
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      {/* Available Rewards Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Rewards
        </Typography>
        <Grid container spacing={3}>
          {rewards.map((reward) => (
            <Grid item xs={12} sm={4} key={reward.id}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <IconButton color="primary" sx={{ fontSize: 40, mb: 1 }}>
                    {reward.icon}
                  </IconButton>
                  <Typography variant="body1">{reward.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reward.cost} pts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Achievements Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {achievements.map((achievement) => (
            <Chip key={achievement} label={achievement} color="primary" variant="outlined" />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;