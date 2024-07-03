const STEPS = [
  {
    number: "01",
    title: "Find it",
    body: "Browse furniture, electronics, and home essentials listed by people nearby.",
  },
  {
    number: "02",
    title: "Pick a plan",
    body: "Choose 1, 3, 6, 12, or 24 months. You see the total before you pay.",
  },
  {
    number: "03",
    title: "We deliver",
    body: "Your rental arrives at your saved address. Return pickup is included in the quote.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary/35">
      <div className="container-page section-space">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-caption text-primary">How it works</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
              Three steps to
              <br />
              <span className="font-display font-normal text-primary">less clutter.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Renting should feel as simple as buying, without the commitment. Here is the whole
              flow.
            </p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
            {STEPS.map((step) => (
              <li key={step.number} className="border-t border-foreground/15 pt-5">
                <span className="text-caption text-primary">{step.number}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
