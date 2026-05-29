export default function LoadingState() {
    return (
        <div
            className="
        w-full
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-16
        text-center
      "
        >
            <div
                className="
          mx-auto
          h-12
          w-12
          animate-spin
          rounded-full
          border-4
          border-slate-200
          border-t-blue-600
        "
            />

            <p className="mt-4 text-slate-500">
                Consultando infracciones...
            </p>
        </div>
    );
}