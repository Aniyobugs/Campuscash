import React from 'react';
import { Edit, UserX, UserCheck, Search, Download } from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';
import { motion } from 'framer-motion';

export default function AdminStudents({ 
  users, search, setSearch, selectedDept, setSelectedDept, selectedRealDept, setSelectedRealDept,
  yearOptions, departmentOptions, handleEditUserClick, handleToggleStatus, deptShortForms, baseurl 
}) {
  
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fname?.toLowerCase() || "").includes(search.toLowerCase()) || 
                          (u.studentId?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesYear = selectedDept === "All" || u.yearClassDept === selectedDept;
    const matchesDept = selectedRealDept === "All" || u.department === selectedRealDept;
    const isStudent = u.role === 'user';
    return matchesSearch && matchesYear && matchesDept && isStudent;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Manage Students</h2>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <select 
            value={selectedRealDept} 
            onChange={e => setSelectedRealDept(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {departmentOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Depts' : opt}</option>)}
          </select>
          <select 
            value={selectedDept} 
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            {yearOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button 
            onClick={() => downloadCSV(filteredUsers.map(u => ({
              ID: u.studentId,
              Name: `${u.fname || ''} ${u.ename || ''}`,
              Email: u.ename,
              Department: u.department,
              Year: u.yearClassDept,
              Points: u.points,
              Status: u.status
            })), 'students.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.slice(0, 50).map(user => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                        {user.profilePic ? (
                          <img src={`${baseurl}${user.profilePic}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-primary">{user.fname[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.fname}</p>
                        <p className="text-xs text-muted-foreground">{user.ename}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">{deptShortForms[user.department] || user.department || "-"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.yearClassDept || "-"}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{user.studentId}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {user.points} pts
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditUserClick(user)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active' ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
