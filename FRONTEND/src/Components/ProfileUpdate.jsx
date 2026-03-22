import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const ProfileUpdate = ({ userId: propUserId }) => {
  const [form, setForm] = useState({
    fullName: "",
    yearClassDept: "",
    department: "",
    currentPassword: "",
    newPassword: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const baseurl = import.meta.env.VITE_API_BASE_URL;
  const { user, updateUser } = useAuth();
  const userId = propUserId || user?.id || user?._id;

  useEffect(() => {
    if (!userId) {
      setError("No user logged in");
      return;
    }
    axios
      .get(`${baseurl}/api/${userId}`)
      .then((res) => {
        const { fname, yearClassDept, department, profilePic } = res.data;
        setForm((prev) => ({
          ...prev,
          fullName: fname || "",
          yearClassDept: yearClassDept || "",
          department: department || "",
        }));
        if (profilePic) setPreview(`${baseurl}${profilePic}`);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setError("Failed to load profile");
      });
  }, [userId, baseurl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("yearClassDept", form.yearClassDept);
      formData.append("department", form.department);
      if (form.currentPassword) formData.append("currentPassword", form.currentPassword);
      if (form.newPassword) formData.append("newPassword", form.newPassword);
      if (profilePic) formData.append("profilePic", profilePic);

      const res = await axios.put(`${baseurl}/api/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "Profile updated successfully!");
      if (userId === user.id || userId === user._id) {
        updateUser(res.data.user);
      }
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      
      // Auto-hide success
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-12 px-4 selection:bg-primary/30 font-sans relative overflow-hidden flex items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 border-b border-border bg-muted/20 text-center relative overflow-hidden">
          <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Update Profile
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Manage your personal information and security.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted flex items-center justify-center relative">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-muted-foreground">{form.fullName ? form.fullName[0] : "U"}</span>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                  </div>
                </div>
                <input type="file" hidden accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name</label>
                <input 
                  type="text" name="fullName" value={form.fullName} onChange={handleChange} required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50" 
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Year / Class</label>
                  <select 
                    name="yearClassDept" value={form.yearClassDept} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select Year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Department</label>
                  <select 
                    name="department" value={form.department} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="English">English</option>
                    <option value="Management">Management</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Multimedia">Multimedia</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="pt-6 border-t border-border mt-6">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Security</h3>
              <div className="space-y-4">
                <div>
                  <input 
                    type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50" 
                    placeholder="Current Password (leave blank to keep unchanged)"
                  />
                </div>
                <div>
                  <input 
                    type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50" 
                    placeholder="New Password"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-6 right-6 z-50">
            <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold">{success}</span>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-6 right-6 z-50">
            <div className="bg-rose-500/10 border border-rose-500/20 backdrop-blur-md text-rose-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <span className="font-bold">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ProfileUpdate;
