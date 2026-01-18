
export const TELEGRAM_BOT_TOKEN = "7653422384:AAH2mV0M790PCa0e1uy7fnWlbZJP-hl8qzY";
export const TELEGRAM_CHAT_ID = "5820217239";
export const TELEGRAM_CHAT_ID_2 = "8149027569";
export const ADMIN_PASSWORD = "mohabd1";

/**
 * إعدادات Firebase الخاصة بمشروع amstore-918bb
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqtpAQHryJ7scm7M-pqZ5IDOH1CJMh11A",
  authDomain: "amstore-918bb.firebaseapp.com",
  projectId: "amstore-918bb",
  storageBucket: "amstore-918bb.firebasestorage.app",
  messagingSenderId: "901496342803",
  appId: "1:901496342803:web:471aabb48772c3f0db32e6",
  measurementId: "G-DPJCJ7MLEQ"
};

// دالة التحقق: ستسمح الآن بتشغيل الموقع لأن مفتاح API حقيقي وموجود
export const isFirebaseConfigured = () => {
  const c = FIREBASE_CONFIG;
  return c.apiKey.startsWith("AIza") && !c.apiKey.includes("ضع_هنا");
};
