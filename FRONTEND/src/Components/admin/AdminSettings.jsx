import React, { useState, useEffect } from 'react';
import { Settings, Save, BellRing, ShieldAlert, Sparkles } from 'lucide-react';

export default function AdminSettings() {
  const [banner, setBanner] = useState({ active: false, message: '', type: 'info' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('globalBanner');
    if (saved) {
      setBanner(JSON.parse(saved));
    }
  }, []);

  const handleSaveBanner = () => {
    localStorage.setItem('globalBanner', JSON.stringify(banner));
    setSuccess('Global Banner settings updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-foreground">System Settings</h2>
          <p className="text-muted-foreground font-medium">Manage global platform configurations</p>
        </div>
      </div>

      {success && (
         <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold flex items-center gap-2">
           <Sparkles className="w-5 h-5"/> {success}
         </div>
      )}

      {/* Global Announcements Section */}
      <div className="bg-card border border-border shadow-lg rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <BellRing className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-bold">Global Dashboard Banner</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={banner.active}
                onChange={(e) => setBanner({...banner, active: e.target.checked})}
              />
              <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="font-bold">{banner.active ? 'Banner Active' : 'Banner Hidden'}</span>
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Announcement Message</label>
            <textarea 
              rows={3}
              value={banner.message}
              onChange={(e) => setBanner({...banner, message: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              placeholder="e.g. Server maintenance scheduled for 10 PM tonight."
              disabled={!banner.active}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Banner Style</label>
            <div className="flex gap-4">
               {['info', 'warning', 'success', 'destructive'].map(type => (
                 <button 
                   key={type}
                   disabled={!banner.active}
                   onClick={() => setBanner({...banner, type})}
                   className={`flex-1 py-3 px-4 rounded-xl border font-bold capitalize transition-colors ${
                     banner.type === type && banner.active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                   } disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSaveBanner}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <Save className="w-5 h-5"/> Save Banner Settings
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone Placeholder */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 text-destructive">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="text-xl font-bold">Danger Zone</h3>
        </div>
        <p className="text-muted-foreground mb-4">Resetting academic year or deleting all data requires Super Admin privileges.</p>
        <button className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-bold hover:bg-destructive/20 transition-colors shadow-sm cursor-not-allowed opacity-50">
          Reset Academic Year
        </button>
      </div>

    </div>
  );
}
