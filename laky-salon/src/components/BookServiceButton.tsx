"use client";

// Bira uslugu u formi za zakazivanje i skroluje do nje
export default function BookServiceButton({ serviceId }: { serviceId: string }) {
  return (
    <button
      className="link-btn"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("select-service", { detail: serviceId }));
        document.getElementById("zakazivanje")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      Zakaži →
    </button>
  );
}
