"use client";
import Link from 'next/link';

export default function BlackjackAdvertorial() {
  return (
    <div className="page" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', marginBottom: '20px', lineHeight: '1.2' }}>
          הסוד של שחקני הבלאקג'ק המקצועיים
        </h1>
        
        <p className="subtitle" style={{ color: '#cbd5e1', fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.6' }}>
          בלאקג'ק הוא הרבה יותר ממשחק של מזל - זהו משחק של אסטרטגיה, חשיבה מהירה ויכולת קבלת החלטות.
          הצטרפו עכשיו לשולחן, גלו את האסטרטגיות המנצחות והתחילו לשחק כמו מקצוענים.
        </p>

        <Link href="/verify" className="cta" style={{ background: '#ff6b00', color: '#fff', textShadow: 'none', padding: '0 50px', fontSize: '1.5rem', height: '70px', borderRadius: '15px' }}>
          שחק
        </Link>
      </div>
    </div>
  );
}
