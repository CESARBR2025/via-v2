'use client';

type Option = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
};

type Props = {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  name?: string;
  disabled?: boolean;
  error?: boolean;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  disabled,
  error,
}: Props) {
  return (
    <div
      className={`
        flex bg-[#F1F5F9] rounded-xl p-1 gap-0
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'ring-2 ring-[#EF4444] ring-offset-1' : ''}
      `}
      role="radiogroup"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 flex items-center justify-center gap-2
              py-2.5 px-4 rounded-[10px]
              text-sm font-semibold
              transition-all duration-200
              ${selected
                ? 'bg-white text-[#2563EB] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-[#64748B] hover:text-[#0F172A]'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1
            `}
          >
            {Icon && (
              <Icon size={16} strokeWidth={1.5} className={selected ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
