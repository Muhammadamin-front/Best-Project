const prophetDuas = [
  {
    prophet: "Yunus alayhissalom duosi",
    occasion: "Qiyinchilik va tavba paytida",
    arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    meaning: "Sendan o‘zga iloh yo‘q. Seni pok deb bilaman. Darhaqiqat, men xato qilganlardan bo‘ldim.",
    source: "Anbiyo surasi, 21:87",
    href: "https://quran.com/21/87",
  },
  {
    prophet: "Muso alayhissalom duosi",
    occasion: "Yaxshilik va rizqqa muhtojlikda",
    arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    meaning: "Robbim, Sen menga tushiradigan har qanday yaxshilikka muhtojman.",
    source: "Qasas surasi, 28:24",
    href: "https://quran.com/28/24",
  },
  {
    prophet: "Ibrohim alayhissalom duosi",
    occasion: "Oila va namoz uchun",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    meaning: "Robbim, meni va zurriyotimni namozni to‘kis ado etuvchilardan qil. Robbimiz, duoyimni qabul et.",
    source: "Ibrohim surasi, 14:40",
    href: "https://quran.com/14/40",
  },
  {
    prophet: "Zakariyo alayhissalom duosi",
    occasion: "Solih zurriyot so‘raganda",
    arabic: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ",
    meaning: "Robbim, menga O‘z huzuringdan pok zurriyot ato et. Albatta, Sen duoni eshituvchisan.",
    source: "Oli Imron surasi, 3:38",
    href: "https://quran.com/3/38",
  },
];

export default function WelcomeView({ firstName, onEnter }: { firstName: string; onEnter: () => void }) {
  return <div className="welcome-view">
    <section className="welcome-hero">
      <div className="welcome-copy">
        <p className="eyebrow">ASSALOMU ALAYKUM, {firstName.toUpperCase()}</p>
        <h1>Bir duoda uchrashadigan mehrli hamjamiyat.</h1>
        <p className="welcome-lead">Duodosh — tashvishingizni odob bilan ulashish, boshqa musulmonlarni duoda eslash va yolg‘iz emasligingizni his qilish uchun xavfsiz makon.</p>
        <div className="welcome-actions"><button className="primary-button welcome-primary" onClick={onEnter}>Bismillah, duo oqimiga kirish <span>→</span></button><a className="welcome-secondary" href="#qanday-ishlaydi">Avval qanday ishlashini ko‘ring</a></div>
        <div className="welcome-trust"><span>◌ Anonim ulashish</span><span>♡ Hukmsiz dalda</span><span>⌒ Tasdiqlangan masjidlar</span></div>
      </div>
      <aside className="hadith-card">
        <span className="hadith-mark">☾</span>
        <p className="arabic compact" lang="ar" dir="rtl">دَعَا لِأَخِيهِ بِظَهْرِ الْغَيْبِ</p>
        <blockquote>“Musulmon birodari uchun uning yo‘qligida duo qilsa, farishta: «Omin, senga ham shunday bo‘lsin», deydi.”</blockquote>
        <a href="https://sunnah.com/muslim:2732a" target="_blank" rel="noreferrer">Sahih Muslim, 2732a ↗</a>
      </aside>
    </section>

    <section className="brother-prayer" aria-labelledby="brother-prayer-title">
      <div className="section-heading"><p className="eyebrow">QUR’ONDAGI BIRODARLIK DUOSI</p><h2 id="brother-prayer-title">Boshqani duoda eslash — qalblarni yaqinlashtiradi.</h2></div>
      <div className="verse-card">
        <p className="arabic" lang="ar" dir="rtl">رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ</p>
        <p><b>Mazmuni:</b> “Robbimiz, bizni va imonda bizdan ilgari o‘tgan birodarlarimizni mag‘firat qil. Mo‘minlarga nisbatan qalbimizda gina qoldirma.”</p>
        <a href="https://quran.com/59/10" target="_blank" rel="noreferrer">Hashr surasi, 59:10 — oyatni to‘liq o‘qish ↗</a>
      </div>
    </section>

    <section className="how-section" id="qanday-ishlaydi" aria-labelledby="how-title">
      <div className="section-heading centered"><p className="eyebrow">DUODOSH QANDAY ISHLAYDI?</p><h2 id="how-title">Uchta sodda va mehrli qadam</h2><p>Avval tushuning, keyin xotirjam boshlang.</p></div>
      <div className="how-grid">
        <article><span>1</span><h3>Niyatni o‘qing</h3><p>Har bir post ortida haqiqiy inson bor. Shaxsiy ma’lumot so‘ramang va hukm qilmang.</p></article>
        <article><span>2</span><h3>Duoda eslang</h3><p>“Duo qildim” tugmasi bilan insonni yolg‘iz emasligini bildiring. Dalda yozish ixtiyoriy.</p></article>
        <article><span>3</span><h3>Niyatingizni ulashing</h3><p>Uch insonni duoda eslagach, o‘z so‘rovingizni yozing. Shoshilinch holatlar bundan mustasno.</p></article>
      </div>
    </section>

    <section className="prophet-section" aria-labelledby="prophet-title">
      <div className="section-heading"><p className="eyebrow">QUR’ONDAGI MASHHUR DUOLAR</p><h2 id="prophet-title">Payg‘ambarlar qilgan duolardan o‘rganamiz</h2><p>Tarjimalar oyat mazmunini qisqa tushuntirish uchun berildi. Asl oyatni havola orqali o‘qishingiz mumkin.</p></div>
      <div className="dua-library">{prophetDuas.map((dua) => <article key={dua.source}><div><span>{dua.occasion}</span><h3>{dua.prophet}</h3></div><p className="arabic" lang="ar" dir="rtl">{dua.arabic}</p><p className="dua-meaning"><b>Mazmuni:</b> {dua.meaning}</p><a href={dua.href} target="_blank" rel="noreferrer">{dua.source} ↗</a></article>)}</div>
    </section>

    <section className="welcome-cta"><span>♡</span><div><p className="eyebrow">DUODA BIRGAMIZ</p><h2>Bugun bir insonni duoda eslang.</h2><p>Mehr kichik bir niyatdan boshlanadi.</p></div><button className="primary-button" onClick={onEnter}>Duo oqimini ochish <span>→</span></button></section>
  </div>;
}
