import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IosInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // Detect if already in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        // Show prompt only on iOS and not installed
        if (isIOS && !isStandalone) {
            // Check if previously dismissed (optional, for now show always or session based)
            // const hasDismissed = localStorage.getItem('iosInstallPromptDismissed');
            // if (!hasDismissed) {
            // Small delay for better UX
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
            // }
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        // localStorage.setItem('iosInstallPromptDismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:hidden print:hidden"
                >
                    <div className="bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-2xl p-4 pr-10 relative">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <img src="/pwa-192x192.png" alt="App Icon" className="w-10 h-10 rounded-lg shadow-sm" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1">Install ShiftMaster</h3>
                                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                    Install this app on your iPhone for a better experience.
                                </p>

                                <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                                    <span>1. Tap</span>
                                    <Share size={16} className="text-blue-500" />
                                    <span>Share</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 mt-1">
                                    <span>2. Select</span>
                                    <span className="bg-muted px-1.5 py-0.5 rounded border border-border">Add to Home Screen</span>
                                </div>
                            </div>
                        </div>

                        {/* Pointer arrow to the bottom center (where share button usually is on Safari) */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border transform rotate-45"></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IosInstallPrompt;
