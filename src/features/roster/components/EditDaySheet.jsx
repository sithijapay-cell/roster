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

    useEffect(() => {
        if (isOpen && currentData) {
            setSelectedShifts(currentData.shifts || []);
            setSelectedType(currentData.type || null);
        } else {
            setSelectedShifts([]);
            setSelectedType(null);
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
                type: selectedType
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
