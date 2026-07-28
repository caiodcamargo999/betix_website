"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgeVerification() {
  const router = useRouter();

  const handleNo = () => {
    alert('המשחק מיועד לגילאי 21 ומעלה בלבד.');
    router.push('/');
  };

  const handleYes = () => {
    router.push('/bonus');
  };

  return (
    <div className="page" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-content" style={{ textAlign: 'center', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '15px' }}>אימות גיל</h2>
        <p className="modal-subtitle" style={{ fontSize: '1.2rem', marginBottom: '40px' }}>
          האם אתה מעל גיל 21?
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button 
            onClick={handleYes}
            className="cta" 
            style={{ margin: 0, minWidth: '120px', background: '#25d366' }}
          >
            כן
          </button>
          
          <button 
            onClick={handleNo}
            className="cta" 
            style={{ margin: 0, minWidth: '120px', background: '#475569', color: '#fff', boxShadow: 'none' }}
          >
            לא
          </button>
        </div>
      </div>
    </div>
  );
}
