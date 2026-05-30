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
                    ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]'
                    : error
                        ? 'border-[#FECACA] hover:border-[#EF4444]'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
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
        ${checked ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1]'}
      `}
            >
                {checked && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
                <p
                    className={`text-sm font-semibold ${checked ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}
                >
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );
}