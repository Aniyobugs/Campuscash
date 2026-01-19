
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    Chip, Dialog, DialogTitle, DialogContent, TextField, Select,
    MenuItem, FormControl, InputLabel, LinearProgress, Stack,
    IconButton, Radio, RadioGroup, FormControlLabel, FormLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import Confetti from 'react-confetti';

// --- Animations ---
const SUCCESS_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"; // Cheerful chime

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardHover = {
    hover: {
        y: -8,
        boxShadow: "0px 12px 30px rgba(0,0,0,0.15)",
        transition: { duration: 0.3 }
    }
};

const StudentTasks = () => {
    const { isDark } = useTheme();
    const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    // State
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Assignment, Quiz
    const [userId, setUserId] = useState(null);
    const [userYear, setUserYear] = useState(null);

    // Submission State
    const [submitOpen, setSubmitOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [subType, setSubType] = useState('link');
    const [subLink, setSubLink] = useState('');
    const [subText, setSubText] = useState('');
    const [subFile, setSubFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Quiz State
    const [quizOpen, setQuizOpen] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    // Feedback
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const [mySubmissions, setMySubmissions] = useState({});

    // --- Init ---
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const stored = sessionStorage.getItem("user");
        if (stored) {
            const u = JSON.parse(stored);
            setUserId(u.id);
            // Fetch full user details to get year
            axios.get(`${baseurl}/api/${u.id}`).then(res => {
                const user = res.data;
                setUserYear(user.yearClassDept);
                fetchTasks(user.yearClassDept);
            }).catch(() => fetchTasks(null));

            // Fetch my submissions
            fetchMySubmissions(u.id);
        }
    }, []);

    const fetchMySubmissions = async (uid) => {
        try {
            const res = await axios.get(`${baseurl}/api/submissions/user/${uid}`);
            // Map task ID to submission status
            const subMap = {};
            res.data.forEach(sub => {
                if (sub.task) { // ensure task exists
                    subMap[sub.task] = sub; // store full submission obj
                }
            });
            setMySubmissions(subMap);
        } catch (err) {
            console.error("Error fetching submissions:", err);
        }
    };

    const fetchTasks = async (year) => {
        try {
            setLoading(true);
            const params = year ? { year } : {};
            const res = await axios.get(`${baseurl}/api/tasks/active`, { params });
            // Filter future tasks
            const now = new Date();
            const active = (res.data || []).filter(t => new Date(t.dueDate) >= now);
            setTasks(active);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---
    const handleOpenSubmit = (task) => {
        setSelectedTask(task);
        if (task.category === 'Quiz') {
            setQuizAnswers(Array(task.quiz?.questions?.length || 0).fill(null));
            setCurrentQuestion(0);
            setQuizOpen(true);
        } else {
            setSubmitOpen(true);
        }
    };

    // --- Audio Helper ---
    const playSuccessSound = () => {
        try {
            const audio = new Audio(SUCCESS_SOUND_URL);
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed:", e));
        } catch (e) {
            console.error("Audio setup failed:", e);
        }
    };

    const handleSubmission = async () => {
        try {
            setSubmitting(true);
            const fd = new FormData();
            fd.append('type', subType);
            fd.append('userId', userId);
            if (subType === 'file' && subFile) fd.append('file', subFile);
            if (subType === 'link') fd.append('link', subLink);
            if (subType === 'text') fd.append('text', subText);

            await axios.post(`${baseurl}/api/tasks/${selectedTask._id}/submit`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage({ text: 'Assignment Submitted Successfully! 🎉', type: 'success' });
            playSuccessSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000); // Blast for 6 seconds
            setSubmitOpen(false);
            setSubLink(''); setSubText(''); setSubFile(null);
            fetchMySubmissions(userId); // Refresh status
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Submission failed', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuizSubmit = async () => {
        if (quizAnswers.some(a => a === null)) {
            setMessage({ text: 'Please answer all questions', type: 'error' });
            return;
        }
        try {
            setSubmitting(true);
            const payload = { type: 'quiz', userId, answers: quizAnswers };
            const res = await axios.post(`${baseurl}/api/tasks/${selectedTask._id}/submit`, payload);
            const score = res.data.submission.score;
            const isPassed = res.data.submission.passed;

            setMessage({
                text: `Quiz Complete! You scored ${score}% ${isPassed ? '🎉' : '😔'}`,
                type: isPassed ? 'success' : 'warning'
            });

            if (isPassed) {
                playSuccessSound();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000); // Celebration blast!
            }

            setQuizOpen(false);
            fetchMySubmissions(userId); // Refresh status (even if failed, logic says only single attempt? or allow retry? User req says "only one time submission")
        } catch (err) {
            setMessage({ text: 'Quiz submission failed', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // --- Filtering ---
    const filteredTasks = tasks.filter(t => {
        if (filter === 'All') return true;
        if (filter === 'Quiz') return t.category === 'Quiz';
        return t.category !== 'Quiz';
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0f172a' : '#f8fafc', py: 6, transition: 'background-color 0.3s' }}>
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.2}
                />
            )}
            <Container maxWidth="lg">

                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight="900" sx={{ background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', backgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
                            Assignments & Request
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Complete tasks, challenge yourself with quizzes, and earn rewards.
                        </Typography>
                    </Box>
                </motion.div>

                {/* Filters */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 6 }}>
                    {['All', 'Assignment', 'Quiz'].map((f) => (
                        <Button
                            key={f}
                            onClick={() => setFilter(f)}
                            variant={filter === f ? 'contained' : 'outlined'}
                            sx={{
                                borderRadius: 10,
                                px: 4,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                boxShadow: filter === f ? '0 4px 14px 0 rgba(99, 102, 241, 0.39)' : 'none'
                            }}
                        >
                            {f}
                        </Button>
                    ))}
                </Box>

                {/* Task Grid */}
                {loading ? (
                    <LinearProgress />
                ) : (
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                        <Grid container spacing={3}>
                            <AnimatePresence>
                                {filteredTasks.map((task) => (
                                    <Grid item xs={12} md={6} lg={4} key={task._id}>
                                        <motion.div variants={fadeInUp} whileHover="hover">
                                            <motion.div variants={cardHover} style={{ height: '100%' }}>
                                                <Card sx={{
                                                    height: '100%',
                                                    borderRadius: 4,
                                                    border: '1px solid',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                    background: isDark ? '#1e293b' : '#ffffff',
                                                    position: 'relative',
                                                    overflow: 'visible'
                                                }}>
                                                    {/* Badge */}
                                                    <Box sx={{
                                                        position: 'absolute', top: -12, right: 20,
                                                        bgcolor: task.category === 'Quiz' ? '#f43f5e' : '#3b82f6',
                                                        color: 'white', px: 2, py: 0.5, borderRadius: 2,
                                                        fontWeight: 'bold', fontSize: '0.8rem',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                    }}>
                                                        {task.category}
                                                    </Box>

                                                    <CardContent sx={{ p: 3, pt: 4 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: task.category === 'Quiz' ? '#f43f5e' : '#3b82f6' }}>
                                                            {task.category === 'Quiz' ? <QuizIcon fontSize="large" /> : <AssignmentIcon fontSize="large" />}
                                                            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1, color: isDark ? '#fff' : '#1e293b' }}>
                                                                {task.title}
                                                            </Typography>
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40, lineHeight: 1.6 }}>
                                                            {task.description || "No description provided."}
                                                        </Typography>

                                                        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                                            <Chip icon={<EmojiEventsIcon />} label={`${task.points} pts`} size="small" color="warning" variant="outlined" />
                                                            <Chip icon={<TimerIcon />} label={new Date(task.dueDate).toLocaleDateString()} size="small" variant="outlined" />
                                                        </Stack>

                                                        {mySubmissions[task._id] ? (
                                                            <Button
                                                                fullWidth
                                                                variant="outlined"
                                                                disabled
                                                                startIcon={<CheckCircleIcon />}
                                                                sx={{
                                                                    borderRadius: 3,
                                                                    py: 1.5,
                                                                    borderColor: 'green',
                                                                    color: 'green',
                                                                    '&.Mui-disabled': { borderColor: 'rgba(76, 175, 80, 0.5)', color: 'rgba(76, 175, 80, 0.7)' }
                                                                }}
                                                            >
                                                                {mySubmissions[task._id].type === 'quiz'
                                                                    ? `Score: ${mySubmissions[task._id].score}%`
                                                                    : 'Submitted'}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                fullWidth
                                                                variant="contained"
                                                                onClick={() => handleOpenSubmit(task)}
                                                                sx={{
                                                                    borderRadius: 3,
                                                                    py: 1.5,
                                                                    bgcolor: task.category === 'Quiz' ? '#f43f5e' : '#3b82f6',
                                                                    '&:hover': { bgcolor: task.category === 'Quiz' ? '#e11d48' : '#2563eb' }
                                                                }}
                                                            >
                                                                {task.category === 'Quiz' ? 'Start Quiz' : 'Submit Assignment'}
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                        {filteredTasks.length === 0 && (
                            <Typography textAlign="center" sx={{ mt: 8, opacity: 0.5 }}>No active tasks found in this category.</Typography>
                        )}
                    </motion.div>
                )}

                {/* --- Assignment Submission Dialog --- */}
                <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Submit Assignment: {selectedTask?.title}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Submission Type</InputLabel>
                                <Select label="Submission Type" value={subType} onChange={(e) => setSubType(e.target.value)}>
                                    <MenuItem value="link">Link (Google Doc/Drive)</MenuItem>
                                    <MenuItem value="text">Text Entry</MenuItem>
                                    <MenuItem value="file">File Upload</MenuItem>
                                </Select>
                            </FormControl>

                            {subType === 'link' && (
                                <TextField fullWidth label="Paste Link" variant="outlined" value={subLink} onChange={(e) => setSubLink(e.target.value)} />
                            )}
                            {subType === 'text' && (
                                <TextField fullWidth multiline rows={4} label="Your Answeer" variant="outlined" value={subText} onChange={(e) => setSubText(e.target.value)} />
                            )}
                            {subType === 'file' && (
                                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} fullWidth sx={{ height: 56 }}>
                                    {subFile ? subFile.name : "Choose File"}
                                    <input type="file" hidden onChange={(e) => setSubFile(e.target.files[0])} />
                                </Button>
                            )}

                            <Button fullWidth variant="contained" size="large" sx={{ mt: 4, borderRadius: 3 }} onClick={handleSubmission} disabled={submitting}>
                                {submitting ? <LinearProgress sx={{ width: '100%' }} /> : 'Submit'}
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* --- Quiz Dialog --- */}
                <Dialog open={quizOpen} fullScreen TransitionComponent={React.forwardRef(function Transition(props, ref) { return <motion.div ref={ref} {...props} />; })}>
                    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0f172a' : '#f8fafc', p: 4 }}>
                        <Container maxWidth="md">
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4" fontWeight="bold">{selectedTask?.title}</Typography>
                                <IconButton onClick={() => setQuizOpen(false)}><CloseIcon /></IconButton>
                            </Box>

                            {/* Progress */}
                            <LinearProgress variant="determinate" value={((currentQuestion + 1) / (selectedTask?.quiz?.questions?.length || 1)) * 100} sx={{ mb: 6, height: 10, borderRadius: 5 }} />

                            {selectedTask?.quiz?.questions && selectedTask.quiz.questions.length > 0 ? (
                                <Card sx={{ borderRadius: 4, p: 4, mb: 4 }}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        Question {currentQuestion + 1} of {selectedTask.quiz.questions.length}
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
                                        {selectedTask.quiz.questions[currentQuestion].questionText}
                                    </Typography>

                                    <RadioGroup
                                        value={quizAnswers[currentQuestion] !== null ? quizAnswers[currentQuestion] : ''}
                                        onChange={(e) => {
                                            const newAns = [...quizAnswers];
                                            newAns[currentQuestion] = Number(e.target.value);
                                            setQuizAnswers(newAns);
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            {selectedTask.quiz.questions[currentQuestion].options.map((opt, idx) => (
                                                <FormControlLabel
                                                    key={idx}
                                                    value={idx}
                                                    control={<Radio />}
                                                    label={opt}
                                                    sx={{
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        p: 1,
                                                        bgcolor: quizAnswers[currentQuestion] === idx ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)') : 'transparent',
                                                        transition: 'background-color 0.2s',
                                                        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </RadioGroup>

                                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(curr => curr - 1)}>Previous</Button>
                                        {currentQuestion < selectedTask.quiz.questions.length - 1 ? (
                                            <Button variant="contained" onClick={() => setCurrentQuestion(curr => curr + 1)}>Next Question</Button>
                                        ) : (
                                            <Button variant="contained" color="success" size="large" onClick={handleQuizSubmit} disabled={submitting}>Submit Quiz</Button>
                                        )}
                                    </Box>
                                </Card>
                            ) : (
                                <Typography>No questions found for this quiz.</Typography>
                            )}
                        </Container>
                    </Box>
                </Dialog>

                {/* Feedback Toast */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}
                    >
                        <Card sx={{ bgcolor: message.type === 'success' ? '#10b981' : '#ef4444', color: 'white', px: 3, py: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                {message.type === 'success' && <CheckCircleIcon />}
                                <Typography fontWeight="bold">{message.text}</Typography>
                                <IconButton size="small" color="inherit" onClick={() => setMessage({ text: '', type: '' })}><CloseIcon /></IconButton>
                            </Stack>
                        </Card>
                    </motion.div>
                )}

            </Container>
        </Box>
    );
};

export default StudentTasks;
