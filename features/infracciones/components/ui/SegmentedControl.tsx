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
        flex bg-slate-100 rounded-xl p-1 gap-0
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'ring-2 ring-red-500 ring-offset-1' : ''}
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
              text-sm font-medium
              transition-all duration-200
              ${selected
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-1
            `}
          >
            {Icon && (
              <Icon size={16} strokeWidth={1.5} className={selected ? 'text-blue-700' : 'text-slate-400'} />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
