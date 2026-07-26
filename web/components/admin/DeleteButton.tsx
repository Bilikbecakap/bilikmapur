"use client";

interface Props {
  label?: string;
  confirmMessage: string;
  formAction: (fd: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
}

export default function DeleteButton({ label = "Hapus", confirmMessage, formAction, hiddenFields, icon = false }: Props & { icon?: boolean }) {
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        className={icon
          ? "w-8 h-8 flex items-center justify-center rounded-lg text-black/25 hover:text-beras-merah hover:bg-beras-merah/8 transition-colors"
          : "text-xs text-beras-merah/60 hover:text-beras-merah transition-colors"
        }
        title={icon ? label : undefined}
      >
        {icon ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        ) : label}
      </button>
    </form>
  );
}
