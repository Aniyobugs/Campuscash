import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X, ArrowRight, Github, Chrome } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [input, setInput] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  const inputHandler = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInput({ ...input, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleLogin = async () => {
    const nextErrors = {};
    if (!input.ename) nextErrors.ename = 'Please enter your email or ID';
    if (!input.password) nextErrors.password = 'Please enter your password';
    setErrors(nextErrors);
    
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/api/login`, input);
      setLoading(false);
      setAlert(res.data.message || 'Logged in successfully');

      if (res.status === 200 && res.data.user) {
        if (login) login(res.data.user, res.data.token);
        if (res.data.token) sessionStorage.setItem('token', res.data.token);

        const role = res.data.user.role;
        setTimeout(() => {
          if (role === 'admin') navigate('/admin');
          else if (role === 'store') navigate('/store');
          else if (role === 'faculty') navigate('/faculty');
          else navigate('/user');
        }, 1000); // 1s delay for beautiful success animation
      }
    } catch (err) {
      setLoading(false);
      setErrors({ form: err.response?.data?.message || 'Invalid credentials. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden px-4 py-20">
      
      {/* Abstract Glowing Backgrounds */}
      <div className="absolute top-[20%] -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="bg-card border border-border hover:border-border/80 transition-all shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side - Image/Branding (Hidden on mobile) */}
          <div className="hidden md:flex md:w-1/2 relative bg-zinc-900 flex-col justify-end p-12 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
              alt="Campus" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            
            <div className="relative z-20 text-white">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-primary/30">
                CC
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                Welcome back to <br/> Campus Cash.
              </h2>
              <p className="text-zinc-300 text-lg max-w-sm leading-relaxed">
                The smart way to verify, redeem, and manage your campus rewards seamlessly.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-3xl font-black mb-2 tracking-tight">Sign In</h3>
              <p className="text-muted-foreground">Please enter your details to continue.</p>
            </div>

            {/* Alert / Errors */}
            <AnimatePresence>
              {alert && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-between"
                >
                  <span className="font-semibold">{alert}</span>
                  <button onClick={() => setAlert('')}><X className="w-4 h-4" /></button>
                </motion.div>
              )}
              {errors.form && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl"
                >
                  <span className="font-semibold block mb-1">{errors.form}</span>
                  {errors.form.toLowerCase().includes('inactive') && (
                    <Link to="/contact" className="text-sm underline font-bold opacity-80 hover:opacity-100">Contact Admin for help</Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {/* Email / ID Field */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Email or Student ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    name="ename" 
                    value={input.ename || ''} 
                    onChange={inputHandler}
                    placeholder="student@college.edu or ID"
                    className={`w-full bg-background border ${errors.ename ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {errors.ename && <p className="text-destructive text-sm mt-1">{errors.ename}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={input.password || ''} 
                    onChange={inputHandler}
                    placeholder="••••••••"
                    className={`w-full bg-background border ${errors.password ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'} rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 transition-all`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
                
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="remember" 
                      onChange={inputHandler}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                    />
                    <span className="text-sm text-muted-foreground font-medium">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm font-bold text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-primary to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait hover:scale-[1.02]"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />}
              </button>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Or continue with</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-xl hover:bg-muted/50 transition-colors font-semibold text-sm">
                    <Chrome className="w-5 h-5" /> Google
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 border border-border rounded-xl hover:bg-muted/50 transition-colors font-semibold text-sm">
                    <Github className="w-5 h-5" /> GitHub
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground mt-8">
          Don't have an account yet?{' '}
          <Link to="/s" className="text-primary hover:underline font-bold">Sign up instantly</Link>
        </p>

      </motion.div>
    </div>
  );
}