
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  image: string;
  category: string;
}

export enum OrderStatus {
  PENDING = "قيد الانتظار",
  CONFIRMED = "تم التأكيد",
  SHIPPED = "تم الشحن",
  CANCELLED = "ملغى"
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilaya: string;
  baladiya: string;
  totalPrice: number;
  productName: string;
  date: string;
  status: OrderStatus;
}

export enum Wilaya {
  CHLEF = "02 - الشلف",
  LAGHOUAT = "03 - الأغواط",
  OUM_EL_BOUAGHI = "04 - أم البواقي",
  BATNA = "05 - باتنة",
  BEJAIA = "06 - بجاية",
  BISKRA = "07 - بسكرة",
  BLIDA = "09 - البليدة",
  BOUIRA = "10 - البويرة",
  TEBESSA = "12 - تبسة",
  TLEMCEN = "13 - تلمسان",
  TIARET = "14 - تيارت",
  TIZI_OUZOU = "15 - تيزي وزو",
  ALGER = "16 - الجزائر",
  DJELFA = "17 - الجلفة",
  JIJEL = "18 - جيجل",
  SETIF = "19 - سطيف",
  SAIDA = "20 - سعيدة",
  SKIKDA = "21 - سكيكدة",
  SIDI_BEL_ABBES = "22 - سيدي بلعباس",
  ANNABA = "23 - عنابة",
  GUELMA = "24 - قالمة",
  CONSTANTINE = "25 - قسنطينة",
  MEDEA = "26 - المدية",
  MOSTAGANEM = "27 - مستغانم",
  MSILA = "28 - المسيلة",
  MASCARA = "29 - معسكر",
  OUARGLA = "30 - ورقلة",
  ORAN = "31 - وهران",
  EL_BAYADH = "32 - البيض",
  BORDJ_BOU_ARRERIDJ = "34 - برج بوعريريج",
  BOUMERDES = "35 - بومرداس",
  EL_TAREF = "36 - الطارف",
  EL_OUED = "39 - الوادي",
  KHENCHELA = "40 - خنشلة",
  SOUK_AHRAS = "41 - سوق أهراس",
  TIPAZA = "42 - تيبازة",
  MILA = "43 - ميلة",
  AIN_DEFLA = "44 - عين الدفلى",
  NAAMA = "45 - النعامة",
  AIN_TEMOUCHENT = "46 - عين تموشنت",
  GHARDAIA = "47 - غرداية",
  RELIZANE = "48 - غليزان",
  OULED_DJELLAL = "51 - أولاد جلال",
  TOUGGOURT = "55 - تقرت",
  EL_M_GHAIR = "57 - المغير",
  EL_MENIAA = "58 - المنيعة"
}

export const SHIPPING_COSTS: Record<string, number> = {
  "default": 800,
  "02 - الشلف": 700,
  "03 - الأغواط": 900,
  "04 - أم البواقي": 750,
  "05 - باتنة": 750,
  "06 - بجاية": 750,
  "07 - بسكرة": 850,
  "09 - البليدة": 600,
  "10 - البويرة": 700,
  "12 - تبسة": 800,
  "13 - تلمسان": 750,
  "14 - تيارت": 750,
  "15 - تيزي وزو": 700,
  "16 - الجزائر": 450,
  "17 - الجلفة": 850,
  "18 - جيجل": 750,
  "19 - سطيف": 700,
  "20 - سعيدة": 800,
  "21 - سكيكدة": 750,
  "22 - سيدي بلعباس": 750,
  "23 - عنابة": 750,
  "24 - قالمة": 800,
  "25 - قسنطينة": 700,
  "26 - المدية": 700,
  "27 - مستغانم": 750,
  "28 - المسيلة": 750,
  "29 - معسكر": 800,
  "30 - ورقلة": 950,
  "31 - وهران": 700,
  "32 - البيض": 1000,
  "34 - برج بوعريريج": 700,
  "35 - بومرداس": 650,
  "36 - الطارف": 850,
  "39 - الوادي": 900,
  "40 - خنشلة": 800,
  "41 - سوق أهراس": 800,
  "42 - تيبازة": 650,
  "43 - ميلة": 750,
  "44 - عين الدفلى": 700,
  "45 - النعامة": 850,
  "46 - عين تموشنت": 750,
  "47 - غرداية": 950,
  "48 - غليزان": 750,
  "51 - أولاد جلال": 950,
  "55 - تقرت": 950,
  "57 - المغير": 950,
  "58 - المنيعة": 950
};
