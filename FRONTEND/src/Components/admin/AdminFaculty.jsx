import React from 'react';
import { Edit, UserX, UserCheck } from 'lucide-react';

export default function AdminFaculty({ users, handleEditUserClick, handleToggleStatus, baseurl }) {
  const facultyUsers = users.filter(u => ['admin', 'faculty', 'store'].includes(u.role));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Faculty & Store</h2>
      
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {facultyUsers.map(user => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                        {user.profilePic ? (
                          <img src={`${baseurl}${user.profilePic}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-primary">{user.fname?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.fname} {user.ename}</p>
                        <p className="text-xs text-muted-foreground">{user.ename}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.department || user.yearClassDept || "-"}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                       user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                       user.role === 'store' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                       'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                     }`}>
                       {user.role}
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
                        title="Edit User"
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
              {facultyUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No faculty or store managers found.
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
