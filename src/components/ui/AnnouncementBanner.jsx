import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { X, Megaphone, ExternalLink } from 'lucide-react';

const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Real-time listener for the latest notification
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                const dismissedId = sessionStorage.getItem('dismissed_announcement');

                // Only show if not already dismissed this session
                if (dismissedId !== doc.id) {
                    setAnnouncement({ id: doc.id, ...data });
                    setDismissed(false);
                }
            } else {
                setAnnouncement(null);
            }
        }, (err) => {
            console.warn('Announcement listener error:', err.message);
        });

        return () => unsubscribe();
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        if (announcement?.id) {
            sessionStorage.setItem('dismissed_announcement', announcement.id);
        }
    };

    if (!announcement || dismissed) return null;

    return (
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/15 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse" />

            <div className="relative flex items-start gap-3 p-4">
                {/* Icon */}
                <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-amber-500/20">
                    <Megaphone className="w-5 h-5 text-amber-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-amber-300 text-sm leading-tight">
                        {announcement.title || 'Announcement'}
                    </h4>
                    <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
                        {announcement.body || ''}
                    </p>
                    {announcement.actionLink && (
                        <a
                            href={announcement.actionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 mt-2 transition-colors"
                        >
                            Open Link <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>

                {/* Dismiss */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/10 transition-all"
                    aria-label="Dismiss announcement"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
