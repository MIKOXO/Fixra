const AuthShell = ({ eyebrow, title, children, footer }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-warm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,93,58,0.12),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(86,129,89,0.14),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(245,240,235,0.88))]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #1a1a1f 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-8">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">F</span>
              </div>
              <span className="font-heading font-bold text-xl text-charcoal-950 tracking-tight">
                Fixra
              </span>
            </div>
            {footer}
          </div>

          <div className="rounded-3xl border border-charcoal-200/70 bg-white/92 p-6 shadow-[0_24px_90px_rgba(26,26,31,0.12)] backdrop-blur-xl">
            <div className="mb-5">
              <p className="font-heading text-xs font-semibold uppercase tracking-[0.32em] text-primary-500">
                {eyebrow}
              </p>
              <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-charcoal-950">
                {title}
              </h1>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
