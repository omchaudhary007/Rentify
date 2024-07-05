import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Secure payments",
    body: "Payments are handled by Razorpay.",
  },
  {
    icon: Truck,
    title: "Delivery and pickup",
    body: "Quoted clearly before you pay.",
  },
  {
    icon: BadgeCheck,
    title: "Flexible plans",
    body: "Choose from 1 to 24 months.",
  },
];

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-pill border border-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground/85">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          Rent better. Own less.
        </div>

        <div className="mt-10 rounded-panel border border-primary-foreground/15 bg-primary-foreground/[0.06] p-4">
          <div className="relative overflow-hidden rounded-xl bg-[#e9e3d6]">
            <svg
              viewBox="0 0 480 320"
              role="img"
              aria-label="Illustration of a reading chair beside a small table"
              className="h-auto w-full"
            >
              <rect width="480" height="320" fill="#e9e3d6" />
              <circle cx="368" cy="74" r="46" fill="#d8cfbd" />
              <path d="M0 246h480v74H0z" fill="#dcd3c2" />
              <path
                d="M92 250V150c0-20 16-36 36-36h96c20 0 36 16 36 36v100"
                fill="none"
                stroke="#243d2f"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M104 186c0-14 11-25 25-25h82c14 0 25 11 25 25v32H104v-32Z"
                fill="#f6f2e9"
                stroke="#243d2f"
                strokeWidth="6"
              />
              <path d="M128 250v34M252 250v34" stroke="#243d2f" strokeWidth="8" strokeLinecap="round" />
              <path d="M104 214h132" stroke="#243d2f" strokeWidth="6" strokeLinecap="round" />
              <circle cx="334" cy="182" r="38" fill="#c9d8bd" stroke="#243d2f" strokeWidth="6" />
              <path d="M334 144v-28M334 220v28" stroke="#243d2f" strokeWidth="6" strokeLinecap="round" />
              <path d="M296 182h-22M372 182h22" stroke="#243d2f" strokeWidth="6" strokeLinecap="round" />
              <path d="M330 282h8v-36h-8z" fill="#243d2f" />
              <path d="M314 282h40" stroke="#243d2f" strokeWidth="6" strokeLinecap="round" />
              <path d="M142 94c0-10 8-18 18-18h44c10 0 18 8 18 18v6h-80v-6Z" fill="#243d2f" opacity="0.14" />
            </svg>
          </div>
          <div className="flex items-end justify-between gap-4 px-1 pt-4">
            <div>
              <p className="text-sm font-medium">Everything for a comfortable home</p>
              <p className="mt-1 text-xs text-primary-foreground/65">
                Furniture, appliances, and electronics on flexible plans.
              </p>
            </div>
            <span className="shrink-0 rounded-pill bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
              1–24 mo
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-12">
        <blockquote className="max-w-sm font-display text-3xl leading-[1.15] tracking-[-0.01em] xl:text-4xl">
          “A home that adapts to you, without the weight of owning everything.”
        </blockquote>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <li key={point.title} className="flex gap-2.5">
              <point.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold">{point.title}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-primary-foreground/60">
                  {point.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
