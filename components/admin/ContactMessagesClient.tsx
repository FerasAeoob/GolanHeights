"use client";

import { useState, useEffect } from "react";
import { 
    Search, Filter, Inbox, MailOpen, Archive, FileText, 
    X, Check, Mail, MessageSquare, Copy, Edit3, Trash2
} from "lucide-react";

interface Message {
    _id: string;
    name: string;
    email: string;
    subject: string;
    reason: string;
    message: string;
    status: "new" | "read" | "archived";
    adminNote?: string;
    createdAt: string;
}

export default function ContactMessagesClient() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [reasonFilter, setReasonFilter] = useState("all");
    const [search, setSearch] = useState("");
    
    // UI State
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [noteInput, setNoteInput] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [stats, setStats] = useState({ total: 0, new: 0, read: 0, archived: 0 });

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                status: statusFilter,
                reason: reasonFilter,
                search: search
            });
            const res = await fetch(`/api/admin/contact-messages?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.data);
                setTotal(data.pagination.total);
                setPages(data.pagination.pages);
                
                // If it's the first unfiltered load, we can set stats based on some logic 
                // Wait, stats need a separate endpoint or we just count from total.
                // For simplicity, we just show "Total matching filters" if we don't have a stats endpoint.
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [page, statusFilter, reasonFilter]); // refetch on filter change except search (search needs submit)

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchMessages();
    };

    const handleOpenDetail = async (msg: Message) => {
        setSelectedMsg(msg);
        setNoteInput(msg.adminNote || "");
        setIsDetailOpen(true);
        
        if (msg.status === "new") {
            // Auto mark as read
            await handleUpdateStatus(msg._id, "read");
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/contact-messages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => prev.map(m => m._id === id ? { ...m, status: data.data.status } : m));
                if (selectedMsg && selectedMsg._id === id) {
                    setSelectedMsg(data.data);
                }
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedMsg) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/contact-messages/${selectedMsg._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminNote: noteInput })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => prev.map(m => m._id === selectedMsg._id ? { ...m, adminNote: data.data.adminNote } : m));
                setSelectedMsg(data.data);
                alert("Note saved!");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm("Are you sure you want to archive this message?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m._id !== id));
                setIsDetailOpen(false);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: "bg-blue-100 text-blue-700 border-blue-200",
            read: "bg-slate-100 text-slate-700 border-slate-200",
            archived: "bg-orange-100 text-orange-700 border-orange-200"
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.read}`}>
                {status}
            </span>
        );
    };

    const getReasonBadge = (reason: string) => {
        const styles: Record<string, string> = {
            general: "bg-slate-100 text-slate-600",
            add: "bg-emerald-100 text-emerald-700",
            update: "bg-amber-100 text-amber-700",
            report: "bg-red-100 text-red-700",
            partnership: "bg-purple-100 text-purple-700"
        };
        return (
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[reason] || styles.general}`}>
                {reason}
            </span>
        );
    };

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name, email, subject, message..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                    </select>
                    <select
                        value={reasonFilter}
                        onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
                        className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Reasons</option>
                        <option value="general">General</option>
                        <option value="add">Add Place</option>
                        <option value="update">Update Place</option>
                        <option value="report">Report Issue</option>
                        <option value="partnership">Partnership</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            {/* List/Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mb-4" />
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        No messages found matching your criteria.
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="hidden md:table w-full text-left border-collapse">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold text-sm">Sender</th>
                                    <th className="p-4 font-semibold text-sm">Subject</th>
                                    <th className="p-4 font-semibold text-sm">Reason</th>
                                    <th className="p-4 font-semibold text-sm text-center">Status</th>
                                    <th className="p-4 font-semibold text-sm">Date</th>
                                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {messages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleOpenDetail(msg)}>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-900">{msg.name}</div>
                                            <div className="text-xs text-slate-500">{msg.email}</div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <div className="font-medium text-slate-900 truncate">{msg.subject}</div>
                                            <div className="text-xs text-slate-500 truncate">{msg.message}</div>
                                        </td>
                                        <td className="p-4">
                                            {getReasonBadge(msg.reason)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {getStatusBadge(msg.status)}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenDetail(msg); }}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded-lg"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="md:hidden flex flex-col divide-y divide-slate-100">
                            {messages.map((msg) => (
                                <div key={msg._id} className="p-4 flex flex-col gap-3" onClick={() => handleOpenDetail(msg)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-slate-900">{msg.name}</div>
                                            <div className="text-xs text-slate-500">{msg.email}</div>
                                        </div>
                                        {getStatusBadge(msg.status)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-slate-800">{msg.subject}</div>
                                        <div className="text-sm text-slate-500 line-clamp-2 mt-1">{msg.message}</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        {getReasonBadge(msg.reason)}
                                        <div className="text-xs text-slate-400">
                                            {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium bg-white disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-500">
                                    Page {page} of {pages}
                                </span>
                                <button 
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium bg-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {isDetailOpen && selectedMsg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-900">Message Details</h3>
                                {getStatusBadge(selectedMsg.status)}
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                            {/* Sender Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sender</p>
                                    <p className="font-medium text-slate-900">{selectedMsg.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <a href={`mailto:${selectedMsg.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {selectedMsg.email}
                                        </a>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(selectedMsg.email)}
                                            className="text-slate-400 hover:text-slate-600 p-1"
                                            title="Copy email"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-medium text-slate-900">{new Date(selectedMsg.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
                                    <div className="mt-2">{getReasonBadge(selectedMsg.reason)}</div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{selectedMsg.subject}</h4>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl whitespace-pre-wrap text-slate-700 leading-relaxed">
                                    {selectedMsg.message}
                                </div>
                            </div>

                            {/* Admin Note */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Edit3 className="h-4 w-4 text-slate-500" />
                                    <h4 className="font-bold text-slate-900">Admin Note</h4>
                                </div>
                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Add internal notes about this message..."
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y bg-slate-50 focus:bg-white transition-colors"
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={actionLoading}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-3">
                            <div className="flex gap-2">
                                {selectedMsg.status !== "read" && (
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedMsg._id, "read")}
                                        disabled={actionLoading}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                    >
                                        <MailOpen className="h-4 w-4" /> Mark Read
                                    </button>
                                )}
                                {selectedMsg.status !== "archived" && (
                                    <button 
                                        onClick={() => handleArchive(selectedMsg._id)}
                                        disabled={actionLoading}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors"
                                    >
                                        <Archive className="h-4 w-4" /> Archive
                                    </button>
                                )}
                            </div>
                            <a 
                                href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" /> Reply
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
