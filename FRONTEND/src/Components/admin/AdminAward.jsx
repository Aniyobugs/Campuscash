import React, { useState } from 'react';
import { Award, Zap } from 'lucide-react';

export default function AdminAward({ users, awardData, setAwardData, handleAward, baseurl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const studentUsers = users.filter(u => u.role === 'user');
  
  const filteredStudents = studentUsers.filter(u => 
    (u.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find(u => u._id === awardData.studentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center mt-8 mb-12">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
          <Award className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-4xl font-black text-foreground mb-2">Award Points</h2>
        <p className="text-muted-foreground text-lg">Recognize student achievements instantly</p>
      </div>

      <div className="max-w-2xl mx-auto bg-card border border-border shadow-xl rounded-[2rem] p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
        
        <div className="space-y-6 relative z-10">
          <div className="relative">
            <label className="text-sm font-bold text-foreground mb-2 block">Select Student</label>
            <div 
              className="bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/10">
                    {selectedUser.profilePic ? <img src={`${baseurl}${selectedUser.profilePic}`} alt="" className="w-full h-full object-cover" /> : <div className="text-xs font-bold w-full h-full flex items-center justify-center text-primary">{selectedUser.fname[0]}</div>}
                  </div>
                  <span className="font-bold">{selectedUser.fname}</span>
                  <span className="text-xs text-muted-foreground ml-2">ID: {selectedUser.studentId}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Search for a student...</span>
              )}
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border shadow-xl rounded-xl z-50 max-h-64 overflow-y-auto">
                <input 
                  type="text" 
                  placeholder="Type a name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-background border-b border-border px-4 py-3 text-sm outline-none sticky top-0"
                  onClick={e => e.stopPropagation()}
                />
                <div className="py-2">
                  {filteredStudents.map(u => (
                    <div 
                      key={u._id}
                      onClick={() => { setAwardData({...awardData, studentId: u._id}); setShowDropdown(false); setSearchTerm(''); }}
                      className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                        {u.profilePic ? <img src={`${baseurl}${u.profilePic}`} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-primary text-xs">{u.fname[0]}</span>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{u.fname} {u.ename}</p>
                        <p className="text-xs text-muted-foreground">{u.department} • {u.studentId}</p>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground text-center">No students found</div>}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Points Amount</label>
            <input 
              type="number"
              value={awardData.points}
              onChange={e => setAwardData({...awardData, points: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground text-lg font-bold"
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-2 block">Reason / Note</label>
            <textarea 
              rows={3}
              value={awardData.reason}
              onChange={e => setAwardData({...awardData, reason: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="e.g. Winner of coding competition"
            />
          </div>

          <button 
            onClick={handleAward}
            className="w-full py-4 mt-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-xl shadow-amber-500/20 hover:opacity-90 font-black flex items-center justify-center gap-2 transition-opacity"
          >
            <Zap className="w-5 h-5 fill-white" /> Send Points
          </button>
        </div>
      </div>
    </div>
  );
}
