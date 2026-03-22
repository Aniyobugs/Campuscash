import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Gem, Gift, Coffee, Store, Receipt, Clock, X, ArrowRight } from 'lucide-react';
import HeroImage from '../assets/hero-students.png';
import axios from 'axios';

const featureData = [
  {
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
    title: 'Complete Tasks',
    text: 'Assignments, projects, and campus activities earn you points—effort counts everywhere.',
  },
  {
    icon: <Gem className="w-8 h-8 text-emerald-500" />,
    title: 'Earn Points',
    text: 'Track your progress and see your point balance grow in your personalized dashboard.',
  },
  {
    icon: <Gift className="w-8 h-8 text-amber-500" />,
    title: 'Redeem Rewards',
    text: 'Use your points for discounts at the bookstore, free coffee, library perks, and more.',
  },
];

const rewardsData = [
  {
    img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=800&auto=format&fit=crop',
    icon: <Store className="w-6 h-6 text-primary" />,
    title: 'Store Discount',
    desc: 'Get 10% off textbooks!',
    points: '500 Points',
  },
  {
    img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
    icon: <Coffee className="w-6 h-6 text-primary" />,
    title: 'Free Coffee',
    desc: 'Campus café treat.',
    points: '250 Points',
  },
  {
    img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop',
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: 'Library Extension',
    desc: 'Extra week for returns.',
    points: '350 Points',
  },
];

const testimonials = [
  {
    name: 'Aisha R.',
    role: 'Computer Science',
    quote: "Campus Cash made studying fun — I redeemed a textbook discount within a month!",
  },
  {
    name: 'Rahul K.',
    role: 'Business Student',
    quote: "Easy tasks, quick points. Coffee on me this week — thanks Campus Cash!",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const baseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const [bannerOpen, setBannerOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await axios.get(`${baseurl}/api/events/active`);
        if (res.data) {
          setActiveBanner(res.data);
          setTimeout(() => setBannerOpen(true), 2500);
        }
      } catch (err) {}
    };
    fetchBanner();
  }, [baseurl]);

  useEffect(() => {
    const id = location.state?.scrollTo;
    if (id) {
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {}
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      
      {/* HERO SECTION - Very modern, clean dark/light mode adaptable */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Text */}
            <motion.div 
               variants={fadeUp} 
               initial="hidden" 
               animate="visible"
               className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-8 border border-border">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Earn rewards for your campus activity
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Study. Earn. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  Redeem. Repeat.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Join a dynamic student ecosystem where your daily grind pays off. Turn completed assignments and club events into real-world value.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => navigate('/s')}
                  className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Start Earning <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-2xl hover:bg-secondary/80 border border-border transition-all text-lg"
                >
                  How it works
                </button>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10" />
                 <img src={HeroImage} alt="Students" className="w-full h-full object-cover" />
              </div>
              {/* Floating aesthetic element */}
              <div className="absolute -bottom-8 -left-8 bg-card border border-border shadow-xl p-6 rounded-2xl z-20 flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                    <Gem className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                    <p className="text-sm text-muted-foreground font-medium">Weekly Points</p>
                    <p className="text-2xl font-bold">+1,240</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to unlock campus perks.</p>
          </div>

          <motion.div 
             variants={staggerContainer} 
             initial="hidden" 
             whileInView="visible" 
             viewport={{ once: true, amount: 0.2 }} 
             className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {featureData.map(({ icon, title, text }, index) => (
              <motion.div variants={fadeUp} key={index} className="relative group">
                <div className="bg-background border border-border rounded-3xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border">
                      {icon}
                   </div>
                   <h3 className="text-xl font-bold mb-3">{title}</h3>
                   <p className="text-muted-foreground leading-relaxed">{text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REWARDS SHOWCASE */}
      <section id="rewards" className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Popular Rewards</h2>
                <p className="text-muted-foreground max-w-xl">Spend your hard-earned points on actual value around campus.</p>
              </div>
              <button className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Catalog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rewardsData.map(({ img, icon, title, desc, points }, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="group"
                >
                  <div className="bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
                    <div className="h-48 relative overflow-hidden">
                      <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur pb-px pt-1 px-3 rounded-full flex items-center gap-1 font-bold text-sm shadow-md border border-border">
                        <Gem className="w-3 h-3 text-primary" /> {points}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center -mt-12 relative z-10 mb-4 border border-border shadow-sm">
                        {icon}
                      </div>
                      <h4 className="font-bold text-xl mb-2">{title}</h4>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      {/* WHY CAMPUS CASH */}
      <section id="why" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black opacity-10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />

        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Why students love us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {['Motivates academic performance', 'Rewards real campus participation', 'Safe transparent wallet system', 'Exclusive local vendor partnerships'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-md p-6 rounded-2xl border border-primary-foreground/20">
                  <CheckCircle className="w-6 h-6 text-emerald-300 shrink-0" />
                  <span className="font-semibold text-lg">{benefit}</span>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* BANNER POPUP */}
      <AnimatePresence>
        {bannerOpen && activeBanner && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setBannerOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-card border border-border shadow-2xl rounded-3xl overflow-hidden w-full max-w-2xl z-10 flex flex-col md:flex-row"
             >
                {activeBanner.imageUrl && (
                  <div className="w-full md:w-2/5 h-48 md:h-auto bg-muted relative">
                    <img 
                      src={activeBanner.imageUrl.startsWith('http') ? activeBanner.imageUrl : `${baseurl}${activeBanner.imageUrl}`} 
                      alt="Announcement" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-8 w-full ${activeBanner.imageUrl ? 'md:w-3/5' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase rounded-full">
                      Announcement
                    </span>
                    <button 
                      onClick={() => setBannerOpen(false)}
                      className="p-1 rounded-full text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3">{activeBanner.title}</h2>
                  <p className="text-muted-foreground mb-8">{activeBanner.description}</p>
                  
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setBannerOpen(false); navigate('/events'); }}
                        className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
