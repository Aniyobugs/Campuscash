import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Grid,
  Chip,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const Userdash = () => {
  const [data, setData] = useState(null);

  // Mock data for now
  useEffect(() => {
    const mockData = {
      user: {
        name: "Priya",
        points: 1340,
        rank: 4,
        avatar: "https://i.pravatar.cc/150?img=47",
      },
      nextReward: {
        name: "Free Coffee",
        remaining: 160,
        total: 1500,
      },
      streak: {
        days: 5,
        badge: "Taskmaster",
      },
      tasks: [
        {
          id: 1,
          title: "Math Assignment #5",
          due: "Aug 8",
          points: 40,
          completed: false,
        },
        {
          id: 2,
          title: "Seminar: AI Trends",
          due: "",
          points: 25,
          completed: true,
        },
      ],
      rewards: [
        { name: "Free Coffee", points: 150 },
        { name: "10% Bookstore Discount", points: 500 },
        { name: "Transcript Waiver", points: 200 },
      ],
      achievements: [
        { name: "Taskmaster", unlocked: true },
        { name: "Consistent Coder", unlocked: false },
        { name: "Bookworm", unlocked: false },
      ],
    };

    setData(mockData);
  }, []);

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 4, bgcolor: "#f9f9ff", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={data.user.avatar} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Welcome back, {data.user.name}!
            </Typography>
            <Typography color="green">
              You’ve earned {data.user.points} points this semester 🎉
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2">
          Leaderboard Rank: #{data.user.rank}{" "}
          <Button size="small">View all</Button>
        </Typography>
      </Box>

      <Grid container spacing={3} mt={3}>
        {/* Points Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">My Points</Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {data.user.points} pts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.nextReward.remaining} pts to next reward (
                {data.nextReward.name})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.user.points / data.nextReward.total) * 100}
                sx={{ mt: 2, height: 10, borderRadius: 5 }}
              />
        
            </CardContent>
          </Card>
        </Grid>

        {/* Streak Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Streak</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <LocalFireDepartmentIcon color="error" />
                <Typography>
                  {data.streak.days}-day assignment streak!
                </Typography>
              </Box>
              <Chip
                label={`Badge Unlocked: ${data.streak.badge}`}
                color="success"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks */}
      <Box mt={4}>
        <Typography variant="h6">Your Tasks</Typography>
        {data.tasks.map((task, i) => (
          <Card key={i} sx={{ mt: 2 }}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight="bold">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.due && `Due: ${task.due}`}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography color="primary">+{task.points} pts</Typography>
              
                {task.completed && (
                  <Chip label="Completed" color="success" size="small" />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Rewards */}
      <Box mt={4}>
        <Typography variant="h6">Available Rewards</Typography>
        <Grid container spacing={2} mt={1}>
          {data.rewards.map((reward, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <EmojiEventsIcon fontSize="large" color="primary" />
                  <Typography fontWeight="bold">{reward.name}</Typography>
                  <Typography color="text.secondary">
                    {reward.points} pts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Achievements */}
      <Box mt={4}>
        <Typography variant="h6">Achievements</Typography>
        <Box display="flex" gap={2} mt={1}>
          {data.achievements.map((ach, i) => (
            <Chip
              key={i}
              label={ach.name}
              color={ach.unlocked ? "success" : "default"}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Userdash;
