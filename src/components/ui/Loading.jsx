import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/20 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-10 w-10 border-4 border-primary/30 border-t-primary animate-spin"></span>
            </div>
        </div>
    );
};

export default Loading;
