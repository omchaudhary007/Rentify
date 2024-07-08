const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const SCRIPT_ID = "razorpay-checkout-script";

let scriptPromise: Promise<boolean> | null = null;

export function getRazorpayKey(): string {
  return (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim();
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayKey().length > 0;
}

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const finish = (loaded: boolean) => {
      if (!loaded) {
        scriptPromise = null;
        existing?.remove();
      }
      resolve(loaded);
    };

    if (existing) {
      existing.addEventListener("load", () => finish(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => finish(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => finish(Boolean(window.Razorpay));
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
}
