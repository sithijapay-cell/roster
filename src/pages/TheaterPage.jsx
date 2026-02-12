import React from 'react';

const TheaterPage = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">NHSL Theater Statistics</h1>
                    <p className="text-slate-600 mt-2">
                        Manage and analyze theater operation statistics
                    </p>
                </div>

                {/* Theater App Embed */}
                <div className="bg-white dark:bg-[#2d2d2d] rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-[#404040]">
                    <iframe
                        src="/theater/index.html"
                        title="NHSL Theater Statistics"
                        className="w-full bg-white"
                        style={{
                            height: 'calc(100vh - 200px)',
                            minHeight: '600px',
                            border: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    />
                </div>

                {/* Download Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                💻 Desktop App Available
                            </h3>
                            <p className="text-slate-600 text-sm mb-4">
                                The Theater Statistics app is also available as a desktop application for offline use.
                                Contact your administrator for the installation file (NHSL Theater System Setup 1.0.0.exe).
                            </p>
                            <div className="text-sm text-slate-500 bg-white p-3 rounded border">
                                📦 File: NHSL Theater System Setup 1.0.0.exe (97.7 MB)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheaterPage;
