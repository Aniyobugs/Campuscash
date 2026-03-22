import React from 'react';
import { Check, X, Eye, Download, CheckSquare } from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export default function AdminSubmissions({ submissions, handleClearSubmissions, handleApproveSubmission, handleRejectSubmission, handleBulkApproveSubmissions, setSelectedSubmission, baseurl }) {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Review Submissions</h2>
        <div className="flex gap-2 flex-wrap">
          {submissions.filter(s => s.status === 'pending').length > 0 && (
            <button 
              onClick={handleBulkApproveSubmissions}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors"
            >
              <CheckSquare className="w-4 h-4" /> Bulk Approve
            </button>
          )}
          {submissions.length > 0 && (
            <>
              <button 
                onClick={() => downloadCSV(submissions.map(s => ({
                  ID: s._id,
                  Student: `${s.user?.fname || ''} ${s.user?.ename || ''}`,
                  Task: s.task?.title || 'Unknown Task',
                  Type: s.type,
                  Status: s.status,
                  Date: new Date(s.createdAt).toLocaleString()
                })), 'submissions.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button 
                onClick={handleClearSubmissions}
                className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl text-sm font-bold transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Type/Content</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map(s => (
                <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                        {s.user?.profilePic ? (
                          <img src={`${baseurl}${s.user.profilePic}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-primary">{s.user?.fname?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{s.user?.fname} {s.user?.ename}</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">{s.task?.title || "Unknown Task"}</td>
                  <td className="px-6 py-4">
                    {s.type === 'link' && <a href={s.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline max-w-[200px] truncate block">{s.link}</a>}
                    {s.type === 'text' && <p className="text-muted-foreground max-w-[200px] truncate">{s.text}</p>}
                    {s.type === 'file' && <p className="text-emerald-500 font-medium text-xs">📎 File Attachment</p>}
                    {s.type === 'quiz' && <p className="text-purple-500 font-bold text-xs">🎓 Quiz: {s.score}%</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      s.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      s.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {s.task?.category !== 'Quiz' && (
                         <button 
                           onClick={() => setSelectedSubmission(s)}
                           className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                           title="View Details"
                         >
                           <Eye className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         disabled={s.status !== 'pending'}
                         onClick={() => handleApproveSubmission(s)}
                         className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         title="Accept"
                       >
                         <Check className="w-4 h-4" />
                       </button>
                       <button 
                         disabled={s.status !== 'pending'}
                         onClick={() => handleRejectSubmission(s)}
                         className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         title="Reject"
                       >
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No active submissions to review.
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
