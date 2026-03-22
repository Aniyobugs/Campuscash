import React from 'react';
import { Store, QrCode, Search, Tag } from 'lucide-react';

export default function AdminStore() {
  // Placeholder data for store vouchers
  const vouchers = [
    { id: 'VCH-1001', student: 'Anandhu Krishna', type: 'Canteen Meals', amount: 50, status: 'unused', date: '2026-03-22' },
    { id: 'VCH-1002', student: 'John Doe', type: 'Library Print Pass', amount: 20, status: 'redeemed', date: '2026-03-21' },
    { id: 'VCH-1003', student: 'Sarah Smith', type: 'Stationery Kit', amount: 150, status: 'unused', date: '2026-03-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Store className="w-6 h-6 text-purple-500" /> Store Vouchers
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <input type="text" placeholder="Search Voucher ID..." className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20 font-bold hover:opacity-90 flex items-center gap-2">
             <QrCode className="w-4 h-4"/> Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-2">Active Vouchers</p>
          <h3 className="text-3xl font-black text-purple-500">2</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-2">Total Redeemed (This Month)</p>
          <h3 className="text-3xl font-black text-emerald-500">1</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-2">Points Exchanged</p>
          <h3 className="text-3xl font-black text-amber-500">220 pts</h3>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
           <h3 className="text-lg font-bold flex items-center gap-2"><Tag className="w-5 h-5"/> Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-6 py-4">Voucher ID</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Item Type</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vouchers.map(v => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{v.id}</td>
                  <td className="px-6 py-4 font-bold">{v.student}</td>
                  <td className="px-6 py-4 text-muted-foreground">{v.type}</td>
                  <td className="px-6 py-4 font-bold text-amber-500">{v.amount} pts</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      v.status === 'unused' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">{v.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
