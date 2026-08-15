"use client";

export default function Home() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = "https://wa.me/972559340546?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%9C%D7%A6%D7%95%D7%95%D7%AA%20%D7%A9%D7%9C%20Betix!%0A%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%A8%D7%A6%D7%99%D7%AA%D7%99%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A7%D7%A6%D7%AA%20%D7%A2%D7%9C%20%D7%94%D7%91%D7%95%D7%A0%D7%95%D7%A1%20%D7%A9%D7%9C%2040%25%20%2B%2020%20%D7%A1%D7%A4%D7%99%D7%A0%D7%99%D7%9D%20%D7%97%D7%99%D7%A0%D7%9D%20%D7%91%D7%94%D7%A4%D7%A7%D7%93%D7%94%20%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94.%0A%D7%90%D7%A0%D7%99%20%D7%9E%D7%A2%D7%9C%20%D7%92%D7%99%D7%9C%2018.";

  return (
    <div className="page">
      <header>
        <div className="container">
          <img
            className="logo"
            src="/logoo.png"
            alt="BETIX"
          />
        </div>
      </header>

      <main>
        <div className="container">
          <section className="hero">
            <div className="pill">VIP ACCESS · 40% BONUS</div>

            <h1>
              בלאקג׳ק, רולטה, פוקר, הימורי ספורט
              <br />
              <span className="highlight flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 my-2 md:my-0">
                <span>ואלפי משחקים במקום אחד!</span>
              </span>
            </h1>

            <p className="subtitle">
              קבלו 40% בונוס על ההפקדה ראשונה, שירות אישי, תמיכה 24/7 וגישה לקבוצת VIP עם המבצעים הכי חזקים!
            </p>

            <a
              className="cta"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window !== "undefined" && window.fbq) {
                  window.fbq('track', 'Contact');
                }
              }}
            >
              בקשו את הבונוס בוואטסאפ
            </a>

            <div className="trust">
              <span>שירות אישי</span>
              <span>תמיכה זמינה 24/7</span>
              <span>מיועד לבני 18 ומעלה</span>
            </div>

            <div className="legal-note">
              ההטבה כפופה לזכאות, לאימות החשבון ולתנאי המבצע.
              הבונוס הוא קרדיט שיווקי ואינו זמין למשיכה מיידית.
              אין הבטחה לזכייה או לרווח. שחקו באחריות.
            </div>
          </section>
        </div>
      </main>

      <footer>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div>
            © {currentYear} BETIX · כל הזכויות שמורות
          </div>
        </div>
      </footer>
    </div>
  );
}
