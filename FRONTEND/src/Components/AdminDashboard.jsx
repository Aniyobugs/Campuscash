import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { Menu, X, Plus, Trash2 } from 'lucide-react';

// Admin Components
import AdminSidebar from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import AdminStudents from './admin/AdminStudents';
import AdminFaculty from './admin/AdminFaculty';
import AdminTasks from './admin/AdminTasks';
import AdminSubmissions from './admin/AdminSubmissions';
import AdminAward from './admin/AdminAward';
import AdminMessages from './admin/AdminMessages';
import AdminVolunteers from './admin/AdminVolunteers';
import AdminSettings from './admin/AdminSettings';
import AdminStore from './admin/AdminStore';

const AdminDashboard = () => {
  const { user: currentUser, updateUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  // Layout State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Data State
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedRealDept, setSelectedRealDept] = useState("All");
  const [dashboardDept, setDashboardDept] = useState("All");
  const [dashboardYear, setDashboardYear] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // Action States
  const [awardData, setAwardData] = useState({ studentId: "", points: "", reason: "" });
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ fname: "", ename: "", yearClassDept: "", department: "", points: 0, studentId: "" });
  
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [createTaskForm, setCreateTaskForm] = useState({
    title: "", description: "", points: 10, category: "General", dueDate: "",
    assignedYears: [], quiz: { questions: [], passingScore: 70 }
  });
  
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ text: "", options: ["", "", "", ""], correctIndex: 0 });

  const yearOptions = ['All', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];
  const departmentOptions = [
    'All', ...new Set(['Computer Science', 'Commerce', 'English', 'Food Technologyy', 'Multimedia', 'Hotel Management', 'Tourism Management', 'Costume & Fashion Designing', 'Management', 'Languages', 'Mathematics', ...(users || []).map(u => u.department).filter(Boolean)])
  ];

  const deptShortForms = {
    'Computer Science': 'CS', 'Commerce': 'B.Com', 'English': 'BA English', 'Food Technologyy': 'Food Tech', 'Multimedia': 'Multimedia', 'Hotel Management': 'BHM', 'Tourism Management': 'BTTM', 'Costume & Fashion Designing': 'Fashion', 'Management': 'BBA', 'Languages': 'BA Lang', 'Mathematics': 'B.Sc Maths'
  };

  const fetchAllData = async () => {
    try {
      const [uRes, tRes, sRes, mRes, vRes] = await Promise.all([
        axios.get(`${baseurl}/api/users`),
        axios.get(`${baseurl}/api/tasks`),
        axios.get(`${baseurl}/api/submissions`),
        axios.get(`${baseurl}/api/contact/all`),
        axios.get(`${baseurl}/api/volunteers/all`)
      ]);
      setUsers(uRes.data);
      setTasks(tRes.data);
      setSubmissions(sRes.data);
      setMessages(mRes.data || []);
      setVolunteers(vRes.data || []);
    } catch (err) { console.error("Error fetching data", err); }
  };

  useEffect(() => { fetchAllData(); }, []);

  // Handlers
  const handleAward = async () => {
    if (!awardData.studentId || !awardData.points) return setError("Please select student and points");
    try {
      const res = await axios.post(`${baseurl}/api/award-points`, awardData);
      setSuccess(res.data.message);
      setUsers(users.map(u => u._id === awardData.studentId ? { ...u, points: (u.points || 0) + Number(awardData.points) } : u));
      setAwardData({ studentId: "", points: "", reason: "" });
    } catch (err) { setError(err.response?.data?.message || "Award failed"); }
  };

  const handleCreateTask = async () => {
    if (!createTaskForm.title || !createTaskForm.points) return setError("Missing required fields");
    let finalQuestions = [...createTaskForm.quiz.questions];
    if (finalQuestions.length === 0 && currentQuestion.text && currentQuestion.options.every(o => o)) {
      finalQuestions.push(currentQuestion);
    }
    if ((showQuizBuilder || createTaskForm.category === 'Quiz') && finalQuestions.length === 0) {
      return setError("Please add at least one question for the Quiz.");
    }
    try {
      const payload = {
        ...createTaskForm,
        quiz: { ...createTaskForm.quiz, questions: finalQuestions },
        dueDate: new Date(createTaskForm.dueDate).toISOString(),
      };
      const res = await axios.post(`${baseurl}/api/tasks/addtask`, payload);
      setSuccess("Task created!");
      setTasks([...tasks, res.data.task || res.data]);
      setCreateTaskOpen(false);
      setCreateTaskForm({ title: '', description: '', dueDate: '', points: 10, category: 'General', assignedYears: [], quiz: { questions: [], passingScore: 70 } });
      setCurrentQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0 });
      setShowQuizBuilder(false);
    } catch (err) { setError("Failed to create task"); }
  };

  const handleApproveSubmission = async (s) => {
    try {
      const res = await axios.put(`${baseurl}/api/submissions/${s._id}/approve`, { adminComment: '' });
      setSuccess("Submission accepted");
      setSubmissions(prev => prev.map(sub => sub._id === s._id ? { ...sub, status: 'accepted' } : sub));
      if (res.data.user) setUsers(prev => prev.map(u => u._id === res.data.user._id ? { ...u, points: res.data.user.points } : u));
    } catch (err) { setError("Failed to accept"); }
  };

  const handleBulkApproveSubmissions = async () => {
    const pendingSubs = submissions.filter(s => s.status === 'pending');
    if (pendingSubs.length === 0) return setError("No pending submissions found");
    if (!window.confirm(`Bulk approve ${pendingSubs.length} pending submissions?`)) return;
    
    try {
      await Promise.all(pendingSubs.map(s => axios.put(`${baseurl}/api/submissions/${s._id}/approve`, { adminComment: 'Bulk Approved' })));
      setSuccess(`Successfully approved ${pendingSubs.length} submissions!`);
      fetchAllData();
    } catch (err) { setError("Failed to bulk approve"); }
  };

  const handleRejectSubmission = async (s) => {
    try {
      await axios.put(`${baseurl}/api/submissions/${s._id}/reject`, { adminComment: '' });
      setSuccess("Submission rejected");
      setSubmissions(prev => prev.map(sub => sub._id === s._id ? { ...sub, status: 'rejected' } : sub));
    } catch (err) { setError("Failed to reject"); }
  };

  const handleClearSubmissions = async () => {
    if (!window.confirm("Delete ALL submissions?")) return;
    try {
      await axios.delete(`${baseurl}/api/submissions`);
      setSuccess("All submissions cleared");
      setSubmissions([]);
    } catch (err) { setError("Failed to clear submissions"); }
  };

  const handleClearMessages = async () => {
    if (!window.confirm("Delete ALL messages?")) return;
    try {
      await axios.delete(`${baseurl}/api/contact/all`);
      setSuccess("All messages cleared");
      setMessages([]);
    } catch (err) { setError("Failed to clear messages"); }
  };

  const handleClearVolunteers = async () => {
    if (!window.confirm("Delete ALL volunteer applications?")) return;
    try {
      await axios.delete(`${baseurl}/api/volunteers/all`);
      setSuccess("All volunteer applications cleared");
      setVolunteers([]);
    } catch (err) { setError("Failed to clear volunteers"); }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title, description: task.description, dueDate: task.dueDate.slice(0, 16), points: task.points,
      category: task.category || 'General', assignedYears: task.assignedYears || [], quiz: task.quiz || { questions: [], passingScore: 70 },
    });
    setEditTaskOpen(true);
  };

  const handleSaveEditedTask = async () => {
    try {
      const res = await axios.put(`${baseurl}/api/tasks/${editingTask._id}`, editTaskForm);
      setSuccess("Task updated");
      setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data : t));
      setEditTaskOpen(false);
    } catch (err) { setError("Failed to update task"); }
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`${baseurl}/api/tasks/${taskToDelete._id}`);
      setSuccess("Task deleted");
      setTasks(prev => prev.filter(t => t._id !== taskToDelete._id));
      setDeleteTaskOpen(false);
    } catch (err) { setError("Failed to delete task"); }
  };

  const handleClearTasks = async () => {
     if (!window.confirm("Delete ALL tasks?")) return;
     try {
       await axios.delete(`${baseurl}/api/tasks`);
       setSuccess("All tasks cleared");
       setTasks([]);
     } catch (err) { setError("Failed to clear tasks"); }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditUserForm({
      fname: user.fname, ename: user.ename, yearClassDept: user.yearClassDept, department: user.department || "",
      points: user.points || 0, studentId: user.studentId || ""
    });
    setEditUserOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", editUserForm.fname);
      formData.append("email", editUserForm.ename);
      if (editUserForm.studentId) formData.append("studentId", editUserForm.studentId);
      formData.append("yearClassDept", editUserForm.yearClassDept);
      formData.append("department", editUserForm.department);
      formData.append("points", editUserForm.points);

      const res = await axios.put(`${baseurl}/api/users/${editingUser._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("User updated successfully");
      setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data.user : u));
      if (currentUser && (editingUser._id === currentUser.id || editingUser._id === currentUser._id)) updateUser(res.data.user);
      setEditUserOpen(false);
    } catch (err) { setError(err.response?.data?.message || "Failed to update user"); }
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await axios.put(`${baseurl}/api/users/${user._id}/status`);
      setSuccess(res.data.message);
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.user : u));
    } catch (err) { setError("Failed to update status"); }
  };

  // UI Helpers
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
    if (error) { const t = setTimeout(() => setError(""), 3000); return () => clearTimeout(t); }
  }, [success, error]);

  const ModalOverlay = ({ isOpen, onClose, children }) => (
    <AnimatePresence>
      {isOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto p-6 md:p-8">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"><X className="w-5 h-5"/></button>
              {children}
           </motion.div>
         </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-background text-foreground flex ${isDark ? 'dark' : ''}`}>
      
      {/* Alerts */}
      <AnimatePresence>
        {success && <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[200] px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-bold shadow-lg backdrop-blur-md">{success}</motion.div>}
        {error && <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[200] px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl font-bold shadow-lg backdrop-blur-md">{error}</motion.div>}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-border bg-card shadow-xl z-20">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="relative w-72 bg-card h-full shadow-2xl">
              <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} setMobileOpen={setMobileOpen} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-4rem)] relative p-4 md:p-8 xl:p-12">
        <div className="lg:hidden mb-6 flex items-center justify-between pointer-events-none">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl bg-card border border-border shadow-sm pointer-events-auto"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">CampusAdmin</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === "dashboard" && <AdminOverview users={users} submissions={submissions} dashboardYear={dashboardYear} setDashboardYear={setDashboardYear} dashboardDept={dashboardDept} setDashboardDept={setDashboardDept} yearOptions={yearOptions} departmentOptions={departmentOptions} />}
            {activeTab === "users" && <AdminStudents users={users} search={search} setSearch={setSearch} selectedDept={selectedDept} setSelectedDept={setSelectedDept} selectedRealDept={selectedRealDept} setSelectedRealDept={setSelectedRealDept} yearOptions={yearOptions} departmentOptions={departmentOptions} handleEditUserClick={handleEditUserClick} handleToggleStatus={handleToggleStatus} deptShortForms={deptShortForms} baseurl={baseurl} />}
            {activeTab === "faculty" && <AdminFaculty users={users} handleEditUserClick={handleEditUserClick} handleToggleStatus={handleToggleStatus} baseurl={baseurl} />}
            {activeTab === "tasks" && <AdminTasks tasks={tasks} handleCreateTaskClick={() => setCreateTaskOpen(true)} handleEditTaskClick={handleEditTaskClick} handleDeleteTaskClick={(t) => { setTaskToDelete(t); setDeleteTaskOpen(true); }} handleClearTasks={handleClearTasks} />}
            {activeTab === "submissions" && <AdminSubmissions submissions={submissions} handleClearSubmissions={handleClearSubmissions} handleApproveSubmission={handleApproveSubmission} handleRejectSubmission={handleRejectSubmission} handleBulkApproveSubmissions={handleBulkApproveSubmissions} setSelectedSubmission={setSelectedSubmission} baseurl={baseurl} />}
            {activeTab === "award" && <AdminAward users={users} awardData={awardData} setAwardData={setAwardData} handleAward={handleAward} baseurl={baseurl} />}
            {activeTab === "messages" && <AdminMessages messages={messages} handleClearMessages={handleClearMessages} setSelectedMessage={setSelectedMessage} />}
            {activeTab === "volunteers" && <AdminVolunteers volunteers={volunteers} handleClearVolunteers={handleClearVolunteers} handleApproveVolunteer={() => {}} handleRejectVolunteer={() => {}} handleOpenAwardForVolunteer={(vol) => { setAwardData({...awardData, studentId: users.find(u => u.studentId === vol.studentId)?._id}); setActiveTab('award'); }} />}
            {activeTab === "settings" && <AdminSettings />}
            {activeTab === "store" && <AdminStore />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- Modals Component Space --- */}
    
      <ModalOverlay isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)}>
        <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Title" value={createTaskForm.title} onChange={e => setCreateTaskForm({...createTaskForm, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          <textarea placeholder="Description" value={createTaskForm.description} onChange={e => setCreateTaskForm({...createTaskForm, description: e.target.value})} rows="3" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Points" value={createTaskForm.points} onChange={e => setCreateTaskForm({...createTaskForm, points: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
            <input type="datetime-local" value={createTaskForm.dueDate} onChange={e => setCreateTaskForm({...createTaskForm, dueDate: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          </div>
          <button onClick={handleCreateTask} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold mt-4">Save Task</button>
        </div>
      </ModalOverlay>

      <ModalOverlay isOpen={editTaskOpen} onClose={() => setEditTaskOpen(false)}>
        <h2 className="text-2xl font-bold mb-6">Edit Task</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Title" value={editTaskForm.title} onChange={e => setEditTaskForm({...editTaskForm, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          <textarea placeholder="Description" value={editTaskForm.description} onChange={e => setEditTaskForm({...editTaskForm, description: e.target.value})} rows="3" className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Points" value={editTaskForm.points} onChange={e => setEditTaskForm({...editTaskForm, points: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
            <input type="datetime-local" value={editTaskForm.dueDate} onChange={e => setEditTaskForm({...editTaskForm, dueDate: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          </div>
          <button onClick={handleSaveEditedTask} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold mt-4">Update Task</button>
        </div>
      </ModalOverlay>

      <ModalOverlay isOpen={editUserOpen} onClose={() => setEditUserOpen(false)}>
        <h2 className="text-2xl font-bold mb-6">Edit User</h2>
        <div className="space-y-4">
          <input type="text" placeholder="First Name" value={editUserForm.fname} onChange={e => setEditUserForm({...editUserForm, fname: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          <input type="email" placeholder="Email" value={editUserForm.ename} onChange={e => setEditUserForm({...editUserForm, ename: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="Department" value={editUserForm.department} onChange={e => setEditUserForm({...editUserForm, department: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
             <input type="number" placeholder="Points" value={editUserForm.points} onChange={e => setEditUserForm({...editUserForm, points: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none" />
          </div>
          <button onClick={handleSaveUser} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold mt-4">Save Changes</button>
        </div>
      </ModalOverlay>

      <ModalOverlay isOpen={deleteTaskOpen} onClose={() => setDeleteTaskOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 text-destructive flex items-center gap-2"><Trash2 className="w-6 h-6"/> Confirm Deletion</h2>
        <p className="text-muted-foreground mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex gap-4">
           <button onClick={() => setDeleteTaskOpen(false)} className="flex-1 py-3 bg-muted text-foreground border border-border rounded-xl font-bold hover:bg-muted/80 transition-colors">Cancel</button>
           <button onClick={handleDeleteTask} className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:bg-destructive/90 transition-colors">Delete Task</button>
        </div>
      </ModalOverlay>

      <ModalOverlay isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)}>
         {selectedSubmission && (
          <div className="space-y-4">
             <h2 className="text-2xl font-bold mb-2">Submission Review</h2>
             <div className="bg-muted/30 p-4 rounded-xl border border-border">
               <p className="font-bold text-lg mb-1">{selectedSubmission.user?.fname}</p>
               <p className="text-sm text-muted-foreground">{selectedSubmission.task?.title}</p>
             </div>
             <div className="mt-4">
                <span className="text-sm font-bold text-muted-foreground mb-2 block">Content</span>
                {selectedSubmission.type === 'link' && <a href={selectedSubmission.link} target="_blank" rel="noreferrer" className="text-blue-500 break-all hover:underline">{selectedSubmission.link}</a>}
                {selectedSubmission.type === 'text' && <div className="p-4 bg-background border border-border rounded-xl font-medium">{selectedSubmission.text}</div>}
             </div>
          </div>
         )}
      </ModalOverlay>

      <ModalOverlay isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
         {selectedMessage && (
          <div className="space-y-4">
             <h2 className="text-2xl font-bold mb-1">Message Details</h2>
             <p className="text-sm text-muted-foreground mb-4">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
             <div className="bg-muted/30 p-4 rounded-xl border border-border">
               <p className="font-bold mb-1">{selectedMessage.firstName} {selectedMessage.lastName}</p>
               <p className="text-sm text-primary mb-2">{selectedMessage.email}</p>
               <div className="p-4 bg-background border border-border rounded-lg text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</div>
             </div>
          </div>
         )}
      </ModalOverlay>

    </div>
  );
};

export default AdminDashboard;
