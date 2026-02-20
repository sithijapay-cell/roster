import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './Button';
import { requestNotificationPermission, getNotificationStatus } from '../../services/notificationService';

const NotificationPrompt = () => {
    const [visible, setVisible] = useState(false);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        // Only show if permission not yet decided and not previously dismissed
        const status = getNotificationStatus();
        const dismissed = sessionStorage.getItem('notif_prompt_dismissed');
        if (status === 'default' && !dismissed) {
            // Delay showing the prompt so it doesn't block first render
            const timer = setTimeout(() => setVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleEnable = async () => {
        setRequesting(true);
        const result = await requestNotificationPermission();
        setRequesting(false);
        setVisible(false);
        if (result === 'granted') {
            sessionStorage.setItem('notif_prompt_dismissed', 'true');
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem('notif_prompt_dismissed', 'true');
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[100] animate-in slide-in-from-bottom duration-500">
            <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 p-5 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 p-2.5 rounded-xl bg-blue-500/15">
                        <Bell className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-sm">Stay Updated</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Enable notifications to get real-time alerts for Roster changes and Ward News.
                        </p>
                    </div>
                    <button onClick={handleDismiss} className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDismiss} variant="ghost" size="sm" className="flex-1 text-xs">
                        Not Now
                    </Button>
                    <Button onClick={handleEnable} size="sm" className="flex-1 text-xs font-bold gap-1.5" disabled={requesting}>
                        <Bell className="w-3.5 h-3.5" />
                        {requesting ? 'Enabling...' : 'Enable Notifications'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPrompt;
