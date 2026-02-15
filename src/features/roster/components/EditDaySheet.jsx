import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { X, Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../../components/ui/Sheet';
import { Badge } from '../../../components/ui/Badge';
import { SHIFT_TYPES, DAY_TYPES, validateShiftAddition } from '../../../utils/validation';
import { useStore } from '../../../context/StoreContext';
import { cn } from '../../../lib/utils';

const EditDaySheet = ({ isOpen, onClose, date, currentData }) => {
    const { addShift, shifts, removeShift } = useStore();
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [error, setError] = useState(null);

    const [customEndTimes, setCustomEndTimes] = useState({});
    const [customStartTimes, setCustomStartTimes] = useState({}); // New Start Time State

    useEffect(() => {
        if (isOpen && currentData) {
            setSelectedShifts(currentData.shifts || []);
            setSelectedType(currentData.type || null);
            setCustomEndTimes(currentData.customEndTimes || {});
            setCustomStartTimes(currentData.customStartTimes || {}); // Load saved start times
        } else {
            setSelectedShifts([]);
            setSelectedType(null);
            setCustomEndTimes({});
            setCustomStartTimes({});
        }
        setError(null);
    }, [isOpen, currentData, date]);

    if (!date) return null;

    const dateStr = format(date, 'yyyy-MM-dd');

    const handleShiftToggle = (code) => {
        setError(null);
        let newShifts = [...selectedShifts];

        if (newShifts.includes(code)) {
            newShifts = newShifts.filter(s => s !== code);
        } else {
            // Validation Logic
            if (selectedType === 'CL') {
                setError("Cannot add shifts on Casual Leave.");
                return;
            }

            const isNight = ['DN', 'OTN'].includes(code);
            if (isNight && (newShifts.includes('DN') || newShifts.includes('OTN'))) {
                setError("Cannot have multiple night shifts.");
                return;
            }

            const validResult = validateShiftAddition(dateStr, code, newShifts, shifts);
            if (!validResult.valid) {
                setError(validResult.message);
                return;
            }

            newShifts.push(code);
        }
        setSelectedShifts(newShifts);

        // Clean up custom times if shift removed
        if (!newShifts.includes(code)) {
            const newEndTimes = { ...customEndTimes };
            delete newEndTimes[code];
            setCustomEndTimes(newEndTimes);

            const newStartTimes = { ...customStartTimes };
            delete newStartTimes[code];
            setCustomStartTimes(newStartTimes);
        }
    };

    const handleTypeToggle = (code) => {
        setError(null);
        if (selectedType === code) {
            setSelectedType(null);
        } else {
            if (code === 'CL' && selectedShifts.length > 0) {
                setError("Cannot set Casual Leave if shifts are logged.");
                return;
            }
            setSelectedType(code);
        }
    };

    const handleSave = () => {
        if (selectedShifts.length === 0 && !selectedType) {
            removeShift(dateStr);
        } else {
            addShift(dateStr, {
                shifts: selectedShifts,
                type: selectedType,
                customEndTimes: customEndTimes, // Save custom end times
                customStartTimes: customStartTimes // Save custom start times
            });
        }
        onClose();
    };

    const handleCopyPrevious = () => {
        const prevDay = subDays(date, 1);
        const prevKey = format(prevDay, 'yyyy-MM-dd');
        const prevData = shifts[prevKey];
        if (prevData) {
            setSelectedShifts(prevData.shifts || []);
            setSelectedType(prevData.type || null);
        } else {
            setError("No data found for previous day.");
        }
    };

    const handleClear = () => {
        setSelectedShifts([]);
        setSelectedType(null);
    };

    const handleOpenChange = (open) => {
        if (!open) onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            {/* side="bottom" for mobile drawer feel, or "right" for desktop context panel */}
            <SheetContent side="bottom" className="h-[85vh] sm:max-w-none sm:mx-auto sm:w-full md:w-[400px] md:h-full md:side-right md:inset-y-0 md:left-auto md:right-0 md:rounded-l-xl md:rounded-tr-none rounded-t-[20px] px-6 py-6 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-bold">{format(date, 'EEEE')}</SheetTitle>
                    <SheetDescription className="text-base font-medium text-slate-500">
                        {format(date, 'MMMM do, yyyy')}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 pb-40">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg font-medium border border-destructive/20 flex items-center gap-2">
                            <X className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Duty Shifts */}
                    <section>
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Select Shift</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(SHIFT_TYPES).map(shift => (
                                <button
                                    key={shift.code}
                                    onClick={() => handleShiftToggle(shift.code)}
                                    className={cn(
                                        "h-16 rounded-xl border flex flex-col items-center justify-center transition-all",
                                        selectedShifts.includes(shift.code)
                                            ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                                            : "border-input bg-card hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <span className="text-lg font-black">{shift.code}</span>
                                    <span className="text-[10px] font-semibold uppercase opacity-70">{shift.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Partial OT Section */}
                    {(selectedShifts.includes('OTM') || selectedShifts.includes('OTE')) && (
                        <section className="bg-muted/30 p-4 rounded-xl border border-dashed">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Flexible OT Hours</label>
                            <div className="space-y-6">
                                {selectedShifts.includes('OTM') && (
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold uppercase text-primary border-b pb-1">Morning OT (Standard: 07H - 13H)</div>

                                        {/* OTM Start */}
                                        <div>
                                            <div className="text-[10px] font-medium mb-1.5 flex justify-between">
                                                <span>Start Time</span>
                                                <Badge variant="outline" className="h-5 bg-background font-mono">{customStartTimes['OTM'] || '07H'}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                {['07H', '08H', '09H', '10H'].map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setCustomStartTimes(prev => ({ ...prev, 'OTM': time === '07H' ? null : time }))}
                                                        className={cn(
                                                            "flex-1 h-8 rounded-md text-[10px] font-bold border transition-all",
                                                            (customStartTimes['OTM'] === time || (!customStartTimes['OTM'] && time === '07H'))
                                                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                                : "bg-background hover:bg-muted"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* OTM End */}
                                        <div>
                                            <div className="text-[10px] font-medium mb-1.5 flex justify-between">
                                                <span>End Time</span>
                                                <Badge variant="outline" className="h-5 bg-background font-mono">{customEndTimes['OTM'] || '13H'}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                {['10H', '11H', '12H', '13H'].map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setCustomEndTimes(prev => ({ ...prev, 'OTM': time === '13H' ? null : time }))}
                                                        className={cn(
                                                            "flex-1 h-8 rounded-md text-[10px] font-bold border transition-all",
                                                            (customEndTimes['OTM'] === time || (!customEndTimes['OTM'] && time === '13H'))
                                                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                : "bg-background hover:bg-muted"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedShifts.includes('OTE') && (
                                    <div className="space-y-3">
                                        <div className="text-xs font-semibold uppercase text-primary border-b pb-1">Evening OT (Standard: 13H - 19H)</div>

                                        {/* OTE Start */}
                                        <div>
                                            <div className="text-[10px] font-medium mb-1.5 flex justify-between">
                                                <span>Start Time</span>
                                                <Badge variant="outline" className="h-5 bg-background font-mono">{customStartTimes['OTE'] || '13H'}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                {['13H', '14H', '15H', '16H'].map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setCustomStartTimes(prev => ({ ...prev, 'OTE': time === '13H' ? null : time }))}
                                                        className={cn(
                                                            "flex-1 h-8 rounded-md text-[10px] font-bold border transition-all",
                                                            (customStartTimes['OTE'] === time || (!customStartTimes['OTE'] && time === '13H'))
                                                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                                : "bg-background hover:bg-muted"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* OTE End */}
                                        <div>
                                            <div className="text-[10px] font-medium mb-1.5 flex justify-between">
                                                <span>End Time</span>
                                                <Badge variant="outline" className="h-5 bg-background font-mono">{customEndTimes['OTE'] || '19H'}</Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                {['16H', '17H', '18H', '19H'].map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setCustomEndTimes(prev => ({ ...prev, 'OTE': time === '19H' ? null : time }))}
                                                        className={cn(
                                                            "flex-1 h-8 rounded-md text-[10px] font-bold border transition-all",
                                                            (customEndTimes['OTE'] === time || (!customEndTimes['OTE'] && time === '19H'))
                                                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                : "bg-background hover:bg-muted"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Special Types */}
                    <section>
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(DAY_TYPES).map(type => (
                                <button
                                    key={type.code}
                                    onClick={() => handleTypeToggle(type.code)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border text-sm font-bold transition-all flex items-center gap-2",
                                        selectedType === type.code
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                            : "border-input bg-card hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {type.label}
                                    {selectedType === type.code && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-background/95 backdrop-blur border-t gap-3 sm:flex-col">
                    <div className="flex gap-3 w-full mb-3 sm:mb-0">
                        <Button variant="outline" className="flex-1 gap-2" onClick={handleCopyPrevious}>
                            <Copy className="w-4 h-4" /> Copy Prev
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 hover:bg-destructive/10 hover:text-destructive" onClick={handleClear}>
                            <Trash2 className="w-4 h-4" /> Clear
                        </Button>
                    </div>
                    <Button onClick={handleSave} className="w-full text-lg font-bold h-12 shadow-lg">
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default EditDaySheet;
