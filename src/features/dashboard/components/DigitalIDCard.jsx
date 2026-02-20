
import React, { useRef, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { getBadge } from '../../../utils/badges';
import { Download, ShieldCheck, Award, Star, Crown } from 'lucide-react';
import html2canvas from 'html2canvas';

const DigitalIDCard = () => {
    const { user } = useAuth();
    const { profile } = useStore();
    const cardRef = useRef(null);
    const [downloading, setDownloading] = useState(false);

    // Get Badge based on referrals
    const referralCount = profile?.referralCount || 0;
    const badge = getBadge(referralCount);

    // Badge Icon Mapping to Lucide for "Vector" look
    const getBadgeIcon = (label) => {
        switch (label) {
            case 'PLATINUM': return <Crown className="w-5 h-5 text-indigo-200 fill-indigo-500 animate-pulse" />;
            case 'GOLD': return <Star className="w-5 h-5 text-yellow-200 fill-yellow-500" />;
            case 'SILVER': return <Award className="w-5 h-5 text-slate-300 fill-slate-500" />;
            case 'BRONZE': return <ShieldCheck className="w-5 h-5 text-amber-700 fill-amber-600" />;
            default: return null;
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3, // High quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `NurseID_${profile?.name || 'User'}.png`;
            link.click();
        } catch (err) {
            console.error("ID Card Generation Failed", err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-xs mx-auto my-6 relative group">
            <div
                ref={cardRef}
                className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-900 via-[#0f172a] to-blue-950 text-white shadow-2xl transition-transform hover:scale-[1.01] duration-500 border border-white/10 flex flex-col items-center pt-8 pb-6 px-6"
                style={{ aspectRatio: '0.65 / 1', boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
                {/* Background Details */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                {/* Header Logo */}
                <div className="flex flex-col items-center gap-2 mb-6 z-10">
                    <img src="/shiftmasterlogo.png" alt="Logo" className="h-8 w-auto opacity-90 drop-shadow-lg" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-[10px] tracking-[0.3em] font-medium text-blue-200/80 uppercase">Official Identity</span>
                </div>

                {/* Photo Ring */}
                <div className="relative z-10 mb-5">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-400 via-cyan-300 to-blue-600 shadow-xl shadow-blue-900/50">
                        <div className="w-full h-full rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                            {profile?.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                                    {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Verification Check */}
                    <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-4 border-slate-900 shadow-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* User Details */}
                <div className="z-10 text-center w-full space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">{profile?.name || 'Nurse Name'}</h2>
                    <p className="text-sm font-medium text-blue-300 uppercase tracking-wider">{profile?.grade || 'Nursing Officer'}</p>
                </div>

                {/* Divider */}
                <div className="w-12 h-0.5 bg-blue-500/30 my-5 rounded-full z-10" />

                {/* Info Grid */}
                <div className="w-full space-y-3 z-10 text-sm">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 font-light text-xs uppercase tracking-wide">ID No.</span>
                        <span className="font-mono text-white/90">{profile?.salaryNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Ward</span>
                        <span className="font-medium text-white/90">{profile?.ward || 'General'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400 font-light text-xs uppercase tracking-wide">Hospital</span>
                        <span className="font-medium text-white/90 truncate max-w-[150px] text-right">{profile?.hospital || 'NHSL'}</span>
                    </div>
                </div>

                {/* Badge Section */}
                {badge && (
                    <div className="mt-auto pt-6 z-10">
                        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-blue-500/20 shadow-inner backdrop-blur-sm">
                            <div className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                {getBadgeIcon(badge.label)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">{badge.label} Member</span>
                        </div>
                    </div>
                )}

                {/* Download Button (Hidden on Export) */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5 no-export"
                    title="Download ID"
                    data-html2canvas-ignore="true"
                >
                    {downloading ? (
                        <div className="w-4 h-4 animate-spin border-2 border-white/50 border-t-white rounded-full" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default DigitalIDCard;
