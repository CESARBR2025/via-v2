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
                    ? 'border-blue-600 bg-blue-50 shadow-card'
                    : error
                        ? 'border-red-200 hover:border-red-500'
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
        ${checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}
      `}
            >
                {checked && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
                <p
                    className={`text-sm font-medium ${checked ? 'text-blue-600' : 'text-slate-900'}`}
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