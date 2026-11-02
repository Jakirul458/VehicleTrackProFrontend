import { useEffect, useState } from "react";
import { Check, KeyRound, Leaf, Mail, Receipt, ShieldCheck, Truck } from "lucide-react";

const DOCUMENT_LOADING_STEPS = [
  { label: "Signing in...", Icon: Truck },
  { label: "Checking insurance...", Icon: ShieldCheck },
  { label: "Verifying tax...", Icon: Receipt },
  { label: "Scanning PUC...", Icon: Leaf },
];

interface VehicleLoadingProps {
  variant?: "button" | "section" | "page";
  purpose?: "documents" | "login";
  className?: string;
}

function LoginVehicleLoading({ className }: { className: string }) {
  const [station, setStation] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStation((current) => Math.min(current + 1, 2));
    }, 1400);
    const waitingTimeoutId = window.setTimeout(() => setIsWaiting(true), 4400);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(waitingTimeoutId);
    };
  }, []);

  const currentLabel = isWaiting
    ? "Almost there... Preparing your account"
    : ["Checking email...", "Checking password...", "Verifying account..."][station];
  const stations = [
    { label: "Email", Icon: Mail },
    { label: "Password", Icon: KeyRound },
    { label: "Account", Icon: ShieldCheck },
  ];

  return (
    <span
      className={`vt-loading vt-loading--button vt-login-loader ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="vt-login-loader-message" key={currentLabel}>
        {currentLabel}
      </span>
      <span className="vt-login-route" aria-hidden="true">
        <span className="vt-login-road" />
        <Truck className="vt-login-truck" style={{ left: `${16.666 + station * 33.334}%` }} />
        <span className="vt-login-stations">
          {stations.map(({ label, Icon }, index) => (
            <span className="vt-login-station" key={label}>
              <span
                className={`vt-login-stop ${index < station ? "is-complete" : ""} ${index === station ? "is-current" : ""}`}
              >
                {index < station ? <Check /> : <Icon />}
              </span>
              <span className={index <= station ? "is-active" : ""}>{label}</span>
            </span>
          ))}
        </span>
      </span>
      <span className="sr-only">{isWaiting ? "Your secure sign-in is being finalized." : ""}</span>
    </span>
  );
}

export function VehicleLoading({
  variant = "section",
  purpose = "documents",
  className = "",
}: VehicleLoadingProps) {
  if (variant === "button" && purpose === "login") {
    return <LoginVehicleLoading className={className} />;
  }

  return <DocumentVehicleLoading variant={variant} className={className} />;
}

function DocumentVehicleLoading({
  variant,
  className,
}: {
  variant: "button" | "section" | "page";
  className: string;
}) {
  const [step, setStep] = useState(0);
  const loadingSteps = DOCUMENT_LOADING_STEPS;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStep((current) => (current + 1) % loadingSteps.length);
    }, 1200);
    return () => window.clearInterval(intervalId);
  }, [loadingSteps.length]);

  const { label, Icon } = loadingSteps[step];
  const content = (
    <span className="vt-loader-status flex items-center gap-2" key={step}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
  const road = (
    <span className="vt-loader-road" aria-hidden="true">
      <span className="vt-loader-speed-lines" />
      <Truck className="vt-loader-truck" />
      <span className="vt-loader-dashes" />
    </span>
  );

  if (variant === "button") {
    return (
      <span
        className={`vt-loading vt-loading--button ${className}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {road}
        {content}
      </span>
    );
  }

  return (
    <div
      className={`vt-loading vt-loading--${variant} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <span className="vt-loader-content">
        {road}
        {content}
      </span>
    </div>
  );
}
