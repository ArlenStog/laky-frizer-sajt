// Svi podaci o salonu na jednom mestu.
// Podaci označeni sa "PROVERITI" nisu javno dostupni – zamenite ih pravim vrednostima.

export const salon = {
  name: "Laky",
  fullName: "Frizerski studio Laky",
  owner: "Marko Lakićević Laky",
  city: "Mladenovac",
  instagram: "markolaky",
  instagramUrl: "https://www.instagram.com/markolaky/",
  instagramFollowers: "26K",
  address: "Kralja Petra I, Mladenovac", // PROVERITI – tačna adresa
  phone: "+381 60 000 0000", // PROVERITI – broj telefona
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mladenovac",
};

// Radno vreme po danu u nedelji (0 = nedelja ... 6 = subota). null = zatvoreno.
// Vremena su u minutima od ponoći.  PROVERITI
export const workingHours: Record<number, { open: number; close: number } | null> = {
  0: null,
  1: { open: 9 * 60, close: 20 * 60 },
  2: { open: 9 * 60, close: 20 * 60 },
  3: { open: 9 * 60, close: 20 * 60 },
  4: { open: 9 * 60, close: 20 * 60 },
  5: { open: 9 * 60, close: 20 * 60 },
  6: { open: 9 * 60, close: 16 * 60 },
};

export const dayNames = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];

// Korak u kome se nude termini (minuti)
export const SLOT_STEP = 30;
// Koliko dana unapred može da se zakaže
export const BOOKING_WINDOW_DAYS = 60;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string; // prikazna cena
  duration: number; // minuti
};

// Cene su okvirne – PROVERITI
export const services: Service[] = [
  {
    id: "musko-sisanje",
    name: "Muško šišanje",
    description: "Šišanje makazama ili mašinicom, pranje i stilizovanje.",
    price: "od 1.200 RSD",
    duration: 30,
  },
  {
    id: "zensko-sisanje",
    name: "Žensko šišanje i feniranje",
    description: "Konsultacija, šišanje po obliku lica, pranje i feniranje.",
    price: "od 2.000 RSD",
    duration: 60,
  },
  {
    id: "feniranje",
    name: "Feniranje i stilizovanje",
    description: "Pranje, feniranje, talasi ili ravna kosa za svaki dan.",
    price: "od 1.200 RSD",
    duration: 30,
  },
  {
    id: "svecane-frizure",
    name: "Svečane frizure",
    description: "Punđe, pletenice i frizure za venčanja, mature i proslave.",
    price: "od 3.000 RSD",
    duration: 60,
  },
  {
    id: "farbanje",
    name: "Farbanje",
    description: "Farbanje izrastka ili cele dužine, uz negu posle tretmana.",
    price: "od 3.500 RSD",
    duration: 90,
  },
  {
    id: "pramenovi",
    name: "Pramenovi i balayage",
    description: "Prirodni prelazi, blond tonovi i osvežavanje boje.",
    price: "po dogovoru",
    duration: 150,
  },
  {
    id: "keratin",
    name: "Keratin i tretmani",
    description: "Ispravljanje, dubinska nega i obnova oštećene kose.",
    price: "od 5.000 RSD",
    duration: 120,
  },
];

export const commitments = [
  { title: "Konsultacija pre svega", text: "Pre svake usluge razgovaramo o tome šta želite i šta vašoj kosi odgovara." },
  { title: "Tačno u minut", text: "Vaš termin je vaš. Trudimo se da ne čekate ni minut." },
  { title: "Proverena kozmetika", text: "Radimo samo sa profesionalnim preparatima kojima verujemo." },
  { title: "Higijena bez kompromisa", text: "Sterilisan pribor i čist radni prostor za svakog klijenta." },
  { title: "Iskrene preporuke", text: "Reći ćemo vam šta je realno i kako da kosu održite kod kuće." },
  { title: "Prijatna atmosfera", text: "Kafa, dobra muzika i opušten razgovor – dođite kao prijatelj." },
];
