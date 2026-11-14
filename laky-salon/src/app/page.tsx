import Link from "next/link";
import Header from "@/components/Header";
import Booking from "@/components/Booking";
import BookServiceButton from "@/components/BookServiceButton";
import { commitments, dayNames, salon, services, workingHours } from "@/lib/salon";

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// Spaja uzastopne dane sa istim radnim vremenom (npr. "Ponedeljak – Petak")
function hoursRows() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const rows: { from: number; to: number; text: string }[] = [];
  for (const d of order) {
    const h = workingHours[d];
    const text = h ? `${fmt(h.open)} – ${fmt(h.close)}` : "zatvoreno";
    const last = rows[rows.length - 1];
    if (last && last.text === text) last.to = d;
    else rows.push({ from: d, to: d, text });
  }
  return rows.map((r) => ({
    label: r.from === r.to ? dayNames[r.from] : `${dayNames[r.from]} – ${dayNames[r.to]}`,
    text: r.text,
  }));
}

const marqueeWords = ["Šišanje", "Feniranje", "Svečane frizure", "Balayage", "Farbanje", "Keratin", "Mladenovac", "Laky"];
const galleryLabels = ["Svečane frizure", "Balayage", "Talasi", "Punđe", "Boja", "Šišanje", "Pletenice"];

export default function Home() {
  const hours = hoursRows();

  return (
    <>
      <a href="#sadrzaj" className="skip">Preskoči na sadržaj</a>
      <Header />

      <main id="sadrzaj">
        {/* HERO */}
        <section className="hero">
          <div className="container hero__grid">
            <div>
              <span className="eyebrow">Frizerski studio · {salon.city}</span>
              <h1 className="display">
                Kosa koja <em>priča</em> vašu priču.
              </h1>
              <ul className="hero__services">
                <li>Šišanje</li>
                <li>Feniranje</li>
                <li>Svečane frizure</li>
                <li>Boja i pramenovi</li>
                <li>Tretmani</li>
              </ul>
              <div className="hero__cta">
                <a href="#zakazivanje" className="btn">Zakaži online</a>
                <a href="#usluge" className="btn btn--ghost">Cenovnik</a>
              </div>
            </div>
            <div className="hero__visual" aria-hidden="true">
              <div className="art"><span className="art__label">by Laky</span></div>
              <div className="art art--2" />
              <div className="hero__badge">
                <div><strong>{salon.instagramFollowers}</strong>pratilaca</div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...marqueeWords, ...marqueeWords].map((w, i) => <span key={i}>{w}</span>)}
          </div>
        </div>

        {/* MISIJA */}
        <section className="section" id="o-nama">
          <div className="container">
            <div className="mission">
              <div>
                <span className="eyebrow">Naša misija</span>
                <h2 className="display h2" style={{ marginTop: 18 }}>
                  Jedna stolica. <em>Puna pažnja.</em>
                </h2>
              </div>
              <div className="lead">
                <p>
                  Laky je frizerski studio u Mladenovcu iza kog stoji {salon.owner}. Ideja je jednostavna:
                  svaki klijent dobija vreme, savet i frizuru koja mu stvarno odgovara – bez žurbe i bez šablona.
                </p>
                <p>
                  Od svakodnevnog šišanja i feniranja do svečanih frizura za venčanja i mature – radimo sa
                  profesionalnim preparatima i pratimo najnovije trendove.
                </p>
              </div>
            </div>
            <div className="stats">
              <div className="stat"><strong>{salon.instagramFollowers}</strong><span>Pratilaca na Instagramu</span></div>
              <div className="stat"><strong>{services.length}</strong><span>Usluga u ponudi</span></div>
              <div className="stat"><strong>2 min</strong><span>Za online zakazivanje</span></div>
            </div>
          </div>
        </section>

        {/* OBEĆANJA */}
        <section className="section section--dark">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Šta vam obećavamo</span>
                <h2 className="display h2">Šest pravila <em>kuće</em></h2>
              </div>
              <p className="lead">Isti standard za svaki termin – od brzog šišanja do svečane frizure.</p>
            </div>
            <div className="commitments">
              {commitments.map((c, i) => (
                <article className="commitment" key={c.title}>
                  <span className="commitment__num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* O MARKU */}
        <section className="section section--paper">
          <div className="container about">
            <div className="art art--3"><span className="art__label">Marko „Laky“</span></div>
            <div>
              <span className="eyebrow">Iza makaza</span>
              <h2 className="display h2" style={{ marginTop: 18 }}>{salon.owner}</h2>
              <blockquote>„Dobra frizura počinje razgovorom, a završava se osmehom u ogledalu.“</blockquote>
              <p className="lead">
                Marko svoj rad svakodnevno deli sa više od {salon.instagramFollowers} pratilaca na Instagramu – od
                transformacija boje do svečanih frizura. Otvoren je za saradnje, snimanja i posebne prilike.
              </p>
              <p className="about__sign" style={{ marginTop: 28 }}>
                <a href={salon.instagramUrl} target="_blank" rel="noreferrer">@{salon.instagram} →</a>
              </p>
            </div>
          </div>
        </section>

        {/* USLUGE */}
        <section className="section" id="usluge">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Usluge i cene</span>
                <h2 className="display h2">Cenovnik</h2>
              </div>
              <p className="lead">Cene su početne i zavise od dužine i gustine kose. Za pramenove i balayage dogovaramo se na konsultaciji.</p>
            </div>
            <div className="services">
              {services.map((s, i) => (
                <article className="service" key={s.id}>
                  <div className="service__top">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.duration} min</span>
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="service__foot">
                    <span className="service__price">{s.price}</span>
                    <BookServiceButton serviceId={s.id} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* GALERIJA */}
        <section className="section section--paper" id="galerija">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Instagram</span>
                <h2 className="display h2">@{salon.instagram}</h2>
              </div>
              <a href={salon.instagramUrl} target="_blank" rel="noreferrer" className="btn btn--ghost">Pratite nas</a>
            </div>
            <div className="gallery">
              {galleryLabels.map((label, i) => (
                <a key={label} href={salon.instagramUrl} target="_blank" rel="noreferrer" aria-label={`${label} – pogledajte na Instagramu`}>
                  <div className={`art ${["", "art--2", "art--3", "art--4"][i % 4]}`}>
                    <span className="art__label">{label}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ZAKAZIVANJE */}
        <section className="section section--dark" id="zakazivanje">
          <div className="container booking">
            <div className="booking__aside">
              <span className="eyebrow">Zakazivanje</span>
              <h2 className="display h2" style={{ marginTop: 18 }}>Rezervišite <em>svoju</em> stolicu</h2>
              <p className="lead">
                Izaberite uslugu, slobodan dan i vreme. Zauzeti termini su odmah precrtani, pa nema
                dvostrukih rezervacija.
              </p>
              <dl className="booking__info">
                <div>
                  <dt>Adresa</dt>
                  <dd>{salon.address}</dd>
                </div>
                <div>
                  <dt>Telefon</dt>
                  <dd><a href={`tel:${salon.phone.replace(/\s/g, "")}`}>{salon.phone}</a></dd>
                </div>
                <div>
                  <dt>Radno vreme</dt>
                  <dd>
                    <ul className="hours">
                      {hours.map((h) => <li key={h.label}><span>{h.label}</span><span>{h.text}</span></li>)}
                    </ul>
                  </dd>
                </div>
              </dl>
            </div>
            <Booking />
          </div>
        </section>

        {/* KONTAKT */}
        <section className="section" id="kontakt">
          <div className="container contact">
            <div>
              <h3>Dođite</h3>
              <p>{salon.address}</p>
              <p><a href={salon.mapsUrl} target="_blank" rel="noreferrer">Otvori u mapama →</a></p>
            </div>
            <div>
              <h3>Pozovite</h3>
              <p><a href={`tel:${salon.phone.replace(/\s/g, "")}`}>{salon.phone}</a></p>
              <p>Saradnje: poruka na Instagramu</p>
            </div>
            <div>
              <h3>Pratite</h3>
              <p><a href={salon.instagramUrl} target="_blank" rel="noreferrer">Instagram @{salon.instagram}</a></p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer__big display">Laky.</div>
          <div className="footer__row">
            <span>© {new Date().getFullYear()} {salon.fullName}, {salon.city}</span>
            <div className="footer__links">
              <a href={salon.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
              <a href="#zakazivanje">Zakazivanje</a>
              <Link href="/admin">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
