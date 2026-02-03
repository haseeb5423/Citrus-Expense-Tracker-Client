import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    name?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value or default to today
    const initialDate = value ? new Date(value) : new Date();
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

    const selectedDate = value ? new Date(value) : null;

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Set time to noon to avoid timezone issues with date-only storage
        newDate.setHours(12, 0, 0, 0);
        onChange(newDate.toISOString());
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const days = [];
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    // Weekdays header
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
        const isSelected = selectedDate &&
            selectedDate.getDate() === d &&
            selectedDate.getMonth() === viewDate.getMonth() &&
            selectedDate.getFullYear() === viewDate.getFullYear();
        const isToday = new Date().getDate() === d &&
            new Date().getMonth() === viewDate.getMonth() &&
            new Date().getFullYear() === viewDate.getFullYear();

        days.push(
            <button
                key={d}
                type="button"
                onClick={() => handleDateSelect(d)}
                className={`h-9 w-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all
          ${isSelected ? 'bg-[var(--action-primary)] text-white shadow-lg shadow-orange-500/30' :
                        isToday ? 'border border-[var(--action-primary)] text-[var(--action-primary)]' :
                            'hover:bg-[var(--action-soft)] text-[var(--text-primary)]'}`}
            >
                {d}
            </button>
        );
    }

    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="space-y-1.5 relative w-full" ref={containerRef}>
            {label && (
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] ml-3">
                    {label}
                </label>
            )}

            {isOpen && (
                <div className="relative mb-4 w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[2rem] shadow-xl p-5 z-[50] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--action-soft)] hover:text-[var(--action-primary)] rounded-lg transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                            {monthName} {viewDate.getFullYear()}
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] hover:bg-[var(--action-soft)] hover:text-[var(--action-primary)] rounded-lg transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-[10px] font-bold text-[var(--text-muted)] p-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                today.setHours(12, 0, 0, 0);
                                onChange(today.toISOString());
                                setIsOpen(false);
                            }}
                            className="text-[9px] font-bold text-[var(--action-primary)] uppercase tracking-widest hover:underline"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`relative group cursor-pointer w-full bg-[var(--bg-primary)] border ${isOpen ? 'border-[var(--action-primary)] ring-4 ring-orange-500/10' : 'border-[var(--border-default)]'} rounded-xl transition-all shadow-sm overflow-hidden`}
            >
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--action-primary)] pointer-events-none">
                    <CalendarIcon size={18} />
                </div>

                <div className="pl-14 pr-6 py-4 font-bold text-xs text-[var(--text-primary)] flex items-center h-12 md:h-14">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                </div>

                {/* Hidden input for form data */}
                <input
                    type="hidden"
                    name={name}
                    value={value ? value.split('T')[0] : ''}
                />
            </div>
        </div>
    );
};
