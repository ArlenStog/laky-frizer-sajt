# Laky – frizerski studio, Mladenovac

Sajt za frizerski studio Laky (Marko Lakićević Laky, Instagram @markolaky).
Napravljen u Next.js-u (App Router) sa Node.js backendom za zakazivanje.

## Pokretanje

```bash
npm install
npm run dev        # razvoj, http://localhost:3000
npm run build && npm start   # produkcija
```

## Šta gde menjate

| Šta | Fajl |
|---|---|
| Adresa, telefon, Instagram, radno vreme, usluge, cene, trajanje usluga | `src/lib/salon.ts` |
| Tekstovi na stranici | `src/app/page.tsx` |
| Boje i dizajn | `src/app/globals.css` |
| Lozinka za admin | `.env.local` → `ADMIN_PASSWORD` |

Polja označena sa `PROVERITI` u `src/lib/salon.ts` (adresa, telefon, radno vreme, cene)
nisu javno dostupna, pa su upisane privremene vrednosti.

Slike su trenutno dekorativni blokovi (`.art` u CSS-u). Ubacite prave fotografije u
`public/` i zamenite ih `<img>` elementima.

## Zakazivanje (backend)

- `GET /api/availability?month=YYYY-MM&service=<id>` – status svakog dana (slobodno / malo termina / popunjeno / zatvoreno)
- `GET /api/availability?date=YYYY-MM-DD&service=<id>` – termini za dan, zauzeti su `available: false`
- `POST /api/bookings` – `{ date, time, serviceId, name, phone, note? }`; server ponovo proverava termin, pa nema dvostrukih rezervacija (409 ako je zauzet)
- Admin (header `x-admin-password`): `GET /api/admin/bookings`, `DELETE /api/admin/bookings/:id`, `POST /api/admin/blocks`, `DELETE /api/admin/blocks/:id`

Termini se računaju po trajanju usluge (npr. farbanje 90 min zauzima tri polusatna termina).
Podaci se čuvaju u `data/db.json`. Za hosting bez trajnog diska (npr. Vercel)
zamenite funkcije `readDB`/`writeDB` u `src/lib/bookings.ts` bazom (Postgres, SQLite i sl.).

Admin stranica: `/admin` – pregled i otkazivanje rezervacija, blokiranje dana ili dela dana.
