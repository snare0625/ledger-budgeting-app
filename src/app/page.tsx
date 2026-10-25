// Temporary token preview for reviewing the theme setup. Replaced by the
// Sign in / Home screens in build steps 4–5.
const swatches = [
  ["ink", "bg-ink"],
  ["sub", "bg-sub"],
  ["line", "bg-line"],
  ["soft", "bg-soft"],
  ["blue", "bg-blue"],
  ["green", "bg-green"],
  ["red", "bg-red"],
  ["dark", "bg-dark"],
  ["nav", "bg-nav"],
  ["tint-blue", "bg-tint-blue"],
  ["tint-red", "bg-tint-red"],
  ["cat-fixed", "bg-cat-fixed"],
  ["cat-variable", "bg-cat-variable"],
  ["cat-savings", "bg-cat-savings"],
  ["cat-income", "bg-cat-income"],
] as const;

export default function TokenPreview() {
  return (
    <main className="mx-auto w-full max-w-[390px] flex-1 bg-sheet">
      <section className="bg-hero-gradient px-gutter pt-16 pb-10">
        <p className="text-tab font-semibold text-dark-sub">
          Left to allocate · Token preview
        </p>
        <p className="mt-2 text-display text-white">$1,505</p>
        <p className="mt-1 text-label font-bold text-green">
          $5,200 income · $3,695 planned
        </p>
      </section>
      <section className="-mt-3.5 rounded-t-sheet bg-sheet px-gutter pt-5 pb-10">
        <h1 className="text-title text-ink">Ledger</h1>
        <p className="mt-1 text-label font-medium text-sub">
          Design tokens from design/README.md
        </p>
        <h2 className="mt-6 text-overline uppercase text-sub">Colors</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {swatches.map(([name, cls]) => (
            <div key={name} className="rounded-card bg-soft p-2">
              <div className={`${cls} h-10 rounded-tile border border-line`} />
              <p className="mt-1.5 text-xs font-semibold text-ink">{name}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-6 text-heading text-ink">Type scale</h2>
        <p className="mt-2 text-row font-bold text-ink">Row label 15.5 / 700</p>
        <p className="text-label font-medium text-sub">Secondary 14 / 500</p>
      </section>
    </main>
  );
}
