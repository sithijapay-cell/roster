import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[20px] shadow-2xl max-h-[90vh] flex flex-col md:max-w-md md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:rounded-[20px]"
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center pt-2 pb-4 cursor-grab active:cursor-grabbing" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{format(date, 'EEEE')}</h3>
                                <p className="text-slate-500">{format(date, 'MMMM do, yyyy')}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="p-6 overflow-y-auto space-y-8">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* Duty Shifts */}
                            <section>
                                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 block">Select Shift</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.values(SHIFT_TYPES).map(shift => (
                                        <button
                                            key={shift.code}
                                            onClick={() => handleShiftToggle(shift.code)}
                                            className={cn(
                                                "h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all",
                                                selectedShifts.includes(shift.code)
                                                    ? `border-blue-600 bg-blue-50 text-blue-700 shadow-sm`
                                                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            <span className="text-lg font-black">{shift.code}</span>
                                            <span className="text-[10px] font-semibold uppercase">{shift.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Special Types */}
                            <section>
                                <label className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 block">Leave / Off</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(DAY_TYPES).map(type => (
                                        <button
                                            key={type.code}
                                            onClick={() => handleTypeToggle(type.code)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all flex items-center gap-2",
                                                selectedType === type.code
                                                    ? `${type.code === 'DO' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                                                        type.code === 'PH' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                                                            'border-slate-900 bg-slate-900 text-white'}`
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            {type.label}
                                            {selectedType === type.code && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Quick Actions */}
                            <section className="pt-4 border-t border-slate-100 flex gap-3">
                                <Button variant="outline" className="flex-1 gap-2 h-12" onClick={handleCopyPrevious}>
                                    <Copy className="w-4 h-4" /> Copy Prev
                                </Button>
                                <Button variant="outline" className="flex-1 gap-2 h-12 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleClear}>
                                    <Trash2 className="w-4 h-4" /> Clear
                                </Button>
                            </section>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-[20px]">
                            <Button onClick={handleSave} className="w-full h-12 text-lg font-bold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditDaySheet;
