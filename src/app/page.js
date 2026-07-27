"use client";

import { useState } from "react";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);

  const whatsappUrl = "https://wa.me/972535372176?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%9C%D7%A6%D7%95%D7%95%D7%AA%20BETIX!%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A0%D7%99%20%D7%A8%D7%95%D7%A6%D7%94%20%D7%9C%D7%A7%D7%91%D7%9C%20%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20%D7%91%D7%95%D7%A0%D7%95%D7%A1%20%D7%A9%D7%9C%2030%25%20%D7%91%D7%94%D7%A4%D7%A7%D7%93%D7%94%20%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94.%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%90%D7%A9%D7%A8%20%D7%A9%D7%92%D7%99%D7%9C%D7%99%2018%20%D7%95%D7%9E%D7%A2%D7%9C%D7%94.";

  const handleOpenModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch("/api/kommo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      // Navigate to whatsapp whether API succeeds or fails
      window.open(whatsappUrl, "_blank");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting lead:", error);
      window.open(whatsappUrl, "_blank");
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="pill">VIP ACCESS · 30% BONUS</div>

            <h1>
              קבלו
              <span className="highlight">30% בונוס</span>
              בהפקדה הראשונה
            </h1>

            <p className="subtitle">
              פנו לצוות BETIX בוואטסאפ, בדקו את תנאי ההטבה וקבלו ליווי אישי בתהליך ההצטרפות.
            </p>

            <a
              className="cta"
              href="#"
              onClick={handleOpenModal}
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" dir="rtl">
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>קבלת ההטבה</h2>
            <p className="modal-subtitle">אנא מלאו את הפרטים ונציג יחזור אליכם בהקדם.</p>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>שם מלא</label>
                <input
                  type="text"
                  name="name"
                  placeholder="הכנס שם מלא"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>אימייל</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label>טלפון</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="050-0000000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  dir="ltr"
                />
              </div>
              <button type="submit" className="cta modal-submit" disabled={isLoading}>
                {isLoading ? 'שולח...' : 'שליחה למעבר לוואטסאפ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
