import React from 'react';
import { MailOpen, Download } from 'lucide-react';
import { downloadCSV } from '../../utils/exportUtils';

export default function AdminMessages({ messages, handleClearMessages, setSelectedMessage }) {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <>
              <button 
                onClick={() => downloadCSV(messages.map(m => ({
                  Date: new Date(m.createdAt).toLocaleString(),
                  Name: `${m.firstName} ${m.lastName}`,
                  Email: m.email,
                  Message: m.message
                })), 'messages.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl text-sm font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button 
                onClick={handleClearMessages}
                className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl text-sm font-bold transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map(msg => (
          <div key={msg._id} className="bg-card border border-border shadow-md rounded-[2rem] overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
                <MailOpen className="w-5 h-5 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight mb-1">{msg.firstName} {msg.lastName}</h3>
              <p className="text-xs text-primary mb-4">{msg.email}</p>
              <div className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                {msg.message}
              </div>
            </div>
            <div className="p-4 border-t border-border flex bg-muted/30">
              <button 
                onClick={() => setSelectedMessage(msg)}
                className="w-full flex items-center justify-center gap-2 py-2 text-foreground bg-background border border-border hover:bg-muted rounded-xl transition-colors text-sm font-bold shadow-sm"
              >
                Read Message
              </button>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center border-2 border-dashed border-border rounded-[2rem]">
            <p className="text-muted-foreground font-medium">No messages yet. Inbox Zero! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
