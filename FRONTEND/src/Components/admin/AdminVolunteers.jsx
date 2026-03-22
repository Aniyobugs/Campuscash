import React from 'react';
import { Check, X, Award } from 'lucide-react';

export default function AdminVolunteers({ volunteers, handleClearVolunteers, handleApproveVolunteer, handleRejectVolunteer, handleOpenAwardForVolunteer }) {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Volunteer Applications</h2>
        {volunteers.length > 0 && (
          <button 
            onClick={handleClearVolunteers}
            className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl text-sm font-bold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {volunteers.map(vol => (
                <tr key={vol._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{vol.name}</p>
                    <p className="text-xs text-muted-foreground">{vol.email}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{vol.studentId}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{vol.department}</td>
                  <td className="px-6 py-4 text-muted-foreground">{vol.year}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={vol.reason}>
                    {vol.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      vol.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      vol.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {vol.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {vol.status === 'pending' && (
                         <>
                           <button 
                             onClick={() => handleApproveVolunteer(vol)}
                             className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
                             title="Approve"
                           >
                             <Check className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleRejectVolunteer(vol)}
                             className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                             title="Reject"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       <button 
                         onClick={() => handleOpenAwardForVolunteer(vol)}
                         className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary hover:bg-primary/10 rounded-lg transition-colors text-xs font-bold ml-2"
                       >
                         <Award className="w-3.5 h-3.5" /> Award
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                    No volunteer applications found.
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
