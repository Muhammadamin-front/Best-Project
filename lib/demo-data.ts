export type PrayerCard = {
  id: string;
  author: string;
  avatar: string;
  title: string;
  body: string;
  category: string;
  categoryKey: string;
  city: string;
  time: string;
  supportCount: number;
  commentCount: number;
  supported: boolean;
  saved: boolean;
  owned?: boolean;
  anonymous?: boolean;
  resolved?: boolean;
  urgent?: boolean;
};

export const demoRequests: PrayerCard[] = [
  {
    id: "demo-1",
    author: "Anonim duodosh",
    avatar: "D",
    title: "Onamning operatsiyasi uchun duo qiling",
    body: "Ertaga onamning yurak operatsiyasi bor. Shifokorlar yaxshi umid berishdi, lekin oilamiz juda hayajonda. Iltimos, onamning sog‘ligi va shifokorlarning qo‘li yengil bo‘lishi uchun duo qiling.",
    category: "Sog‘liq",
    categoryKey: "health",
    city: "Samarqand",
    time: "12 daqiqa oldin",
    supportCount: 47,
    commentCount: 8,
    supported: false,
    saved: false,
    anonymous: true,
  },
  {
    id: "demo-2",
    author: "Muhammadali",
    avatar: "M",
    title: "Yangi ish izlayapman",
    body: "Uch oydan beri ish qidiryapman. Oilam oldidagi mas’uliyatimni halol ado etishim va yaxshi jamoaga qo‘shilishim uchun duolaringizda eslab qo‘ying.",
    category: "Ish va ta’lim",
    categoryKey: "work",
    city: "Toshkent",
    time: "34 daqiqa oldin",
    supportCount: 23,
    commentCount: 5,
    supported: true,
    saved: true,
  },
  {
    id: "demo-3",
    author: "Duodosh a’zosi",
    avatar: "D",
    title: "Oilamizga xotirjamlik so‘rayman",
    body: "Uyimizda so‘nggi payt tushunmovchiliklar ko‘paydi. Bir-birimizni yana mehr bilan eshitishimiz va to‘g‘ri yo‘l topishimiz uchun duo qiling.",
    category: "Oila",
    categoryKey: "family",
    city: "Buxoro",
    time: "1 soat oldin",
    supportCount: 9,
    commentCount: 2,
    supported: false,
    saved: false,
    anonymous: true,
  },
  {
    id: "demo-4",
    author: "Zarnigor",
    avatar: "Z",
    title: "Imtihonim uchun duo qiling",
    body: "Bir yil tayyorlangan imtihonim shu hafta. Bilganlarimni eslab, xotirjam va halol natija olishimni duoda eslang.",
    category: "Ish va ta’lim",
    categoryKey: "work",
    city: "Farg‘ona",
    time: "2 soat oldin",
    supportCount: 4,
    commentCount: 1,
    supported: false,
    saved: false,
  },
];
