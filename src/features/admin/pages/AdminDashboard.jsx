/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
    Megaphone, Newspaper, LayoutDashboard, Users, BarChart3,
    ShieldCheck, Ban, Clock, Activity, Send, Plus, FileText, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
    fetchAllUsers, toggleBlockUser, postNews, deleteNews,
    sendPushNotification, deleteNotification, fetchAnalytics, logAdminAction, fetchAdminLogs
} from '../services/adminService';
import { getBadge } from '../../../utils/badges';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
    const { user } = useAuth();

    // State
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState({ totalUsers: 0, activeToday: 0, totalOTHours: 0 });
    const [logs, setLogs] = useState([]);
    const [adminNews, setAdminNews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // News Form
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsImage, setNewsImage] = useState('');
    const [newsCategory, setNewsCategory] = useState('Admin Update');
    const [postingNews, setPostingNews] = useState(false);

    // Notification Form
    const [notifTitle, setNotifTitle] = useState('');
    const [notifBody, setNotifBody] = useState('');
    const [notifLink, setNotifLink] = useState('');
    const [sendingNotif, setSendingNotif] = useState(false);

    // Load data
    useEffect(() => {
        loadDashboard();

        // Real-time listener for News
        const qNews = query(collection(db, 'admin_news'), orderBy('createdAt', 'desc'));
        const unsubNews = onSnapshot(qNews, (snapshot) => {
            setAdminNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Real-time listener for Notifications
        const qNotif = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsubNotif = onSnapshot(qNotif, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubNews();
            unsubNotif();
        };
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const allUsers = await fetchAllUsers();
            setUsers(allUsers);
            const stats = await fetchAnalytics(allUsers);
            setAnalytics(stats);
            const recentLogs = await fetchAdminLogs(15);
            setLogs(recentLogs);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleToggleBlock = async (uid, currentlyBlocked, name) => {
        const action = currentlyBlocked ? 'unblock' : 'block';
        if (!confirm(`Are you sure you want to ${action} ${name || uid}?`)) return;
        try {
            const newState = await toggleBlockUser(uid, currentlyBlocked);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, blocked: newState } : u));
            toast.success(`User ${action}ed successfully`);
        } catch (err) {
            toast.error(`Failed to ${action} user`);
        }
    };

    const handlePostNews = async (e) => {
        e.preventDefault();
        if (!newsTitle.trim() || !newsContent.trim()) {
            toast.error('Title and content are required');
            return;
        }
        setPostingNews(true);
        try {
            await postNews({ title: newsTitle, content: newsContent, imageUrl: newsImage, category: newsCategory });
            toast.success('News posted to Smart Feed!');
            setNewsTitle(''); setNewsContent(''); setNewsImage('');
        } catch (err) {
            toast.error('Failed to post news');
        } finally {
            setPostingNews(false);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;
        try {
            await deleteNews(id);
            toast.success('News item deleted');
        } catch (err) {
            toast.error('Failed to delete news');
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifTitle.trim() || !notifBody.trim()) {
            toast.error('Title and body are required');
            return;
        }
        setSendingNotif(true);
        try {
            await sendPushNotification({ title: notifTitle, body: notifBody, actionLink: notifLink });
            toast.success('Notification queued for delivery!');
            setNotifTitle(''); setNotifBody(''); setNotifLink('');
        } catch (err) {
            toast.error('Failed to send notification');
        } finally {
            setSendingNotif(false);
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!confirm('Are you sure you want to delete this notification record?')) return;
        try {
            await deleteNotification(id);
            toast.success('Notification record deleted');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    // Tab config
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'news', label: 'Post News', icon: Newspaper },
        { id: 'notify', label: 'Push Notify', icon: Megaphone },
        { id: 'logs', label: 'Audit Log', icon: FileText },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        Admin Command Center
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Logged in as <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{user?.email}</span>
                    </p>
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Admin
                </Badge>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ─── OVERVIEW TAB ──────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-border">
                            <CardContent className="p-6 text-center">
                                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-4xl font-bold text-foreground">{analytics.totalUsers}</div>
                                <div className="text-sm text-muted-foreground mt-1">Total Users</div>
                            </CardContent>
                        </Card>
                        <Card className="border-border">
                            <CardContent className="p-6 text-center">
                                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-4xl font-bold text-foreground">{analytics.activeToday}</div>
                                <div className="text-sm text-muted-foreground mt-1">Active Today</div>
                            </CardContent>
                        </Card>
                        <Card className="border-border">
                            <CardContent className="p-6 text-center">
                                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                <div className="text-4xl font-bold text-foreground">{analytics.totalOTHours}</div>
                                <div className="text-sm text-muted-foreground mt-1">Total OT Hours</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {tabs.filter(t => t.id !== 'overview').map(tab => (
                            <Button key={tab.id} variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab(tab.id)}>
                                <tab.icon className="w-5 h-5" />
                                <span className="text-xs">{tab.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── USERS TAB ────────────────────────────────── */}
            {activeTab === 'users' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Users className="w-5 h-5" /> Registered Users ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground text-left">
                                        <th className="py-3 px-2 font-semibold">Name</th>
                                        <th className="py-3 px-2 font-semibold hidden sm:table-cell">Ward</th>
                                        <th className="py-3 px-2 font-semibold hidden md:table-cell">Hospital</th>
                                        <th className="py-3 px-2 font-semibold text-center">Referrals</th>
                                        <th className="py-3 px-2 font-semibold text-center">Status</th>
                                        <th className="py-3 px-2 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.uid} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-foreground">{u.name || u.displayName || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground">{u.email || ''}</div>
                                            </td>
                                            <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{u.ward || '—'}</td>
                                            <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{u.hospital || '—'}</td>
                                            <td className="py-3 px-2 text-center">
                                                <Badge variant="secondary">
                                                    {getBadge(u.referralCount)?.emoji || ''} {u.referralCount || 0}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {u.blocked ? (
                                                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Blocked</Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <Button
                                                    variant={u.blocked ? 'outline' : 'destructive'}
                                                    size="sm"
                                                    className="gap-1"
                                                    onClick={() => handleToggleBlock(u.uid, u.blocked, u.name || u.displayName)}
                                                >
                                                    <Ban className="w-3 h-3" />
                                                    {u.blocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="6" className="py-10 text-center text-muted-foreground">No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ─── POST NEWS TAB ────────────────────────────── */}
            {activeTab === 'news' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Newspaper className="w-5 h-5" /> Post New Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePostNews} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="newsTitle">Title</Label>
                                    <Input id="newsTitle" placeholder="News headline..." value={newsTitle}
                                        onChange={(e) => setNewsTitle(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="newsContent">Content</Label>
                                    <textarea id="newsContent" rows={4}
                                        className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Write your update..."
                                        value={newsContent} onChange={(e) => setNewsContent(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="newsImage">Image URL (optional)</Label>
                                        <Input id="newsImage" placeholder="https://..." value={newsImage}
                                            onChange={(e) => setNewsImage(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="newsCategory">Category</Label>
                                        <select id="newsCategory"
                                            className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={newsCategory} onChange={(e) => setNewsCategory(e.target.value)}
                                        >
                                            <option value="Admin Update">Admin Update</option>
                                            <option value="WHO News">WHO News</option>
                                            <option value="Health">Health</option>
                                            <option value="Policy">Policy</option>
                                            <option value="Training">Training</option>
                                        </select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-12 text-base font-bold gap-2" disabled={postingNews}>
                                    {postingNews ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Publish to Smart Feed
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Manage News Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <FileText className="w-5 h-5" /> Manage Content ({adminNews.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {adminNews.length > 0 ? adminNews.map(item => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                        <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                    <Newspaper className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={
                                                    item.source === 'YouTube' ? 'destructive' :
                                                        item.source === 'WHO' ? 'default' : 'secondary'
                                                }>
                                                    {item.source || 'Admin'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.createdAt?.toDate?.()?.toLocaleString() || new Date(item.pubDate).toLocaleString()}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{item.content || item.title}</p>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                                                    {item.isVideo ? 'Watch Video' : 'Read Article'}
                                                </a>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteNews(item.id)}
                                        >
                                            <Ban className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-muted-foreground">No news content found</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ─── PUSH NOTIFICATION TAB ────────────────────── */}
            {activeTab === 'notify' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Megaphone className="w-5 h-5" /> Push Notification Center
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="notifTitle">Notification Title</Label>
                                    <Input id="notifTitle" placeholder="e.g. Important Roster Update" value={notifTitle}
                                        onChange={(e) => setNotifTitle(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notifBody">Message Body</Label>
                                    <textarea id="notifBody" rows={3}
                                        className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Your message to all users..."
                                        value={notifBody} onChange={(e) => setNotifBody(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notifLink">Action Link (optional)</Label>
                                    <Input id="notifLink" placeholder="https://designink-roster.web.app/news" value={notifLink}
                                        onChange={(e) => setNotifLink(e.target.value)} />
                                </div>
                                <Button type="submit" variant="destructive" className="w-full h-12 text-base font-bold gap-2" disabled={sendingNotif}>
                                    {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send to All Users
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Notifications are queued in Firestore for processing by Cloud Functions.
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Notification History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Activity className="w-5 h-5" /> Notification History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                                        <div>
                                            <div className="font-medium text-foreground text-sm">{notif.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{notif.body}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                                                <span>{notif.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</span>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1">{notif.status || 'Sent'}</Badge>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteNotification(notif.id)}
                                        >
                                            <Ban className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-muted-foreground">No notification history</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ─── AUDIT LOG TAB ────────────────────────────── */}
            {activeTab === 'logs' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <FileText className="w-5 h-5" /> Admin Audit Log
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={loadDashboard}>Refresh</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {logs.length > 0 ? logs.map(log => (
                                <div key={log.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                                    <div>
                                        <div className="font-medium text-foreground text-sm">{log.action}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {log.adminEmail} • {log.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                                        </div>
                                        {log.details && (
                                            <div className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2 py-1 rounded">
                                                {JSON.stringify(log.details).substring(0, 100)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-muted-foreground">No admin actions logged yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminDashboard;
