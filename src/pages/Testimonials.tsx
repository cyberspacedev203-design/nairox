import React, { useState, useEffect } from 'react';

interface Testimonial {
  stars: string;
  quote: string;
  name: string;
  location: string;
  avatar: string;
  time: string;
}

const testimonials: Testimonial[] = [
  {
    stars: "★★★★★",
    quote: "This website changed my life! I earned ₦3,450,000 in my first month just by following the simple steps. From a broke college student to financially free.",
    name: "Sarah M.",
    location: "Texas, USA",
    avatar: "SM",
    time: "5 mins ago"
  },
  {
    stars: "★★★★★",
    quote: "I was skeptical at first, but after 3 weeks I made over ₦1,200,000. The best part? It works while I sleep. Passive income at its finest!",
    name: "Marcus T.",
    location: "London, UK",
    avatar: "MT",
    time: "12 mins ago"
  },
  {
    stars: "★★★★☆",
    quote: "As a single mom, this has been a game-changer. Earned ₦890,000 last month working only 2 hours a day. Finally can afford extras for my kids.",
    name: "Elena Rodriguez",
    location: "California, USA",
    avatar: "ER",
    time: "2 hours ago"
  },
  {
    stars: "★★★★★",
    quote: "Made ₦7,650,000 in 45 days. I quit my 9-5 last week. The community and tools are unmatched.",
    name: "David Chen",
    location: "Singapore",
    avatar: "DC",
    time: "1 hour ago"
  },
  {
    stars: "★★★★★",
    quote: "Retired teacher here. This platform gave me purpose again and ₦2,340,000 extra per month. Love it!",
    name: "Margaret O.",
    location: "Florida, USA",
    avatar: "MO",
    time: "47 mins ago"
  },
  {
    stars: "★★★★★",
    quote: "From zero to ₦4,200,000 in 6 weeks. The step-by-step guides are so easy even my grandma could do it.",
    name: "Jamal Wright",
    location: "New York, USA",
    avatar: "JW",
    time: "Just now"
  },
  {
    stars: "★★★★☆",
    quote: "Earned my first ₦500,000 in under 10 days. Now consistently pulling ₦1,800,000–₦2,500,000 monthly.",
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "PS",
    time: "8 mins ago"
  },
  {
    stars: "★★★★★",
    quote: "I love how beginner-friendly it is. Made ₦9,100,000 so far and I'm only 19!",
    name: "Alex Rivera",
    location: "Mexico City, Mexico",
    avatar: "AR",
    time: "3 hours ago"
  },
  {
    stars: "★★★★★",
    quote: "Best decision ever. Replaced my salary (₦4,800,000/month) and now travel full-time.",
    name: "Sophie Laurent",
    location: "Paris, France",
    avatar: "SL",
    time: "22 mins ago"
  },
  {
    stars: "★★★★☆",
    quote: "As a truck driver, I do this on the road. Already banked ₦3,670,000 in passive earnings.",
    name: "Robert Kline",
    location: "Chicago, USA",
    avatar: "RK",
    time: "1 day ago"
  },
  { stars: "★★★★★", quote: "Turned my hobby into ₦2,890,000/month. Can't thank the team enough!", name: "Liam Patel", location: "Sydney, Australia", avatar: "LP", time: "15 mins ago" },
  { stars: "★★★★★", quote: "My side hustle exploded to ₦6,200,000 last month. Finally debt-free!", name: "Fatima Ali", location: "Dubai, UAE", avatar: "FA", time: "4 mins ago" },
  { stars: "★★★★☆", quote: "Consistent ₦1,100,000–₦1,600,000 every single month. Super reliable.", name: "Carlos Mendoza", location: "Madrid, Spain", avatar: "CM", time: "35 mins ago" },
  { stars: "★★★★★", quote: "Earned ₦12,450,000 in 3 months. This is the real deal.", name: "Aisha Khan", location: "Lahore, Pakistan", avatar: "AK", time: "10 mins ago" },
  { stars: "★★★★★", quote: "From unemployed to making ₦2,750,000/month from home. Mind blown.", name: "Tyler Brooks", location: "Atlanta, USA", avatar: "TB", time: "50 mins ago" },
  { stars: "★★★★☆", quote: "Great for beginners. I made ₦780,000 in week one!", name: "Mei Ling", location: "Beijing, China", avatar: "ML", time: "2 hours ago" },
  { stars: "★★★★★", quote: "The support is incredible. Hit ₦5,340,000 and still growing strong.", name: "James Okafor", location: "Lagos, Nigeria", avatar: "JO", time: "7 mins ago" },
  { stars: "★★★★★", quote: "Quit my corporate job after earning ₦8,900,000 in two months. Freedom!", name: "Isabella Rossi", location: "Rome, Italy", avatar: "IR", time: "1 hour ago" },
  { stars: "★★★★☆", quote: "Low effort, high reward. Averaging ₦2,100,000 monthly now.", name: "Kwame Nkrumah", location: "Accra, Ghana", avatar: "KN", time: "25 mins ago" },
  { stars: "★★★★★", quote: "Made ₦1,450,000 while on vacation in Bali. Truly location independent.", name: "Hannah Müller", location: "Berlin, Germany", avatar: "HM", time: "6 mins ago" },
  // Adding more testimonials to reach 50
  { stars: "★★★★★", quote: "Started with nothing, now earning ₦4,500,000 monthly. This platform is gold!", name: "Ahmed Hassan", location: "Cairo, Egypt", avatar: "AH", time: "Just now" },
  { stars: "★★★★☆", quote: "As a freelancer, this doubled my income to ₦3,200,000 per month.", name: "Nina Petrov", location: "Moscow, Russia", avatar: "NP", time: "5 mins ago" },
  { stars: "★★★★★", quote: "Earned ₦6,800,000 in 2 months. Life-changing opportunity!", name: "Raj Kumar", location: "Delhi, India", avatar: "RK", time: "12 mins ago" },
  { stars: "★★★★★", quote: "From part-time to full-time earner: ₦5,100,000 monthly now.", name: "Maria Santos", location: "São Paulo, Brazil", avatar: "MS", time: "2 hours ago" },
  { stars: "★★★★☆", quote: "Consistent ₦1,900,000 every month. Perfect for busy parents.", name: "John Smith", location: "Toronto, Canada", avatar: "JS", time: "1 hour ago" },
  { stars: "★★★★★", quote: "Made ₦10,200,000 in 4 months. Unbelievable results!", name: "Yuki Tanaka", location: "Tokyo, Japan", avatar: "YT", time: "47 mins ago" },
  { stars: "★★★★★", quote: "Passive income dream: ₦3,750,000 while I travel the world.", name: "Emma Wilson", location: "Melbourne, Australia", avatar: "EW", time: "Just now" },
  { stars: "★★★★☆", quote: "Beginner-friendly and profitable. Earned ₦950,000 in first week.", name: "Carlos Ruiz", location: "Buenos Aires, Argentina", avatar: "CR", time: "8 mins ago" },
  { stars: "★★★★★", quote: "Replaced my job income with ₦7,300,000 monthly earnings.", name: "Anna Kowalski", location: "Warsaw, Poland", avatar: "AK", time: "3 hours ago" },
  { stars: "★★★★★", quote: "As a student, this gave me financial freedom: ₦2,600,000/month.", name: "Mohammed Al-Farsi", location: "Riyadh, Saudi Arabia", avatar: "MA", time: "22 mins ago" },
  { stars: "★★★★☆", quote: "Low-risk, high-reward. Averaging ₦4,100,000 monthly.", name: "Lisa Chen", location: "Vancouver, Canada", avatar: "LC", time: "1 day ago" },
  { stars: "★★★★★", quote: "Earned ₦8,500,000 in 3 months. The community is amazing!", name: "Pierre Dubois", location: "Montreal, Canada", avatar: "PD", time: "15 mins ago" },
  { stars: "★★★★★", quote: "From skeptic to believer: ₦5,800,000 in passive income.", name: "Zara Ahmed", location: "Karachi, Pakistan", avatar: "ZA", time: "4 mins ago" },
  { stars: "★★★★☆", quote: "Consistent ₦2,300,000–₦3,000,000 every single month.", name: "Diego Fernandez", location: "Barcelona, Spain", avatar: "DF", time: "35 mins ago" },
  { stars: "★★★★★", quote: "Made ₦9,750,000 in 5 months. This is revolutionary!", name: "Fatima Yusuf", location: "Abuja, Nigeria", avatar: "FY", time: "10 mins ago" },
  { stars: "★★★★★", quote: "Quit my dead-end job after earning ₦4,200,000/month.", name: "Oliver Brown", location: "Manchester, UK", avatar: "OB", time: "50 mins ago" },
  { stars: "★★★★☆", quote: "Perfect for side income. Made ₦1,150,000 in week one!", name: "Sofia Kim", location: "Seoul, South Korea", avatar: "SK", time: "2 hours ago" },
  { stars: "★★★★★", quote: "The tools are incredible. Hit ₦6,900,000 and counting.", name: "Victor Okafor", location: "Port Harcourt, Nigeria", avatar: "VO", time: "7 mins ago" },
  { stars: "★★★★★", quote: "Financial independence achieved: ₦11,200,000 in two months.", name: "Giulia Romano", location: "Milan, Italy", avatar: "GR", time: "1 hour ago" },
  { stars: "★★★★☆", quote: "Easy to use and profitable. Averaging ₦3,400,000 monthly.", name: "Kofi Asante", location: "Kumasi, Ghana", avatar: "KA", time: "25 mins ago" },
  { stars: "★★★★★", quote: "Made ₦2,800,000 while on a family vacation. Amazing!", name: "Leah Schmidt", location: "Vienna, Austria", avatar: "LS", time: "6 mins ago" },
  { stars: "★★★★★", quote: "Started small, now earning ₦7,100,000 monthly. Grateful!", name: "Hassan Ali", location: "Doha, Qatar", avatar: "HA", time: "Just now" },
  { stars: "★★★★☆", quote: "As a retiree, this provides ₦3,900,000 extra per month.", name: "Margaret Wong", location: "Hong Kong", avatar: "MW", time: "5 mins ago" },
  { stars: "★★★★★", quote: "Earned ₦8,300,000 in 3 months. Best investment ever!", name: "Ravi Patel", location: "Ahmedabad, India", avatar: "RP", time: "12 mins ago" },
  { stars: "★★★★★", quote: "From zero to ₦5,500,000 in 6 weeks. Unstoppable!", name: "Camila Silva", location: "Rio de Janeiro, Brazil", avatar: "CS", time: "2 hours ago" },
  { stars: "★★★★☆", quote: "Reliable income stream: ₦2,700,000–₦3,500,000 monthly.", name: "Michael Johnson", location: "Sydney, Australia", avatar: "MJ", time: "1 hour ago" },
  { stars: "★★★★★", quote: "Made ₦12,800,000 in 4 months. Life transformed!", name: "Aiko Suzuki", location: "Osaka, Japan", avatar: "AS", time: "47 mins ago" },
  { stars: "★★★★★", quote: "Passive earnings of ₦4,600,000 while pursuing my dreams.", name: "Olivia Taylor", location: "Auckland, NZ", avatar: "OT", time: "Just now" },
  { stars: "★★★★☆", quote: "Beginner success: ₦1,200,000 in first week. Loving it!", name: "Javier Morales", location: "Mexico City, Mexico", avatar: "JM", time: "8 mins ago" },
  { stars: "★★★★★", quote: "Replaced full-time salary with ₦9,400,000 monthly income.", name: "Katarzyna Nowak", location: "Krakow, Poland", avatar: "KN", time: "3 hours ago" },
  { stars: "★★★★★", quote: "As a young professional, earning ₦3,100,000/month is freedom.", name: "Omar Al-Rashid", location: "Jeddah, Saudi Arabia", avatar: "OA", time: "22 mins ago" },
  { stars: "★★★★☆", quote: "Low-effort high-reward: ₦4,800,000 monthly average.", name: "Jessica Liu", location: "Shanghai, China", avatar: "JL", time: "1 day ago" },
  { stars: "★★★★★", quote: "Earned ₦10,600,000 in 3 months. The support is top-notch!", name: "Jean-Claude Martin", location: "Lyon, France", avatar: "JM", time: "15 mins ago" },
  { stars: "★★★★★", quote: "From doubt to ₦6,400,000 in passive income. Incredible!", name: "Nadia Hassan", location: "Islamabad, Pakistan", avatar: "NH", time: "4 mins ago" },
  { stars: "★★★★☆", quote: "Steady ₦2,900,000–₦3,800,000 every month. Highly recommend.", name: "Fernando Garcia", location: "Madrid, Spain", avatar: "FG", time: "35 mins ago" },
  { stars: "★★★★★", quote: "Achieved ₦11,900,000 in 5 months. This platform rocks!", name: "Grace Adebayo", location: "Ibadan, Nigeria", avatar: "GA", time: "10 mins ago" },
  { stars: "★★★★★", quote: "Left my job for ₦5,300,000/month earnings. Best choice!", name: "William Green", location: "Birmingham, UK", avatar: "WG", time: "50 mins ago" },
  { stars: "★★★★☆", quote: "Quick start: ₦1,400,000 in week one. Excited for more!", name: "Min-Ji Park", location: "Busan, South Korea", avatar: "MP", time: "2 hours ago" },
  { stars: "★★★★★", quote: "Tools and community led to ₦7,500,000 monthly success.", name: "Emmanuel Nwosu", location: "Enugu, Nigeria", avatar: "EN", time: "7 mins ago" },
  { stars: "★★★★★", quote: "Financial freedom: ₦13,100,000 in two months. Thank you!", name: "Francesca Bianchi", location: "Florence, Italy", avatar: "FB", time: "1 hour ago" },
  { stars: "★★★★☆", quote: "Effortless earnings: ₦3,700,000 monthly average.", name: "Kojo Mensah", location: "Takoradi, Ghana", avatar: "KM", time: "25 mins ago" },
  { stars: "★★★★★", quote: "Made ₦3,200,000 during my honeymoon. Truly flexible!", name: "Anna Weber", location: "Munich, Germany", avatar: "AW", time: "6 mins ago" }
];

const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTestimonial, setPopupTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const showRandomPopup = () => {
      const random = testimonials[Math.floor(Math.random() * testimonials.length)];
      setPopupTestimonial(random);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 6500);
    };

    const initialTimeout = setTimeout(showRandomPopup, 3000);
    const interval = setInterval(() => {
      if (Math.random() > 0.4) showRandomPopup();
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const hidePopup = () => setShowPopup(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-4">What Our Members Are Saying</h1>
      <p className="text-center text-slate-400 mb-12">Join thousands who have earned massively — real stories from real people</p>

      {/* Sliding Carousel */}
      <div className="overflow-hidden relative max-w-6xl mx-auto">
        <div
          className="flex gap-5 transition-transform duration-600 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 340}px)` }}
        >
          {testimonials.map((t, index) => (
            <div key={index} className="min-w-80 bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
              <div className="text-yellow-400 text-xl mb-3">{t.stars}</div>
              <div className="italic text-slate-300 leading-relaxed mb-4">"{t.quote}"</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center font-bold text-slate-300">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-slate-500">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Popup */}
      {showPopup && popupTestimonial && (
        <div className="fixed bottom-8 right-8 bg-slate-800 rounded-lg shadow-2xl p-4 w-80 flex items-start gap-4 z-50 border-l-4 border-green-500">
          <div className="flex-1">
            <div className="text-sm text-green-400 font-semibold mb-2">{popupTestimonial.time}</div>
            <div className="italic text-slate-300 leading-relaxed mb-3">"{popupTestimonial.quote}"</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-slate-300 text-sm">
                {popupTestimonial.avatar}
              </div>
              <div>
                <div className="font-semibold text-sm">{popupTestimonial.name}</div>
                <div className="text-xs text-slate-500">{popupTestimonial.location}</div>
              </div>
            </div>
          </div>
          <span className="cursor-pointer text-xl text-slate-400 hover:text-white" onClick={hidePopup}>×</span>
        </div>
      )}
    </div>
  );
};

export default Testimonials;