/** Shared heading layout for the form steps: H2 + optional sub + content. */
export function ScreenShell({
  heading,
  sub,
  children,
}: {
  heading: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="t-h2 text-balance">{heading}</h2>
        {sub && <p className="t-body text-ink-3">{sub}</p>}
      </header>
      {children}
    </section>
  );
}
