import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext({});

const Tabs = ({ defaultValue, className, children }) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ value, setValue }}>
            <div className={cn("", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

const TabsList = ({ className, children }) => {
    return (
        <div className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}>
            {children}
        </div>
    );
};

const TabsTrigger = ({ value, className, children }) => {
    const { value: selectedValue, setValue } = useContext(TabsContext);
    const isSelected = selectedValue === value;

    return (
        <button
            type="button"
            onClick={() => setValue(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground",
                className
            )}
        >
            {children}
        </button>
    );
};

const TabsContent = ({ value, className, children }) => {
    const { value: selectedValue } = useContext(TabsContext); // Fixed: useContext was missing

    if (value !== selectedValue) return null;

    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
