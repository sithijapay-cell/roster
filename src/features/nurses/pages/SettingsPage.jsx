import React, { useState, useEffect, useRef } from 'react';
import DigitalIDCard from '../../dashboard/components/DigitalIDCard';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { updateProfile } from 'firebase/auth'; // Auth profile update
import { doc, updateDoc } from 'firebase/firestore'; // Firestore user update
import { db } from '../../../lib/firebase';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Switch } from '../../../components/ui/Switch'; // Need to create or import Switch
import {
    User,
    Settings,
    Moon,
    Sun,
    LogOut,
    Camera,
    Share2,
    Copy,
    Trophy,
    Save,
    Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBadge } from '../../../utils/badges';
import { toggleDailyReminder, getDailyReminderStatus } from '../../../services/reminderService';

const SettingsPage = () => {
    const { user, logout } = useAuth();
    const { profile, updateProfile: updateProfileData } = useStore(); // specific store update
    const { isDark, toggleTheme } = useTheme();

    // Local State
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
    const [salaryNumber, setSalaryNumber] = useState('');
    const [ward, setWard] = useState('');
    const [hospital, setHospital] = useState('');
    const [basicSalary, setBasicSalary] = useState('');
    const [otRate, setOtRate] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [referralCount, setReferralCount] = useState(0);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setGrade(profile.grade || '');
            setSalaryNumber(profile.salaryNumber || '');
            setWard(profile.ward || '');
            setHospital(profile.hospital || '');
            setBasicSalary(profile.basicSalary || '');
            setOtRate(profile.otRate || '');
            setReferralCount(profile.referralCount || 0);
        } else if (user?.displayName) {
            setName(user.displayName);
        }
        // Load initial reminder status
        setReminderStatus(getDailyReminderStatus());
    }, [profile, user]);

    const [reminderStatus, setReminderStatus] = useState(true);

    const handleReminderToggle = (checked) => {
        setReminderStatus(checked);
        toggleDailyReminder(checked);
        toast.success(checked ? 'Daily reminders enabled' : 'Daily reminders disabled');
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setUploading(true);

        // Cloudinary Upload Logic
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'shiftmaster_preset');
        // formData.append('api_key', '653642148186413'); // Not needed for unsigned, but good for reference if debugging

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dn1nxjczg/image/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await res.json();
            const photoURL = data.secure_url;

            // Update Auth Profile
            await updateProfile(user, { photoURL });

            // Update Firestore Profile via Store
            if (updateProfileData) {
                await updateProfileData({ photoURL });
            }

            toast.success('Profile photo updated via Cloud!');
        } catch (error) {
            console.error("Cloudinary Upload failed", error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            if (updateProfileData) {
                await updateProfileData({
                    name,
                    grade,
                    salaryNumber,
                    ward,
                    hospital,
                    basicSalary,
                    otRate
                });
            }

            // Also update Auth Display Name for consistency
            if (user && name !== user.displayName) {
                await updateProfile(user, { displayName: name });
            }
            toast.success('Profile saved successfully');
        } catch (error) {
            console.error("Save failed", error);
            toast.error('Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const link = `https://designink-roster.web.app/?ref=${user?.uid}`;
        const text = `Join ShiftMaster! Manage your roster and claiming OT easily.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'ShiftMaster Invite',
                    text: text,
                    url: link
                });
            } catch (err) {
                // ignore abort
            }
        } else {
            // Fallback for desktop or unsupported
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`, '_blank');
        }
    };

    const copyToClipboard = () => {
        const link = `https://designink-roster.web.app/?ref=${user?.uid}`;
        navigator.clipboard.writeText(link);
        toast.success("Referral link copied!");
    };

    const badge = getBadge(referralCount);

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">

            <div className="flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            {/* Digital Identity & Badges */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Digital Identity & Badges
                    </h2>
                </div>

                <DigitalIDCard />

                <div className="flex justify-center -mt-4">
                    <p className="text-xs text-muted-foreground text-center max-w-xs">
                        This is your official ShiftMaster Digital ID. Customize your details below to update it instantly.
                    </p>
                </div>
            </section>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Daily Reminders</div>
                        <div className="text-sm text-muted-foreground">Get a shift alert at 8:00 PM</div>
                    </div>
                    <Switch
                        checked={reminderStatus}
                        defaultChecked={reminderStatus}
                        onCheckedChange={handleReminderToggle}
                    />
                </CardContent>
            </Card>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <Avatar className="w-24 h-24 border-4 border-muted">
                                <AvatarImage src={user?.photoURL} />
                                <AvatarFallback className="text-2xl">{name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                        />
                        <p className="text-xs text-muted-foreground">Tap to change photo</p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jones" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Grade / Designation</Label>
                                <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Nursing Officer" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Salary Number</Label>
                                <Input value={salaryNumber} onChange={(e) => setSalaryNumber(e.target.value)} placeholder="e.g. 123456" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Ward / Unit</Label>
                                <Input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. ICU" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Hospital</Label>
                                <Input value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="e.g. NHSL" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Basic Salary</Label>
                                <Input type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} placeholder="e.g. 50000" />
                            </div>
                            <div className="grid gap-2">
                                <Label>OT Rate (per hour)</Label>
                                <Input type="number" value={otRate} onChange={(e) => setOtRate(e.target.value)} placeholder="e.g. 350" />
                            </div>
                        </div>

                        <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                            {loading ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-muted-foreground">Switch between light and dark themes</div>
                    </div>
                    <div
                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}
                        onClick={toggleTheme}
                    >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </CardContent>
            </Card>

            {/* Referral Center */}
            <Card className="border-blue-500/20 bg-blue-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Trophy className="w-5 h-5" />
                        Referral Center
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Referrals</div>
                            <div className="text-2xl font-bold">{referralCount}</div>
                        </div>
                        {badge && (
                            <div className="text-center">
                                <div className="text-2xl">{badge.emoji}</div>
                                <div className="text-xs font-bold text-primary">{badge.label}</div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={copyToClipboard}>
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logout */}
            <div className="pt-4">
                <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 gap-2" onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;
