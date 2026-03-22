import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminTasks({ tasks, handleCreateTaskClick, handleEditTaskClick, handleDeleteTaskClick, handleClearTasks }) {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Active Tasks</h2>
        <div className="flex items-center gap-3">
          {tasks.length > 0 && (
            <button 
              onClick={handleClearTasks}
              className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl text-sm font-bold transition-colors"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={handleCreateTaskClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity font-bold"
          >
            <Plus className="w-5 h-5" /> New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <div key={task._id} className="bg-card border border-border shadow-md rounded-[2rem] overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {task.category || "General"}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {task.points} pts
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1" title={task.title}>{task.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4" title={task.description}>
                {task.description}
              </p>
              <div className="text-xs font-medium text-muted-foreground">
                Due: <span className="text-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/30">
              <button 
                onClick={() => handleEditTaskClick(task)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors text-sm font-bold"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={() => handleDeleteTaskClick(task)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-bold"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center border-2 border-dashed border-border rounded-[2rem]">
            <p className="text-muted-foreground font-medium">No active tasks. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
