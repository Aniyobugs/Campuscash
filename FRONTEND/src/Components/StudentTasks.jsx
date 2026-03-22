import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, AlertCircle, X, CloudUpload, 
    BookOpen, HelpCircle, Trophy, Clock, Search
} from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti';

const StudentTasks = () => {
    const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    // State
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
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

    // Init
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
            axios.get(`${baseurl}/api/${u.id}`).then(res => {
                setUserYear(res.data.yearClassDept);
                fetchTasks(res.data.yearClassDept);
            }).catch(() => fetchTasks(null));
            fetchMySubmissions(u.id);
        }
    }, []);

    const fetchMySubmissions = async (uid) => {
        try {
            const res = await axios.get(`${baseurl}/api/submissions/user/${uid}`);
            const subMap = {};
            res.data.forEach(sub => {
                if (sub.task) subMap[sub.task] = sub;
            });
            setMySubmissions(subMap);
        } catch (err) {
            console.error("Error fetching submissions:", err);
        }
    };

    const fetchTasks = async (year) => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseurl}/api/tasks/active`, { params: year ? { year } : {} });
            const now = new Date();
            const active = (res.data || []).filter(t => new Date(t.dueDate) >= now);
            setTasks(active);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const displayMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    // Actions
    const handleOpenSubmit = (task) => {
        setSelectedTask(task);
        if (task.category === 'Quiz') {
            if (task.quiz?.questions?.length > 0) {
                setQuizAnswers(Array(task.quiz.questions.length).fill(null));
                setCurrentQuestion(0);
                setQuizOpen(true);
            } else {
                displayMessage("This quiz has no questions configured.", "error");
            }
        } else {
            setSubmitOpen(true);
        }
    };

    const playSuccessSound = () => {
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});
        } catch (e) {}
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
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

            displayMessage('Assignment Submitted Successfully! 🎉', 'success');
            playSuccessSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000);
            
            setSubmitOpen(false);
            setSubLink(''); setSubText(''); setSubFile(null);
            fetchMySubmissions(userId);
        } catch (err) {
            displayMessage(err.response?.data?.message || 'Submission failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuizSubmit = async () => {
        if (quizAnswers.some(a => a === null)) {
            displayMessage('Please answer all questions', 'error');
            return;
        }
        try {
            setSubmitting(true);
            const res = await axios.post(`${baseurl}/api/tasks/${selectedTask._id}/submit`, {
                type: 'quiz', userId, answers: quizAnswers
            });
            const { score, passed } = res.data.submission;

            displayMessage(`Quiz Complete! You scored ${score}% ${passed ? '🎉' : '😔'}`, passed ? 'success' : 'error');

            if (passed) {
                playSuccessSound();
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000);
            }

            setQuizOpen(false);
            fetchMySubmissions(userId);
        } catch (err) {
            displayMessage('Quiz submission failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTasks = tasks.filter(t => filter === 'All' ? true : (filter === 'Quiz' ? t.category === 'Quiz' : t.category !== 'Quiz'));

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 pb-20 font-sans selection:bg-primary/30 relative">
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.2} style={{ zIndex: 100 }} />}
            
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] mix-blend-screen rounded-full pointer-events-none" />
            
            <div className="container mx-auto px-4 md:px-8 relative z-10">
                
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        Assignments & Quizzes
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Complete tasks, challenge yourself with quizzes, and earn rewards to level up your tier.
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {['All', 'Assignment', 'Quiz'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                                filter === f 
                                ? 'bg-primary text-primary-foreground shadow-primary/25 scale-105' 
                                : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Task Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <motion.div 
                            initial="hidden" animate="visible"
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredTasks.map((task) => {
                                const isQuiz = task.category === 'Quiz';
                                const submitted = mySubmissions[task._id];
                                
                                return (
                                    <motion.div 
                                        key={task._id} 
                                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                                        whileHover={{ y: -5 }}
                                        className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 rounded-3xl p-6 relative overflow-hidden group shadow-lg transition-colors flex flex-col"
                                    >
                                        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] uppercase tracking-wider ${isQuiz ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {task.category}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mb-4 mt-2">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isQuiz ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {isQuiz ? <HelpCircle className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                            </div>
                                            <h3 className="text-xl font-black text-foreground line-clamp-2">{task.title}</h3>
                                        </div>
                                        
                                        <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-3">
                                            {task.description || "No description provided."}
                                        </p>

                                        <div className="space-y-4 mt-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                                                    <Trophy className="w-3.5 h-3.5" />
                                                    {task.points} pts
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-muted-foreground border border-border text-xs font-bold">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {submitted ? (
                                                <div className="w-full py-3.5 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-black text-center flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    {submitted.type === 'quiz' ? `Score: ${submitted.score}%` : 'Submitted'}
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => handleOpenSubmit(task)}
                                                    className={`w-full py-3.5 rounded-xl font-black text-white shadow-lg transition-transform active:scale-95 ${isQuiz ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/25' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'}`}
                                                >
                                                    {isQuiz ? 'Start Quiz' : 'Submit Now'}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                        
                        {filteredTasks.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                <Search className="w-16 h-16 opacity-20 mb-4" />
                                <h3 className="text-xl font-black">No Active Tasks</h3>
                                <p className="opacity-70">Check back later for new {filter.toLowerCase()}s.</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* --- Modals --- */}
            <AnimatePresence>
                {/* Assignment Submission Modal */}
                {submitOpen && selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} 
                            className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                                <h2 className="text-xl font-black text-foreground truncate pl-2">{selectedTask.title}</h2>
                                <button onClick={() => setSubmitOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                            </div>
                            <form onSubmit={handleSubmission} className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Submission Type</label>
                                    <select 
                                        value={subType} onChange={(e) => setSubType(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="link">Link (Google Doc, Github, etc.)</option>
                                        <option value="text">Direct Text Entry</option>
                                        <option value="file">File Upload (.pdf, .zip, etc.)</option>
                                    </select>
                                </div>

                                {subType === 'link' && (
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Project URL</label>
                                        <input type="url" required value={subLink} onChange={(e) => setSubLink(e.target.value)} placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>
                                )}
                                {subType === 'text' && (
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Your Answer</label>
                                        <textarea required rows={4} value={subText} onChange={(e) => setSubText(e.target.value)} placeholder="Write your submission here..." className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all resize-none" />
                                    </div>
                                )}
                                {subType === 'file' && (
                                    <div>
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Attach File</label>
                                        <label className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-xl px-4 py-8 flex flex-col items-center justify-center cursor-pointer">
                                            <CloudUpload className="w-8 h-8 text-primary mb-2 opacity-80" />
                                            <span className="font-bold text-sm">{subFile ? subFile.name : "Click or drag to attach file"}</span>
                                            <input type="file" hidden required onChange={(e) => setSubFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                )}

                                <button 
                                    type="submit" disabled={submitting}
                                    className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Confirm Submission'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Quiz Full Screen Modal */}
                {quizOpen && selectedTask && selectedTask.quiz?.questions && (
                    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-4 md:p-8">
                            <div className="flex justify-between items-center py-4 mb-4 border-b border-border">
                                <h2 className="text-xl md:text-2xl font-black text-purple-500 line-clamp-1 pr-4">{selectedTask.title}</h2>
                                <button onClick={() => setQuizOpen(false)} className="p-2 bg-muted hover:bg-destructive/20 hover:text-destructive rounded-full transition-colors shrink-0"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Progress */}
                            <div className="w-full bg-muted rounded-full h-2.5 mb-8 overflow-hidden">
                                <div className="bg-gradient-to-r from-primary to-purple-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / selectedTask.quiz.questions.length) * 100}%` }}></div>
                            </div>

                            <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
                                <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-500 font-bold text-xs uppercase tracking-widest rounded-lg mb-4">
                                    Question {currentQuestion + 1} of {selectedTask.quiz.questions.length}
                                </span>
                                <h3 className="text-2xl md:text-4xl font-black text-foreground mb-8 leading-tight">
                                    {selectedTask.quiz.questions[currentQuestion].text}
                                </h3>

                                <div className="space-y-3 md:space-y-4">
                                    {selectedTask.quiz.questions[currentQuestion].options.map((opt, idx) => {
                                        const isSelected = quizAnswers[currentQuestion] === idx;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const newAns = [...quizAnswers];
                                                    newAns[currentQuestion] = idx;
                                                    setQuizAnswers(newAns);
                                                }}
                                                className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all font-bold md:text-lg flex items-center justify-between group ${
                                                    isSelected 
                                                    ? 'border-purple-500 bg-purple-500/10 text-purple-500 shadow-lg shadow-purple-500/10' 
                                                    : 'border-border bg-card hover:border-purple-500/50 hover:bg-purple-500/5 text-foreground'
                                                }`}
                                            >
                                                <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center p-1 transition-all ${isSelected ? 'border-purple-500' : 'border-muted-foreground group-hover:border-purple-500/50'}`}>
                                                    {isSelected && <div className="w-full h-full bg-purple-500 rounded-full" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="py-4 mt-auto flex justify-between gap-4 border-t border-border bg-background/80 backdrop-blur-md">
                                <button 
                                    disabled={currentQuestion === 0} 
                                    onClick={() => setCurrentQuestion(curr => curr - 1)}
                                    className="px-6 py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted disabled:opacity-30 transition-all"
                                >
                                    Previous
                                </button>
                                {currentQuestion < selectedTask.quiz.questions.length - 1 ? (
                                    <button 
                                        onClick={() => setCurrentQuestion(curr => curr + 1)}
                                        className="px-8 py-4 bg-primary text-primary-foreground font-black rounded-xl hover:bg-primary/90 shadow-lg transition-all"
                                    >
                                        Next Question
                                    </button>
                                ) : (
                                    <button 
                                        disabled={submitting}
                                        onClick={handleQuizSubmit}
                                        className="px-10 py-4 bg-purple-500 text-white font-black rounded-xl hover:bg-purple-600 shadow-xl shadow-purple-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Quiz 🔥'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toasts */}
            <AnimatePresence>
                {message.text && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-6 right-6 z-[200]">
                        <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'}`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-bold">{message.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentTasks;
