'use client';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    loading: boolean;
}

export default function SearchPlaca({
    value,
    onChange,
    onSearch,
    loading,
}: Props) {
    return (
        <div className="w-full flex flex-col md:flex-row gap-4">
            <input
                type="text"
                placeholder="Ingresa tu placa"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value.toUpperCase())
                }
                className="
          flex-1
          h-14
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-5
          text-lg
          outline-none
          transition-all
          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-100
        "
            />

            <button
                onClick={onSearch}
                disabled={loading}
                className="
          h-14
          px-8
          rounded-2xl
          bg-blue-600
          text-white
          font-semibold
          transition-all
          hover:bg-blue-700
          disabled:opacity-50
        "
            >
                {loading ? 'Consultando...' : 'Buscar'}
            </button>
        </div>
    );
}