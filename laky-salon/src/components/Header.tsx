"use client";

import { useEffect, useState } from "react";
import { salon } from "@/lib/salon";

const links = [
  { href: "#usluge", label: "Usluge" },
  { href: "#o-nama", label: "O nama" },
  { href: "#galerija", label: "Galerija" },
  { href: "#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${solid || open ? "header--solid" : ""}`}>
      <div className="container header__inner">
        <a href="#" className="logo" onClick={() => setOpen(false)}>
          {salon.name}
          <span>{salon.city}</span>
        </a>
        <nav className="nav" aria-label="Glavna navigacija">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#zakazivanje" className="btn">
          Zakaži termin
        </a>
        <button
          className={`burger ${open ? "burger--open" : ""}`}
          aria-label={open ? "Zatvori meni" : "Otvori meni"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
      </div>
      <nav className={`mobile-nav ${open ? "mobile-nav--open" : ""}`} aria-label="Mobilna navigacija">
        {[...links, { href: "#zakazivanje", label: "Zakaži termin" }].map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
