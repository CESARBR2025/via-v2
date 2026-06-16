'use client';

import { useEffect, useRef, useState } from 'react';

// CustomSelect.tsx — cambia la interface Option
interface Option {
    value: string | number; // ← acepta ambos
    label: string | number;
}

interface CustomSelectProps {
    options: Option[];
    value: string | number; // ← también aquí
    onChange: (value: string | number) => void; // ← y aquí
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    name?: string;
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Selecciona una opción',
    disabled = false,
    error = false,
    name,
}: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find((o) => o.value === value)?.label;

    // Cierra el panel si se hace clic fuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cierra con Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const triggerClasses = [
        'flex w-full items-center justify-between gap-2 px-3 h-[42px]',
        'rounded-lg border bg-white text-sm transition-all cursor-pointer',
        open
            ? 'border-teal-500 ring-2 ring-teal-500/15'
            : error
                ? 'border-red-400'
                : 'border-gray-300 hover:border-teal-400',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Input oculto para que el name funcione en forms */}
            <input type="hidden" name={name} value={value} />

            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((prev) => !prev)}
                className={triggerClasses}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={name ? `${name}: ${selectedLabel ?? placeholder}` : placeholder}
            >
                <span
                    className={`flex-1 text-left truncate ${!selectedLabel ? 'text-gray-400' : 'text-gray-900'
                        }`}
                >
                    {selectedLabel ?? placeholder}
                </span>
                <svg
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''
                        }`}
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Panel */}
            {open && (
                <ul
                    role="listbox"
                    aria-label={placeholder}
                    className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 rounded-lg border border-gray-200 bg-white shadow-lg overflow-y-auto max-h-[184px]"
                >
                    <li>
                        <button
                            type="button"
                            role="option"
                            aria-selected={value === ''}
                            onClick={() => {
                                onChange('');
                                setOpen(false);
                            }}
                            className="w-full px-3 py-2.5 text-left text-sm text-gray-400 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                            {placeholder}
                        </button>
                    </li>
                    {options.map((opt, i) => (
                        <li key={opt.value}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={[
                                    'w-full px-3 py-2.5 text-left text-sm leading-snug transition-colors',
                                    // ✅ Aquí está la clave: texto largo se wrappea, no se desborda
                                    'whitespace-normal break-words',
                                    i > 0 ? 'border-t border-gray-100' : '',
                                    value === opt.value
                                        ? 'bg-teal-50 text-teal-700 font-medium'
                                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
