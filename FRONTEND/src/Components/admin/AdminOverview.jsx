import React from 'react';
import { Users, Award, FileText } from 'lucide-react';
import { PointsPieChart, TopPodium, StudentBarChart } from '../AdminVisualizations';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-card border border-border hover:border-primary/50 transition-all rounded-[2rem] p-6 relative overflow-hidden group shadow-lg"
  >
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-4 rounded-2xl ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
      </div>
    </div>
    <Icon className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all text-foreground" />
  </motion.div>
);

export default function AdminOverview({ users, submissions, dashboardYear, setDashboardYear, dashboardDept, setDashboardDept, yearOptions, departmentOptions }) {
  
  const filteredUsers = users.filter(u => 
    u.status !== 'inactive' && u.role === 'user' &&
    (dashboardDept === 'All' || u.department === dashboardDept) &&
    (dashboardYear === 'All' || u.yearClassDept === dashboardYear)
  );

  const pendingSubs = submissions.filter(s => 
    s.status === 'pending' &&
    (dashboardDept === 'All' || s.user?.department === dashboardDept) &&
    (dashboardYear === 'All' || s.user?.yearClassDept === dashboardYear)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <div className="flex flex-wrap gap-3">
          <select 
            value={dashboardYear} 
            onChange={e => setDashboardYear(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {yearOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All Years' : opt}</option>
            ))}
          </select>
          <select 
            value={dashboardDept} 
            onChange={e => setDashboardDept(e.target.value)}
             className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {departmentOptions.map(opt => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All Depts' : opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={filteredUsers.length} 
          icon={Users} 
          colorClass="bg-blue-500/10 text-blue-500" 
          delay={0.1} 
        />
        <StatCard 
          title="Points Awarded" 
          value={filteredUsers.reduce((a, b) => a + (b.points || 0), 0)} 
          icon={Award} 
          colorClass="bg-amber-500/10 text-amber-500" 
          delay={0.2} 
        />
        <StatCard 
          title="Pending Submissions" 
          value={pendingSubs.length} 
          icon={FileText} 
          colorClass="bg-pink-500/10 text-pink-500" 
          delay={0.3} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PointsPieChart users={filteredUsers} />
        <StudentBarChart users={filteredUsers} />
        <div className="xl:col-span-2">
          <TopPodium users={filteredUsers} />
        </div>
      </div>
    </div>
  );
}
