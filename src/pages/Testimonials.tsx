import React, { useState, useEffect, useRef } from "react";

interface Testimonial {
  stars: number;
  quote: string;
  name: string;
  location: string;
  time: string;
}

const testimonials: Testimonial[] = [
  {
    stars: 5,
    quote:
      "This website changed my life! I earned ₦3,450,000 in my first month just by following the simple steps. From a broke corper to financially free.",
    name: "Chisom Okonkwo",
    location: "Lagos, Nigeria",
    time: "5 mins ago",
  },
  {
    stars: 5,
    quote:
      "I was skeptical at first, but after 3 weeks I made over ₦1,200,000. The best part? It works while I sleep. Passive income at its finest!",
    name: "Tunde Adeyemi",
    location: "Abuja, Nigeria",
    time: "12 mins ago",
  },
  {
    stars: 4,
    quote:
      "As a single mum, this has been a game-changer. Earned ₦890,000 last month working only 2 hours a day. Finally can afford extras for my kids.",
    name: "Ngozi Eze",
    location: "Port Harcourt, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 5,
    quote:
      "Made ₦7,650,000 in 45 days. I quit my 9–5 last week. The community and tools are unmatched.",
    name: "Emeka Nwosu",
    location: "Kano, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 5,
    quote:
      "Retired teacher here. This platform gave me purpose again and ₦2,340,000 extra per month. Love it!",
    name: "Mama Blessing Adewale",
    location: "Ibadan, Nigeria",
    time: "47 mins ago",
  },
  {
    stars: 5,
    quote:
      "From zero to ₦4,200,000 in 6 weeks. The step-by-step guides are so easy even my grandma could follow.",
    name: "Kunle Afolabi",
    location: "Enugu, Nigeria",
    time: "Just now",
  },
  {
    stars: 4,
    quote:
      "Earned my first ₦500,000 in under 10 days. Now consistently pulling ₦1,800,000–₦2,500,000 monthly.",
    name: "Adaeze Okafor",
    location: "Benin City, Nigeria",
    time: "8 mins ago",
  },
  {
    stars: 5,
    quote:
      "I love how beginner-friendly it is. Made ₦9,100,000 so far and I'm only 19!",
    name: "Seun Balogun",
    location: "Warri, Nigeria",
    time: "3 hours ago",
  },
  {
    stars: 5,
    quote:
      "Best decision ever. Replaced my salary (₦4,800,000/month) and now travel full-time.",
    name: "Zainab Musa",
    location: "Calabar, Nigeria",
    time: "22 mins ago",
  },
  {
    stars: 4,
    quote:
      "As a truck driver, I do this on the road. Already banked ₦3,670,000 in passive earnings.",
    name: "Chukwudi Ogbuike",
    location: "Owerri, Nigeria",
    time: "1 day ago",
  },
  {
    stars: 5,
    quote:
      "Turned my passion into ₦2,890,000/month. Can't thank the team enough!",
    name: "Ifunanya Chukwu",
    location: "Jos, Nigeria",
    time: "15 mins ago",
  },
  {
    stars: 5,
    quote:
      "My side hustle exploded to ₦6,200,000 last month. Finally debt-free!",
    name: "Fatima Usman",
    location: "Kaduna, Nigeria",
    time: "4 mins ago",
  },
  {
    stars: 4,
    quote:
      "Consistent ₦1,100,000–₦1,600,000 every single month. Super reliable.",
    name: "Rotimi Adesanya",
    location: "Abeokuta, Nigeria",
    time: "35 mins ago",
  },
  {
    stars: 5,
    quote: "Earned ₦12,450,000 in 3 months. This is the real deal.",
    name: "Aisha Garba",
    location: "Sokoto, Nigeria",
    time: "10 mins ago",
  },
  {
    stars: 5,
    quote: "From unemployed to making ₦2,750,000/month from home. Mind blown.",
    name: "Uche Nnamdi",
    location: "Akure, Nigeria",
    time: "50 mins ago",
  },
  {
    stars: 4,
    quote: "Great for beginners. I made ₦780,000 in week one!",
    name: "Chiamaka Obiora",
    location: "Makurdi, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 5,
    quote:
      "The support is incredible. Hit ₦5,340,000 and still growing strong.",
    name: "Babatunde Olawale",
    location: "Lagos, Nigeria",
    time: "7 mins ago",
  },
  {
    stars: 5,
    quote:
      "Quit my corporate job after earning ₦8,900,000 in two months. Freedom!",
    name: "Amira Suleiman",
    location: "Abuja, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 4,
    quote: "Low effort, high reward. Averaging ₦2,100,000 monthly now.",
    name: "Nnamdi Obi",
    location: "Port Harcourt, Nigeria",
    time: "25 mins ago",
  },
  {
    stars: 5,
    quote:
      "Made ₦1,450,000 while on vacation in Zanzibar. Truly location independent.",
    name: "Halima Yakubu",
    location: "Kano, Nigeria",
    time: "6 mins ago",
  },
  {
    stars: 5,
    quote:
      "Started with nothing, now earning ₦4,500,000 monthly. This platform is gold!",
    name: "Obiora Chukwuemeka",
    location: "Ibadan, Nigeria",
    time: "Just now",
  },
  {
    stars: 4,
    quote: "As a freelancer, this doubled my income to ₦3,200,000 per month.",
    name: "Bukola Fashola",
    location: "Enugu, Nigeria",
    time: "5 mins ago",
  },
  {
    stars: 5,
    quote: "Earned ₦6,800,000 in 2 months. Life-changing opportunity!",
    name: "Damilola Ogundimu",
    location: "Benin City, Nigeria",
    time: "12 mins ago",
  },
  {
    stars: 5,
    quote: "From part-time to full-time earner: ₦5,100,000 monthly now.",
    name: "Yetunde Adebayo",
    location: "Warri, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 4,
    quote: "Consistent ₦1,900,000 every month. Perfect for busy parents.",
    name: "Chidi Okeke",
    location: "Calabar, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 5,
    quote: "Made ₦10,200,000 in 4 months. Unbelievable results!",
    name: "Funmi Adeleke",
    location: "Owerri, Nigeria",
    time: "47 mins ago",
  },
  {
    stars: 5,
    quote: "Passive income dream: ₦3,750,000 while I travel the world.",
    name: "Tosin Ajayi",
    location: "Jos, Nigeria",
    time: "Just now",
  },
  {
    stars: 4,
    quote: "Beginner-friendly and profitable. Earned ₦950,000 in first week.",
    name: "Oluwaseun Oladele",
    location: "Kaduna, Nigeria",
    time: "8 mins ago",
  },
  {
    stars: 5,
    quote: "Replaced my job income with ₦7,300,000 monthly earnings.",
    name: "Nneka Ihejirika",
    location: "Abeokuta, Nigeria",
    time: "3 hours ago",
  },
  {
    stars: 5,
    quote: "As a student, this gave me financial freedom: ₦2,600,000/month.",
    name: "Abdullahi Bello",
    location: "Sokoto, Nigeria",
    time: "22 mins ago",
  },
  {
    stars: 4,
    quote: "Low-risk, high-reward. Averaging ₦4,100,000 monthly.",
    name: "Chidinma Ibe",
    location: "Akure, Nigeria",
    time: "1 day ago",
  },
  {
    stars: 5,
    quote: "Earned ₦8,500,000 in 3 months. The community is amazing!",
    name: "Segun Oluwole",
    location: "Makurdi, Nigeria",
    time: "15 mins ago",
  },
  {
    stars: 5,
    quote: "From doubter to believer: ₦5,800,000 in passive income.",
    name: "Mariam Aliyu",
    location: "Lagos, Nigeria",
    time: "4 mins ago",
  },
  {
    stars: 4,
    quote: "Consistent ₦2,300,000–₦3,000,000 every single month.",
    name: "Chukwuebuka Osei",
    location: "Abuja, Nigeria",
    time: "35 mins ago",
  },
  {
    stars: 5,
    quote: "Made ₦9,750,000 in 5 months. This is revolutionary!",
    name: "Ifeoma Nwofor",
    location: "Port Harcourt, Nigeria",
    time: "10 mins ago",
  },
  {
    stars: 5,
    quote: "Quit my dead-end job after earning ₦4,200,000/month.",
    name: "Ayo Oluwasegun",
    location: "Kano, Nigeria",
    time: "50 mins ago",
  },
  {
    stars: 4,
    quote: "Perfect for side income. Made ₦1,150,000 in week one!",
    name: "Stella Ogwu",
    location: "Ibadan, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 5,
    quote: "The tools are incredible. Hit ₦6,900,000 and counting.",
    name: "Emeka Okafor",
    location: "Enugu, Nigeria",
    time: "7 mins ago",
  },
  {
    stars: 5,
    quote: "Financial independence achieved: ₦11,200,000 in two months.",
    name: "Adaora Nze",
    location: "Benin City, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 4,
    quote: "Easy to use and profitable. Averaging ₦3,400,000 monthly.",
    name: "Sola Adeyemi",
    location: "Warri, Nigeria",
    time: "25 mins ago",
  },
  {
    stars: 5,
    quote: "Made ₦2,800,000 while on a family trip to Dubai. Amazing!",
    name: "Bimpe Olanrewaju",
    location: "Calabar, Nigeria",
    time: "6 mins ago",
  },
  {
    stars: 5,
    quote: "Started small, now earning ₦7,100,000 monthly. So grateful!",
    name: "Usman Danladi",
    location: "Owerri, Nigeria",
    time: "Just now",
  },
  {
    stars: 4,
    quote: "As a retiree, this provides ₦3,900,000 extra per month.",
    name: "Mama Ngozi Aniemena",
    location: "Jos, Nigeria",
    time: "5 mins ago",
  },
  {
    stars: 5,
    quote: "Earned ₦8,300,000 in 3 months. Best investment ever!",
    name: "Kehinde Akinola",
    location: "Kaduna, Nigeria",
    time: "12 mins ago",
  },
  {
    stars: 5,
    quote: "From zero to ₦5,500,000 in 6 weeks. Unstoppable!",
    name: "Oluwakemi Fasanya",
    location: "Abeokuta, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 4,
    quote: "Reliable income stream: ₦2,700,000–₦3,500,000 monthly.",
    name: "Ikechukwu Igwe",
    location: "Sokoto, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 5,
    quote: "Made ₦12,800,000 in 4 months. Life transformed!",
    name: "Adesola Olawuyi",
    location: "Akure, Nigeria",
    time: "47 mins ago",
  },
  {
    stars: 5,
    quote: "Passive earnings of ₦4,600,000 while chasing my dreams.",
    name: "Olumide Adewale",
    location: "Makurdi, Nigeria",
    time: "Just now",
  },
  {
    stars: 4,
    quote: "Beginner success: ₦1,200,000 in first week. Loving it!",
    name: "Chinwe Okonkwo",
    location: "Lagos, Nigeria",
    time: "8 mins ago",
  },
  {
    stars: 5,
    quote: "Replaced full-time salary with ₦9,400,000 monthly income.",
    name: "Maryam Ibrahim",
    location: "Abuja, Nigeria",
    time: "3 hours ago",
  },
  {
    stars: 5,
    quote: "As a young professional, earning ₦3,100,000/month is freedom.",
    name: "Femi Adesola",
    location: "Port Harcourt, Nigeria",
    time: "22 mins ago",
  },
  {
    stars: 4,
    quote: "Low-effort high-reward: ₦4,800,000 monthly average.",
    name: "Ngozi Okorie",
    location: "Kano, Nigeria",
    time: "1 day ago",
  },
  {
    stars: 5,
    quote: "Earned ₦10,600,000 in 3 months. The support is top-notch!",
    name: "Wale Adeyemi",
    location: "Ibadan, Nigeria",
    time: "15 mins ago",
  },
  {
    stars: 5,
    quote: "From doubt to ₦6,400,000 in passive income. Incredible!",
    name: "Nadia Hassan",
    location: "Enugu, Nigeria",
    time: "4 mins ago",
  },
  {
    stars: 4,
    quote: "Steady ₦2,900,000–₦3,800,000 every month. Highly recommend.",
    name: "Chukwuma Nwachukwu",
    location: "Benin City, Nigeria",
    time: "35 mins ago",
  },
  {
    stars: 5,
    quote: "Achieved ₦11,900,000 in 5 months. This platform rocks!",
    name: "Adunola Adeyemi",
    location: "Warri, Nigeria",
    time: "10 mins ago",
  },
  {
    stars: 5,
    quote: "Left my job for ₦5,300,000/month earnings. Best choice!",
    name: "Kayode Ogunleye",
    location: "Calabar, Nigeria",
    time: "50 mins ago",
  },
  {
    stars: 4,
    quote: "Quick start: ₦1,400,000 in week one. Excited for more!",
    name: "Amaka Eze",
    location: "Owerri, Nigeria",
    time: "2 hours ago",
  },
  {
    stars: 5,
    quote: "Tools and community led to ₦7,500,000 monthly success.",
    name: "Emmanuel Ugwu",
    location: "Jos, Nigeria",
    time: "7 mins ago",
  },
  {
    stars: 5,
    quote: "Financial freedom: ₦13,100,000 in two months. Thank you!",
    name: "Hauwa Abdullahi",
    location: "Kaduna, Nigeria",
    time: "1 hour ago",
  },
  {
    stars: 4,
    quote: "Effortless earnings: ₦3,700,000 monthly average.",
    name: "Kunle Bakare",
    location: "Abeokuta, Nigeria",
    time: "25 mins ago",
  },
  {
    stars: 5,
    quote: "Made ₦3,200,000 during my honeymoon. Truly flexible!",
    name: "Dupe Owolade",
    location: "Sokoto, Nigeria",
    time: "6 mins ago",
  },
];

const AVATAR_COLORS = [
  { bg: "rgba(168,85,247,.22)", color: "#c084fc" },
  { bg: "rgba(56,189,248,.22)", color: "#7dd3fc" },
  { bg: "rgba(52,211,153,.22)", color: "#6ee7b7" },
  { bg: "rgba(251,146,60,.22)", color: "#fdba74" },
  { bg: "rgba(244,63,94,.22)", color: "#fda4af" },
  { bg: "rgba(250,204,21,.22)", color: "#fde047" },
];

const BATCH_SIZE = 12;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function renderStars(count: number): string {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function extractAmount(quote: string): string {
  const match = quote.match(/₦[\d,]+/);
  return match ? match[0] : "";
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  staggerDelay: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  index,
  staggerDelay,
}) => {
  const ac = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      style={{
        background: "rgba(30,16,53,.75)",
        border: "1px solid rgba(168,85,247,.2)",
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        animation: `tsCardIn .5s ease ${staggerDelay}ms both`,
        transition: "transform .25s ease, box-shadow .25s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-5px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 24px rgba(0,0,0,.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* decorative orb */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: ac.bg,
          transform: "translate(30px,-30px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          color: "#fbbf24",
          fontSize: "15px",
          marginBottom: "10px",
          letterSpacing: "2px",
        }}
      >
        {renderStars(testimonial.stars)}
      </div>
      <p
        style={{
          color: "#cbd5e1",
          fontSize: ".88rem",
          lineHeight: 1.6,
          margin: "0 0 16px",
          fontStyle: "italic",
        }}
      >
        "{testimonial.quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: ac.bg,
            border: `1.5px solid ${ac.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: ac.color,
            flexShrink: 0,
          }}
        >
          {getInitials(testimonial.name)}
        </div>
        <div>
          <div
            style={{ fontSize: ".85rem", fontWeight: 600, color: "#f1f5f9" }}
          >
            {testimonial.name}
          </div>
          <div style={{ fontSize: ".75rem", color: "#64748b" }}>
            {testimonial.location}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: ".72rem",
            color: "#475569",
            whiteSpace: "nowrap",
          }}
        >
          {testimonial.time}
        </div>
      </div>
    </div>
  );
};

interface PopupProps {
  testimonial: Testimonial;
  index: number;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ testimonial, index, onClose }) => {
  const ac = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "300px",
        zIndex: 999,
        background: "#1e1035",
        border: "1px solid rgba(168,85,247,.35)",
        borderLeft: "3px solid #a855f7",
        borderRadius: "14px",
        padding: "16px",
        animation: "tsPopIn .45s cubic-bezier(.34,1.56,.64,1) both",
        boxShadow: "0 12px 40px rgba(0,0,0,.5)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          background: "none",
          border: "none",
          color: "#64748b",
          fontSize: "18px",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
            animation: "tsPulse 1.4s infinite",
          }}
        />
        <span style={{ fontSize: ".72rem", color: "#22c55e", fontWeight: 600 }}>
          {testimonial.time}
        </span>
      </div>
      <p
        style={{
          color: "#cbd5e1",
          fontSize: ".82rem",
          lineHeight: 1.5,
          margin: "0 0 12px",
          fontStyle: "italic",
        }}
      >
        "{testimonial.quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: ac.bg,
            border: `1.5px solid ${ac.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 600,
            color: ac.color,
          }}
        >
          {getInitials(testimonial.name)}
        </div>
        <div>
          <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#f1f5f9" }}>
            {testimonial.name}
          </div>
          <div style={{ fontSize: ".72rem", color: "#64748b" }}>
            {testimonial.location}
          </div>
        </div>
        <div style={{ marginLeft: "auto", color: "#fbbf24", fontSize: "13px" }}>
          {renderStars(testimonial.stars)}
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [popup, setPopup] = useState<{
    testimonial: Testimonial;
    index: number;
  } | null>(null);

  // Popup logic
  useEffect(() => {
    const show = () => {
      const idx = Math.floor(Math.random() * testimonials.length);
      setPopup({ testimonial: testimonials[idx], index: idx });
      setTimeout(() => setPopup(null), 6500);
    };
    const t = setTimeout(show, 2800);
    const interval = setInterval(() => {
      if (Math.random() > 0.35) show();
    }, 9000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  // Ticker items (doubled for seamless loop)
  const tickerItems = [...testimonials, ...testimonials];

  return (
    <>
      <style>{`
        @keyframes tsCardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes tsTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes tsPopIn { 0%{opacity:0;transform:translateX(100px) scale(0.85)} 60%{transform:translateX(-6px) scale(1.02)} 100%{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes tsPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes tsShimmer { 0%,100%{background-position:200% center} 50%{background-position:0% center} }
        @keyframes tsFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        style={{
          background: "linear-gradient(160deg,#0f172a 0%,#1e1035 100%)",
          minHeight: "100vh",
          padding: "2.5rem 1.5rem 3rem",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            animation: "tsFadeIn .7s ease both",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(168,85,247,.18)",
              border: "1px solid rgba(168,85,247,.35)",
              color: "#c084fc",
              fontSize: "12px",
              fontWeight: 500,
              padding: "4px 14px",
              borderRadius: "20px",
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                marginRight: "6px",
                verticalAlign: "middle",
                animation: "tsPulse 1.4s infinite",
              }}
            />
            Live member wins
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem,4vw,2.6rem)",
              fontWeight: 700,
              color: "#f8fafc",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Naijans are winning{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#a855f7,#38bdf8,#34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "tsShimmer 3s linear infinite",
                backgroundSize: "200%",
              }}
            >
              every day
            </span>{" "}
            🎉
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "1rem",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Real stories, real earnings — from Lagos to Calabar and everywhere
            in between
          </p>
        </div>

        {/* Ticker */}
        <div
          style={{
            overflow: "hidden",
            marginBottom: "2.5rem",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "60px",
              background: "linear-gradient(to right,#0f172a,transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "60px",
              background: "linear-gradient(to left,#0f172a,transparent)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "14px",
              width: "max-content",
              animation: "tsTicker 60s linear infinite",
            }}
          >
            {tickerItems.map((t, i) => {
              const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const amount = extractAmount(t.quote);
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(30,16,53,.8)",
                    border: "1px solid rgba(168,85,247,.2)",
                    borderRadius: "30px",
                    padding: "8px 18px 8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: ac.bg,
                      border: `1.5px solid ${ac.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: ac.color,
                    }}
                  >
                    {getInitials(t.name)}
                  </div>
                  <span style={{ fontSize: ".8rem", color: "#94a3b8" }}>
                    {t.name}
                  </span>
                  {amount && (
                    <span
                      style={{
                        fontSize: ".8rem",
                        color: "#22c55e",
                        fontWeight: 600,
                      }}
                    >
                      {amount}
                    </span>
                  )}
                  <span style={{ color: "#fbbf24", fontSize: "11px" }}>
                    {renderStars(t.stars)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))",
            gap: "16px",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {visibleTestimonials.map((t, i) => (
            <TestimonialCard
              key={i}
              testimonial={t}
              index={i}
              staggerDelay={i < BATCH_SIZE ? (i % BATCH_SIZE) * 60 : 0}
            />
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              onClick={() =>
                setVisibleCount((c) =>
                  Math.min(c + BATCH_SIZE, testimonials.length),
                )
              }
              style={{
                background: "rgba(168,85,247,.2)",
                border: "1px solid rgba(168,85,247,.4)",
                color: "#c084fc",
                padding: "10px 28px",
                borderRadius: "24px",
                fontSize: ".9rem",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(168,85,247,.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(168,85,247,.2)";
              }}
            >
              Load more stories ✨
            </button>
          </div>
        )}
      </div>

      {/* Popup */}
      {popup && (
        <Popup
          testimonial={popup.testimonial}
          index={popup.index}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  );
};

export default Testimonials;
