"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

const savedDuasStorageKey = "duodosh:saved-duas";
const savedDuasEvent = "duodosh:saved-duas-changed";

function subscribeSavedDuas(callback: () => void) {
  const notify = () => callback();
  window.addEventListener(savedDuasEvent, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(savedDuasEvent, notify);
    window.removeEventListener("storage", notify);
  };
}

function getSavedDuasSnapshot() {
  return window.localStorage.getItem(savedDuasStorageKey) ?? "[]";
}

function getSavedDuasServerSnapshot() {
  return "[]";
}

const prophetDuas = [
  {
    prophet: "Yunus alayhissalom duosi",
    category: "Tavba",
    occasion: "Qiyinchilik va tavba paytida",
    arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    reading: "La ilaha illa Anta, subhanaka, inni kuntu minaz-zolimin.",
    meaning: "Sendan o‘zga iloh yo‘q. Seni pok deb bilaman. Darhaqiqat, men xato qilganlardan bo‘ldim.",
    history: "Yunus alayhissalom qavmidan ranjib ketganlaridan so‘ng zulmatlar ichida Allohga shu kalimalar bilan yuzlandilar. Alloh u zotning duosini qabul qilib, g‘amdan qutqarganini keyingi oyatda bayon qiladi.",
    lesson: "Eng tor vaziyatda ham tavhid, tasbeh va tavba bilan Allohga qaytish umid eshigini ochadi.",
    source: "Anbiyo surasi, 21:87",
    href: "https://quran.com/21/87",
  },
  {
    prophet: "Muso alayhissalom duosi",
    category: "Rizq",
    occasion: "Yaxshilik va rizqqa muhtojlikda",
    arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    reading: "Robbi inni lima anzalta ilayya min xoyrin faqir.",
    meaning: "Robbim, Sen menga tushiradigan har qanday yaxshilikka muhtojman.",
    history: "Muso alayhissalom Madyanga yetib kelib, ikki ayolning chorvasini sug‘orib berdilar. Soyaga chekingach, yolg‘iz va muhtoj holatda bu qisqa duoni qildilar; shundan keyin ulardan biri u zotni otasining huzuriga taklif qildi.",
    lesson: "Yaxshilik qilgandan keyin natijani Allohdan kutish va ehtiyojni kamtarlik bilan aytish.",
    source: "Qasas surasi, 28:24",
    href: "https://quran.com/28/24",
  },
  {
    prophet: "Ibrohim alayhissalom duosi",
    category: "Oila",
    occasion: "Oila va namoz uchun",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    reading: "Robbij’alni muqimas-solati va min zurriyyati, robbana va taqobbal duoi.",
    meaning: "Robbim, meni va zurriyotimni namozni to‘kis ado etuvchilardan qil. Robbimiz, duoyimni qabul et.",
    history: "Ibrohim alayhissalom oilalarining bir qismini Baytul Harom yaqinidagi ekinsiz vodiyga joylashtirganlarini eslab, zurriyotlari namozni barpo etishini so‘radilar. Bu duo shukr, oila va ibodat haqidagi oyatlar orasida keladi.",
    lesson: "Oila uchun eng ulug‘ niyatlardan biri — ibodatda sobitlik va duolarning qabulini so‘rash.",
    source: "Ibrohim surasi, 14:40",
    href: "https://quran.com/14/40",
  },
  {
    prophet: "Zakariyo alayhissalom duosi",
    category: "Oila",
    occasion: "Solih zurriyot so‘raganda",
    arabic: "رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ",
    reading: "Robbi hab li min ladunka zurriyyatan toyyibatan, innaka sami’ud-duo.",
    meaning: "Robbim, menga O‘z huzuringdan pok zurriyot ato et. Albatta, Sen duoni eshituvchisan.",
    history: "Zakariyo alayhissalom Maryam alayhassalom huzurida g‘ayrioddiy rizqni ko‘rib, yoshi ulug‘ bo‘lsa ham Allohdan solih zurriyot so‘radilar. Farishtalar namozda turgan paytlarida Yahyo alayhissalomning xushxabarini berdilar.",
    lesson: "Imkonsizdek ko‘ringan niyatni ham Allohdan yaxshi gumon bilan so‘rash mumkin.",
    source: "Oli Imron surasi, 3:38",
    href: "https://quran.com/3/38",
  },
  {
    prophet: "Odam va Havo alayhimassalom duosi",
    category: "Tavba",
    occasion: "Tavba va mag‘firat so‘raganda",
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    reading: "Robbana zolamna anfusana va illam tag‘fir lana va tarhamna lanakunanna minal-xosirin.",
    meaning: "Robbimiz, biz o‘zimizga zulm qildik. Agar bizni mag‘firat qilmasang va rahm etmasang, albatta, ziyon ko‘ruvchilardan bo‘lamiz.",
    history: "Odam va Havo alayhimassalom shaytonning aldovidan keyin taqiqlangan daraxtdan totib, xatolarini tan oldilar. Ular aybni boshqaga yuklamay, mag‘firat va rahmatni so‘rab Allohga qaytdilar.",
    lesson: "Chin tavba xatoni tan olish, mag‘firat so‘rash va Allohning rahmatidan umid qilishdan boshlanadi.",
    source: "A’rof surasi, 7:23",
    href: "https://quran.com/7/23",
  },
  {
    prophet: "Ayyub alayhissalom duosi",
    category: "Shifo",
    occasion: "Kasallik va musibat paytida",
    arabic: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    reading: "Anni massaniyad-durru va Anta arhamur-rohimin.",
    meaning: "Menga musibat yetdi. Sen esa rahm qiluvchilarning eng Rahmlisisan.",
    history: "Ayyub alayhissalom boshlariga tushgan musibatni odob bilan Robbilariga arz qildilar va Uning rahmatini zikr etdilar. Keyingi oyatda Alloh duoni qabul qilib, musibatni ketkazgani va oilalarini qaytargani bayon qilinadi.",
    lesson: "Dardni inkor qilmasdan, shikoyatni odamga emas, umid bilan Allohga olib borish.",
    source: "Anbiyo surasi, 21:83–84",
    href: "https://quran.com/21/83-84",
  },
  {
    prophet: "Sulaymon alayhissalom duosi",
    category: "Shukr",
    occasion: "Ne’mat uchun shukr qilganda",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ",
    reading: "Robbi avzi’ni an ashkura ni’matakallati an’amta alayya va ala validayya va an a’mala solihan tarzohu va adxilni birohmatika fi ibadikas-solihin.",
    meaning: "Robbim, menga va ota-onamga bergan ne’matingga shukr qilishimni, Sen rozi bo‘ladigan amal qilishimni ilhom et va rahmating bilan solih bandalaring qatoriga kirit.",
    history: "Sulaymon alayhissalom lashkarlari bilan chumolilar vodiysiga kelganlarida bir chumolining ogohlantirishini tushunib, tabassum qildilar. Buyuk ne’mat qarshisida shu duo bilan shukr, solih amal va rahmatni so‘radilar.",
    lesson: "Qudrat va imkoniyat ko‘payganda eng to‘g‘ri javob — shukr va Alloh rozi bo‘ladigan amal.",
    source: "Naml surasi, 27:19",
    href: "https://quran.com/27/19",
  },
  {
    prophet: "Nuh alayhissalom duosi",
    category: "Oila",
    occasion: "Oila va mo‘minlar uchun",
    arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ",
    reading: "Robbig‘fir li va li-validayya va liman daxola baytiya mo‘minan va lil-mo‘minina val-mo‘minat.",
    meaning: "Robbim, meni, ota-onamni, uyimga mo‘min bo‘lib kirganlarni hamda barcha mo‘min erkak va ayollarni mag‘firat qil.",
    history: "Nuh surasida u zotning qavmlarini kecha-yu kunduz Allohga chaqirganlari bayon qilinadi. Suraning yakunida Nuh alayhissalom o‘zlari bilangina cheklanmay, ota-onalari va barcha mo‘minlar uchun mag‘firat so‘radilar.",
    lesson: "Duo doirasini o‘zimizdan oilamizga va butun mo‘minlar hamjamiyatiga kengaytirish.",
    source: "Nuh surasi, 71:28",
    href: "https://quran.com/71/28",
  },
];

function TypingHeadline({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let index = 0;
    let timer = 0;
    const typeNext = () => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index < text.length) timer = window.setTimeout(typeNext, index % 5 === 0 ? 58 : 36);
      else setComplete(true);
    };
    timer = window.setTimeout(typeNext, 280);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, text]);

  const displayedText = reduceMotion ? text : visible;
  const isComplete = Boolean(reduceMotion) || complete;

  return <span className="typing-headline" aria-label={text}>
    <span className="typing-placeholder" aria-hidden="true">{text}</span>
    <span className="typing-output" aria-hidden="true">{displayedText}<i className={isComplete ? "typing-caret complete" : "typing-caret"} /></span>
  </span>;
}

function ProphetDuaCard({ dua, index, reduceMotion, saved, copied, onToggleSaved, onCopy }: { dua: (typeof prophetDuas)[number]; index: number; reduceMotion: boolean; saved: boolean; copied: boolean; onToggleSaved: () => void; onCopy: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);

  function showHistory() {
    setIsFlipped(true);
    window.requestAnimationFrame(() => backButton.current?.focus());
  }

  function showPrayer() {
    setIsFlipped(false);
    window.requestAnimationFrame(() => frontButton.current?.focus());
  }

  return <motion.div
    className={isFlipped ? "dua-flip-card is-flipped" : "dua-flip-card"}
    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: .985 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: .15 }}
    transition={reduceMotion ? { duration: 0 } : { duration: .5, delay: (index % 4) * .07, ease: [.22, 1, .36, 1] }}
    onMouseEnter={() => setIsFlipped(true)}
    onMouseLeave={(event) => !event.currentTarget.contains(document.activeElement) && setIsFlipped(false)}
  >
    <div className="dua-flip-inner">
      <article className="dua-flip-face dua-flip-front" aria-hidden={isFlipped}>
        <div className="dua-flip-orbit" aria-hidden="true"><i /><i /><i /></div>
        <div><span>{dua.occasion}</span><h3>{dua.prophet}</h3></div>
        <p className="arabic" lang="ar" dir="rtl">{dua.arabic}</p>
        <p className="transliteration" lang="uz-Latn"><span>O‘qilishi:</span> {dua.reading}</p>
        <p className="dua-meaning"><b>Mazmuni:</b> {dua.meaning}</p>
        <a href={dua.href} target="_blank" rel="noreferrer" tabIndex={isFlipped ? -1 : 0}>{dua.source} ↗</a>
        <div className="dua-quick-actions">
          <button type="button" onClick={onToggleSaved} tabIndex={isFlipped ? -1 : 0} aria-pressed={saved}>{saved ? "♥ Saqlandi" : "♡ Saqlash"}</button>
          <button type="button" onClick={onCopy} tabIndex={isFlipped ? -1 : 0}>{copied ? "✓ Nusxalandi" : "⧉ Nusxalash"}</button>
        </div>
        <button ref={frontButton} className="dua-flip-button" type="button" onClick={showHistory} tabIndex={isFlipped ? -1 : 0} aria-pressed={isFlipped}><span>Duoning tarixini ko‘rish</span><b aria-hidden="true">↻</b></button>
      </article>

      <article className="dua-flip-face dua-flip-back" aria-hidden={!isFlipped}>
        <div><span>DUONING TARIXI</span><h3>{dua.prophet}</h3></div>
        <p className="dua-history">{dua.history}</p>
        <div className="dua-lesson"><span>BUGUNGI SABOQ</span><p>{dua.lesson}</p></div>
        <a href={dua.href} target="_blank" rel="noreferrer" tabIndex={isFlipped ? 0 : -1}>Qur’ondagi manbani ochish — {dua.source} ↗</a>
        <div className="dua-quick-actions">
          <button type="button" onClick={onToggleSaved} tabIndex={isFlipped ? 0 : -1} aria-pressed={saved}>{saved ? "♥ Saqlandi" : "♡ Saqlash"}</button>
          <button type="button" onClick={onCopy} tabIndex={isFlipped ? 0 : -1}>{copied ? "✓ Nusxalandi" : "⧉ Nusxalash"}</button>
        </div>
        <button ref={backButton} className="dua-flip-button back" type="button" onClick={showPrayer} tabIndex={isFlipped ? 0 : -1} aria-pressed={isFlipped}><span>Duoni ko‘rish</span><b aria-hidden="true">↺</b></button>
      </article>
    </div>
  </motion.div>;
}

export default function WelcomeView({ firstName, onEnter }: { firstName: string; onEnter: () => void }) {
  const reduceMotion = useReducedMotion();
  const [duaQuery, setDuaQuery] = useState("");
  const [duaCategory, setDuaCategory] = useState("Barchasi");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [copiedSource, setCopiedSource] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);
  const savedDuasSnapshot = useSyncExternalStore(subscribeSavedDuas, getSavedDuasSnapshot, getSavedDuasServerSnapshot);
  const savedDuas = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(savedDuasSnapshot));
    } catch {
      return new Set<string>();
    }
  }, [savedDuasSnapshot]);
  const categories = useMemo(() => ["Barchasi", ...new Set(prophetDuas.map((dua) => dua.category))], []);
  const visibleDuas = useMemo(() => {
    const query = duaQuery.trim().toLocaleLowerCase("uz");
    return prophetDuas.filter((dua) => {
      const matchesCategory = duaCategory === "Barchasi" || dua.category === duaCategory;
      const matchesSaved = !showSavedOnly || savedDuas.has(dua.source);
      const searchable = `${dua.prophet} ${dua.occasion} ${dua.reading} ${dua.meaning} ${dua.category}`.toLocaleLowerCase("uz");
      return matchesCategory && matchesSaved && (!query || searchable.includes(query));
    });
  }, [duaCategory, duaQuery, savedDuas, showSavedOnly]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  function toggleSavedDua(source: string) {
    const next = new Set(savedDuas);
    if (next.has(source)) next.delete(source);
    else next.add(source);
    window.localStorage.setItem(savedDuasStorageKey, JSON.stringify([...next]));
    window.dispatchEvent(new Event(savedDuasEvent));
  }

  async function copyDua(dua: (typeof prophetDuas)[number]) {
    await navigator.clipboard.writeText(`${dua.arabic}\n${dua.reading}\n\n${dua.meaning}\n${dua.source}`);
    setCopiedSource(dua.source);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedSource(null), 1800);
  }

  return <div className="welcome-view">
    <section className="welcome-hero">
      <div className="welcome-copy">
        <p className="eyebrow">ASSALOMU ALAYKUM, {firstName.toUpperCase()}</p>
        <h1><TypingHeadline text="Bir duoda uchrashadigan mehrli hamjamiyat." /></h1>
        <p className="welcome-lead">Duodosh — tashvishingizni odob bilan ulashish, boshqa musulmonlarni duoda eslash va yolg‘iz emasligingizni his qilish uchun xavfsiz makon.</p>
        <div className="welcome-actions"><button className="primary-button welcome-primary" onClick={onEnter}>Bismillah, duo oqimiga kirish <span>→</span></button><a className="welcome-secondary" href="#qanday-ishlaydi">Avval qanday ishlashini ko‘ring</a></div>
        <div className="welcome-trust"><span>◌ Anonim ulashish</span><span>♡ Hukmsiz dalda</span><span>⌒ Tasdiqlangan masjidlar</span></div>
      </div>
      <aside className="hadith-card">
        <span className="hadith-mark">☾</span>
        <p className="arabic compact" lang="ar" dir="rtl">دَعَا لِأَخِيهِ بِظَهْرِ الْغَيْبِ</p>
        <p className="transliteration" lang="uz-Latn"><span>O‘qilishi:</span> Da’a li-axihi bi-zahril-g‘aybi.</p>
        <blockquote>“Musulmon birodari uchun uning yo‘qligida duo qilsa, farishta: «Omin, senga ham shunday bo‘lsin», deydi.”</blockquote>
        <a href="https://sunnah.com/muslim:2732a" target="_blank" rel="noreferrer">Sahih Muslim, 2732a ↗</a>
      </aside>
    </section>

    <section className="brother-prayer" aria-labelledby="brother-prayer-title">
      <div className="section-heading"><p className="eyebrow">QUR’ONDAGI BIRODARLIK DUOSI</p><h2 id="brother-prayer-title">Boshqani duoda eslash — qalblarni yaqinlashtiradi.</h2></div>
      <div className="verse-card">
        <p className="arabic" lang="ar" dir="rtl">رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ</p>
        <p className="transliteration" lang="uz-Latn"><span>O‘qilishi:</span> Robbana, ig‘fir lana va li-ixvaninallazina sabaquna bil-iyman.</p>
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
      <div className="dua-tools">
        <label><span aria-hidden="true">⌕</span><input value={duaQuery} onChange={(event) => setDuaQuery(event.target.value)} placeholder="Duo, mavzu yoki payg‘ambar nomini qidiring" aria-label="Duolarni qidirish" /></label>
        <button className={showSavedOnly ? "dua-saved-filter active" : "dua-saved-filter"} type="button" onClick={() => setShowSavedOnly((current) => !current)} aria-pressed={showSavedOnly}>♥ Saqlanganlar <span>{savedDuas.size}</span></button>
      </div>
      <div className="dua-categories" aria-label="Duo mavzulari">{categories.map((category) => <button className={duaCategory === category ? "active" : ""} type="button" key={category} onClick={() => setDuaCategory(category)} aria-pressed={duaCategory === category}>{category}</button>)}</div>
      <p className="dua-results" aria-live="polite">{visibleDuas.length} ta duo ko‘rsatildi</p>
      {visibleDuas.length > 0
        ? <div className="dua-library">{visibleDuas.map((dua, index) => <ProphetDuaCard key={dua.source} dua={dua} index={index} reduceMotion={Boolean(reduceMotion)} saved={savedDuas.has(dua.source)} copied={copiedSource === dua.source} onToggleSaved={() => toggleSavedDua(dua.source)} onCopy={() => void copyDua(dua)} />)}</div>
        : <div className="dua-empty"><span>☾</span><h3>Duo topilmadi</h3><p>Qidiruv so‘zini yoki tanlangan mavzuni o‘zgartirib ko‘ring.</p><button type="button" onClick={() => { setDuaQuery(""); setDuaCategory("Barchasi"); setShowSavedOnly(false); }}>Barcha duolarni ko‘rsatish</button></div>}
    </section>

    <section className="welcome-cta"><span>♡</span><div><p className="eyebrow">DUODA BIRGAMIZ</p><h2>Bugun bir insonni duoda eslang.</h2><p>Mehr kichik bir niyatdan boshlanadi.</p></div><button className="primary-button" onClick={onEnter}>Duo oqimini ochish <span>→</span></button></section>
  </div>;
}
