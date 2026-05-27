export function RadioOption({
    name,
    value,
    checked,
    onChange,
    label,
    description,
    disabled,
    error,
}: {
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    disabled?: boolean;
    error?: boolean;
}) {
    return (
        <label
            className={`
        relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${checked
                    ? 'border-[#0b3b60] bg-blue-50/60 shadow-sm'
                    : error
                        ? 'border-red-300 hover:border-red-400'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
            />
            <div
                className={`
        shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
        ${checked ? 'border-[#0076aa] bg-[#0076aa]' : 'border-slate-300'}
      `}
            >
                {checked && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
                <p
                    className={`text-sm font-semibold ${checked ? 'text-[#0076aa]' : 'text-slate-700'}`}
                >
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );
}