/* eslint-disable */
/* eslint-disable */
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
            // Normalize incoming data
            let incomingShifts = [];
            let incomingType = null;

            if (typeof currentData === 'string') {
                incomingShifts = [currentData];
            } else {
                if (Array.isArray(currentData.shifts)) {
                    incomingShifts = currentData.shifts;
                } else if (typeof currentData.shifts === 'string') {
                    incomingShifts = [currentData.shifts];
                }
                incomingType = currentData.type || null;
            }

            setSelectedShifts(incomingShifts);
            setSelectedType(incomingType);
            setCustomEndTimes(currentData.customEndTimes || {});
            setCustomStartTimes(currentData.customStartTimes || {});
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
            if (selectedType === 'CL' || selectedType === 'PH_LEAVE') {
                setError("Cannot add shifts on a Leave day.");
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
            if ((code === 'CL' || code === 'PH_LEAVE') && selectedShifts.length > 0) {
                setError("Cannot set a Leave type if shifts are logged.");
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
            <SheetContent side="bottom" className="max-h-[85dvh] sm:max-w-none sm:mx-auto sm:w-full md:w-[400px] md:h-full md:side-right md:inset-y-0 md:left-auto md:right-0 md:rounded-l-xl md:rounded-tr-none rounded-t-[20px] px-4 py-4 overflow-y-auto flex flex-col">
                <SheetHeader className="mb-4 flex-shrink-0">
                    <SheetTitle className="text-xl font-bold">{format(date, 'EEEE')}</SheetTitle>
                    <SheetDescription className="text-sm font-medium text-slate-500">
                        {format(date, 'MMMM do, yyyy')}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 pb-28 flex-1 overflow-y-auto">
                    {error && (
                        <div className="p-2 bg-destructive/10 text-destructive text-xs rounded-lg font-medium border border-destructive/20 flex items-center gap-2">
                            <X className="w-3 h-3" /> {error}
                        </div>
                    )}

                    {/* Duty Shifts */}
                    <section>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Select Shift</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(SHIFT_TYPES).map(shift => (
                                <button
                                    key={shift.code}
                                    onClick={() => handleShiftToggle(shift.code)}
                                    className={cn(
                                        "h-12 rounded-lg border flex flex-col items-center justify-center transition-all",
                                        selectedShifts.includes(shift.code)
                                            ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                                            : "border-input bg-card hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <span className="text-base font-black leading-none">{shift.code}</span>
                                    <span className="text-[9px] font-semibold uppercase opacity-70 mt-0.5">{shift.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Partial OT Section */}
                    {(selectedShifts.includes('OTM') || selectedShifts.includes('OTE')) && (
                        <section className="bg-muted/30 p-3 rounded-lg border border-dashed text-xs">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Flexible OT Hours</label>
                            <div className="space-y-3">
                                {selectedShifts.includes('OTM') && (
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-semibold uppercase text-primary border-b pb-0.5 flex justify-between items-center">
                                            Morning OT (07H-13H)
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="h-4 px-1 text-[9px] bg-background font-mono">{customStartTimes['OTM'] || '07H'}</Badge>
                                                <span className="text-muted-foreground">-</span>
                                                <Badge variant="outline" className="h-4 px-1 text-[9px] bg-background font-mono">{customEndTimes['OTM'] || '13H'}</Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Start */}
                                            <div>
                                                <span className="text-[9px] text-muted-foreground block mb-1">Start</span>
                                                <div className="flex gap-1">
                                                    {['07H', '08H', '09H', '10H'].map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setCustomStartTimes(prev => ({ ...prev, 'OTM': time === '07H' ? null : time }))}
                                                            className={cn(
                                                                "flex-1 h-6 rounded text-[9px] font-bold border transition-all",
                                                                (customStartTimes['OTM'] === time || (!customStartTimes['OTM'] && time === '07H'))
                                                                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                                    : "bg-background hover:bg-muted"
                                                            )}
                                                        >
                                                            {time.replace('H', '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* End */}
                                            <div>
                                                <span className="text-[9px] text-muted-foreground block mb-1">End</span>
                                                <div className="flex gap-1">
                                                    {['10H', '11H', '12H', '13H'].map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setCustomEndTimes(prev => ({ ...prev, 'OTM': time === '13H' ? null : time }))}
                                                            className={cn(
                                                                "flex-1 h-6 rounded text-[9px] font-bold border transition-all",
                                                                (customEndTimes['OTM'] === time || (!customEndTimes['OTM'] && time === '13H'))
                                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                    : "bg-background hover:bg-muted"
                                                            )}
                                                        >
                                                            {time.replace('H', '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedShifts.includes('OTE') && (
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-semibold uppercase text-primary border-b pb-0.5 flex justify-between items-center">
                                            Evening OT (13H-19H)
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="h-4 px-1 text-[9px] bg-background font-mono">{customStartTimes['OTE'] || '13H'}</Badge>
                                                <span className="text-muted-foreground">-</span>
                                                <Badge variant="outline" className="h-4 px-1 text-[9px] bg-background font-mono">{customEndTimes['OTE'] || '19H'}</Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Start */}
                                            <div>
                                                <span className="text-[9px] text-muted-foreground block mb-1">Start</span>
                                                <div className="flex gap-1">
                                                    {['13H', '14H', '15H', '16H'].map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setCustomStartTimes(prev => ({ ...prev, 'OTE': time === '13H' ? null : time }))}
                                                            className={cn(
                                                                "flex-1 h-6 rounded text-[9px] font-bold border transition-all",
                                                                (customStartTimes['OTE'] === time || (!customStartTimes['OTE'] && time === '13H'))
                                                                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                                    : "bg-background hover:bg-muted"
                                                            )}
                                                        >
                                                            {time.replace('H', '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* End */}
                                            <div>
                                                <span className="text-[9px] text-muted-foreground block mb-1">End</span>
                                                <div className="flex gap-1">
                                                    {['16H', '17H', '18H', '19H'].map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setCustomEndTimes(prev => ({ ...prev, 'OTE': time === '19H' ? null : time }))}
                                                            className={cn(
                                                                "flex-1 h-6 rounded text-[9px] font-bold border transition-all",
                                                                (customEndTimes['OTE'] === time || (!customEndTimes['OTE'] && time === '19H'))
                                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                    : "bg-background hover:bg-muted"
                                                            )}
                                                        >
                                                            {time.replace('H', '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Special Types */}
                    <section>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status / Leave</label>
                        <div className="flex flex-wrap gap-2">
                            {/* DO, CL, VL, PH_LEAVE — selectable toggle buttons */}
                            {['DO', 'CL', 'VL', 'PH_LEAVE'].map(code => {
                                const type = DAY_TYPES[code];
                                if (!type) return null;
                                return (
                                    <button
                                        key={type.code}
                                        onClick={() => handleTypeToggle(type.code)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5",
                                            selectedType === type.code
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border-input bg-card hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {type.label}
                                        {selectedType === type.code && <Check className="w-3 h-3" />}
                                    </button>
                                );
                            })}
                            {/* PH — Public Holiday: label/status only, no hour calculation */}
                            <button
                                onClick={() => handleTypeToggle('PH')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5",
                                    selectedType === 'PH'
                                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                )}
                            >
                                Public Holiday
                                {selectedType === 'PH' && <Check className="w-3 h-3" />}
                            </button>
                        </div>
                        {selectedType === 'PH' && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 italic">Public Holiday — no hours counted.</p>
                        )}
                        {selectedType === 'PH_LEAVE' && (
                            <p className="text-[10px] text-rose-600 mt-1.5 italic font-medium">PH Leave — adds 6H to normal duty total.</p>
                        )}
                        {selectedType === 'CL' && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 italic font-medium">Casual Leave — adds 6H to normal duty total.</p>
                        )}
                    </section>
                </div>

                <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t gap-2 sm:flex-col z-20">
                    <div className="flex gap-2 w-full mb-2 sm:mb-0">
                        <Button variant="outline" className="flex-1 gap-2 h-10 text-xs" onClick={handleCopyPrevious}>
                            <Copy className="w-3 h-3" /> Copy Prev
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2 h-10 text-xs hover:bg-destructive/10 hover:text-destructive" onClick={handleClear}>
                            <Trash2 className="w-3 h-3" /> Clear
                        </Button>
                    </div>
                    <Button onClick={handleSave} className="w-full text-sm font-bold h-11 shadow-lg">
                        Save Changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default EditDaySheet;
