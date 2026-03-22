import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  User, Mail, Lock, CheckCircle, ChevronRight, ChevronLeft, 
  Eye, EyeOff, GraduationCap, Building, IdCard, Sparkles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DEPARTMENTS = [
  "English", "Food Technology", "Commerce", "Computer Science", 
  "Multimedia", "Hotel Management", "Tourism Management", 
  "Costume & Fashion Designing", "Management", "Languages", "Mathematics"
];

const YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];

export default function Signup() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState({ termsAccepted: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();

  // For Confetti
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const inputHandler = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInput(prev => ({ ...prev, [e.target.name]: value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const calcStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 6) score += 30;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 30;
    return Math.min(100, score);
  };

  const pwdStrength = calcStrength(input.password);

  const validateStep1 = () => {
    const nextErrors = {};
    if (!input.fname) nextErrors.fname = 'Full name is required';
    if (!input.ename || !/^\S+@\S+\.\S+$/.test(input.ename)) nextErrors.ename = 'Enter a valid college email';
    if (!input.password || input.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep(2);
  };

  const validateStep2 = () => {
    const nextErrors = {};
    if (!input.yearClassDept) nextErrors.yearClassDept = 'Selecting your year/role is required';
    if (!input.department) nextErrors.department = 'Department is required';
    if (input.yearClassDept !== 'Faculty' && !input.studentId) nextErrors.studentId = 'Student ID is required';
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep(3);
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    if (!input.termsAccepted) nextErrors.termsAccepted = 'You must accept the Terms of Service';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/api`, input);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/L'), 4000); // Wait for confetti
    } catch (error) {
      setLoading(false);
      setErrors({ form: error.response?.data?.message || 'We could not create your account. Please try again.' });
    }
  };

  // Animations
  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden px-4 py-20">
      {/* Confetti Explosion on Success */}
      {success && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      {/* Decorative Background Elements */}
      <div className="absolute top-[10%] -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-card border border-border shadow-2xl rounded-3xl overflow-hidden p-8 md:p-12 relative">
          
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center relative z-10 mb-2">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 border-2
                    ${step > num ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      step === num ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                      'bg-muted border-border text-muted-foreground'}`}
                >
                  {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                </div>
              ))}
            </div>
            {/* Connecting lines */}
            <div className="absolute top-[68px] md:top-[84px] left-[52px] right-[52px] md:left-[68px] md:right-[68px] h-[2px] bg-border -z-0">
               <motion.div 
                 className="h-full bg-primary" 
                 initial={{ width: 0 }}
                 animate={{ width: `${(step - 1) * 50}%` }}
                 transition={{ duration: 0.4 }}
               />
            </div>
            
            <div className="flex justify-between text-xs font-semibold text-muted-foreground tracking-wider uppercase mt-4">
              <span>Account</span>
              <span>Details</span>
              <span>Finalize</span>
            </div>
          </div>

          <AnimatePresence mode="popLayout" initial={false} custom={step}>
            
            {/* STEP 1: ACCOUNT INFO */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Create your account</h2>
                  <p className="text-muted-foreground">Join the Campus Cash community today.</p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" name="fname" value={input.fname || ''} onChange={inputHandler}
                      placeholder="John Doe"
                      className={`w-full bg-background border ${errors.fname ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all`}
                    />
                  </div>
                  {errors.fname && <p className="text-destructive text-sm mt-1">{errors.fname}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">College Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="email" name="ename" value={input.ename || ''} onChange={inputHandler}
                      placeholder="student@college.edu"
                      className={`w-full bg-background border ${errors.ename ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all`}
                    />
                  </div>
                  {errors.ename && <p className="text-destructive text-sm mt-1">{errors.ename}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type={showPassword ? 'text' : 'password'} name="password" value={input.password || ''} onChange={inputHandler}
                      placeholder="••••••••"
                      className={`w-full bg-background border ${errors.password ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 transition-all`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                  
                  {input.password && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${pwdStrength < 40 ? 'bg-destructive' : pwdStrength < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pwdStrength}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1 font-medium text-muted-foreground">
                        {pwdStrength < 40 ? 'Weak' : pwdStrength < 80 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={validateStep1}
                  className="w-full mt-4 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-all"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Academic Details</h2>
                  <p className="text-muted-foreground">Help us customize your dashboard.</p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Year or Role</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select 
                      name="yearClassDept" value={input.yearClassDept || ''} onChange={inputHandler}
                      className={`w-full bg-background border ${errors.yearClassDept ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all appearance-none`}
                    >
                      <option value="" disabled>Select Year / Role</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  {errors.yearClassDept && <p className="text-destructive text-sm mt-1">{errors.yearClassDept}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Department</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select 
                      name="department" value={input.department || ''} onChange={inputHandler}
                      className={`w-full bg-background border ${errors.department ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all appearance-none`}
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {errors.department && <p className="text-destructive text-sm mt-1">{errors.department}</p>}
                </div>

                {input.yearClassDept !== 'Faculty' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-sm font-semibold mb-2 block">Student ID</label>
                    <div className="relative">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="text" name="studentId" value={input.studentId || ''} onChange={inputHandler}
                        placeholder="e.g. 21BCE0001"
                        className={`w-full bg-background border ${errors.studentId ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all`}
                      />
                    </div>
                    {errors.studentId && <p className="text-destructive text-sm mt-1">{errors.studentId}</p>}
                  </motion.div>
                )}

                <div className="flex gap-4 mt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button 
                    onClick={validateStep2}
                    className="w-2/3 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-all"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FINALIZE */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col gap-6 text-center"
              >
                {!success ? (
                  <>
                    <div className="mb-4">
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-primary" />
                      </div>
                      <h2 className="text-3xl font-black mb-2 tracking-tight">Almost there!</h2>
                      <p className="text-muted-foreground">Review and accept the terms to unlock your new dashboard.</p>
                    </div>

                    <div className="bg-background border border-border rounded-xl p-6 text-left mb-4 shadow-inner">
                      <p className="text-sm font-semibold mb-1 text-foreground">Account Summary:</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Name:</span> {input.fname}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {input.ename}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Role:</span> {input.yearClassDept}</p>
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Dept:</span> {input.department}</p>
                    </div>

                    <label className="flex items-center gap-3 justify-center mb-4 cursor-pointer text-left mx-auto max-w-sm">
                      <input 
                        type="checkbox" 
                        name="termsAccepted" 
                        checked={!!input.termsAccepted} 
                        onChange={inputHandler}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background"
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </span>
                    </label>
                    {errors.termsAccepted && <p className="text-destructive text-sm -mt-3">{errors.termsAccepted}</p>}

                    {errors.form && (
                      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl text-sm font-medium">
                        {errors.form}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="w-1/3 py-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 flex items-center justify-center transition-all disabled:opacity-50"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-2/3 py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait hover:scale-[1.02]"
                      >
                        {loading ? 'Creating...' : 'Create Account'}
                        {!loading && <Sparkles className="w-5 h-5" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tight text-foreground">Welcome Aboard!</h2>
                    <p className="text-lg text-muted-foreground">Your account has been successfully created.</p>
                    <p className="text-sm font-medium text-emerald-500 mt-4 animate-pulse">Redirecting to login...</p>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {!success && (
            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Already have an account?{' '}
                <Link to="/L" className="text-primary hover:underline font-bold">
                  Log in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
