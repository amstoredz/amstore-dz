
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, OrderStatus } from './types';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import { ADMIN_PASSWORD, isFirebaseConfigured, FIREBASE_CONFIG } from './constants';
import { listenToProducts, listenToOrders, deleteProductDB, updateOrderStatusDB, deleteOrderDB } from './services/databaseService';
import { 
  ShoppingBag, Clock, ShieldCheck, Instagram, 
  Menu, X, Lock, Truck, Filter, ArrowUpDown, Music2, Star, 
  Settings, ExternalLink, AlertTriangle, CheckCircle2, ShieldAlert, Copy
} from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isFirebaseConfigured());
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribeProducts = listenToProducts(
        (data) => {
          setProducts(data);
          setLoading(false);
          setDbError(null);
        },
        (err) => {
          if (err.code === 'permission-denied') {
            setDbError('قواعد الحماية (Rules) ترفض الاتصال.');
          }
          setLoading(false);
        }
      );

      const unsubscribeOrders = listenToOrders((data) => {
        setOrders(data);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
      };
    } catch (e) {
      console.error("Critical connection error", e);
      setLoading(false);
    }
  }, [isConfigured]);

  // Fix: Logic for categories, displayedProducts, and admin password submission
  const categories = useMemo(() => {
    const cats = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];
    return cats;
  }, [products]);

  const displayedProducts = useMemo(() => {
    let result = categoryFilter === 'الكل' 
      ? products 
      : products.filter(p => p.category === categoryFilter);
    
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, categoryFilter, sortBy]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === ADMIN_PASSWORD) {
      setShowAdmin(true);
      setIsPasswordModalOpen(false);
      setAdminPassInput('');
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  // واجهة دليل الإعداد النهائية
  if (!isConfigured || dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border">
          <div className={`${dbError ? 'bg-orange-600' : 'bg-red-600'} p-8 text-white flex items-center gap-6`}>
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
              <ShieldAlert size={48} />
            </div>
            <div>
              <h1 className="text-2xl font-black">{dbError ? 'مشكلة في صلاحيات القاعدة' : 'إعداد Firebase مطلوب'}</h1>
              <p className="opacity-90 font-bold">المشروع الحالي: <span className="underline">{FIREBASE_CONFIG.projectId}</span></p>
            </div>
          </div>
          
          <div className="p-8 md:p-12 space-y-10">
            {dbError ? (
              <div className="space-y-6">
                <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-[2rem] flex gap-4 items-start">
                  <AlertTriangle className="text-orange-600 shrink-0" size={32} />
                  <div>
                    <h3 className="text-xl font-black text-orange-900 mb-2">حل مشكلة Permission Denied:</h3>
                    <p className="text-orange-800 font-bold leading-relaxed">
                      قاعدة البيانات موجودة، لكنها "مقفلة". يجب أن تسمح بالوصول إليها من لوحة تحكم Firebase.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { step: "1", text: "اذهب لـ Firestore Database ثم تبويب Rules." },
                    { step: "2", text: "استبدل الكود هناك بالكود الموجود بالأسفل." },
                    { step: "3", text: "اضغط Publish وانتظر دقيقة ثم حدث الصفحة." }
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-50 p-6 rounded-3xl border text-center">
                      <span className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-black">{s.step}</span>
                      <p className="text-sm font-black text-gray-700">{s.text}</p>
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <pre className="bg-gray-900 text-green-400 p-6 rounded-3xl text-xs overflow-x-auto font-mono leading-loose shadow-inner border-4 border-gray-800">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                  </pre>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`)}
                    className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl flex items-center gap-2 text-[10px] backdrop-blur-md transition-all"
                  >
                    <Copy size={14} /> نسخ الكود
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-2 text-red-600">
                    <Settings size={24} /> 1. جلب المفاتيح
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <CheckCircle2 className="text-green-500 shrink-0" />
                      <p className="text-sm font-bold text-gray-700">افتح <b>Project Settings</b> في Firebase.</p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="text-green-500 shrink-0" />
                      <p className="text-sm font-bold text-gray-700">انزل للاسفل عند <b>Your Apps</b> واشئ تطبيق Web.</p>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="text-green-500 shrink-0" />
                      <p className="text-sm font-bold text-gray-700">انسخ الـ <b>apiKey</b> والـ <b>appId</b>.</p>
                    </li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-2 text-blue-600">
                    <Lock size={24} /> 2. تحديث الكود
                  </h3>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-900 mb-4 leading-relaxed">
                      افتح ملف <code className="bg-blue-200 px-2 rounded">constants.ts</code> وضع المفاتيح الحقيقية بدلاً من النصوص العربية.
                    </p>
                    <div className="space-y-2 opacity-60 grayscale italic text-[10px]">
                      <p>apiKey: "AIzaSy..."</p>
                      <p>appId: "1:814..."</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t">
              <div className="flex items-center gap-4">
                <a href={`https://console.firebase.google.com/project/${FIREBASE_CONFIG.projectId}/firestore`} target="_blank" rel="noreferrer" className="bg-black text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all flex items-center gap-2 shadow-xl">
                  فتح لوحة تحكم Firebase <ExternalLink size={18} />
                </a>
              </div>
              <button onClick={() => window.location.reload()} className="text-gold-600 font-black hover:underline flex items-center gap-2">
                تحديث الصفحة بعد التعديل <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-500">جاري تحميل المتجر الفاخر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-black text-gold-400 p-2 rounded-xl rotate-12 shadow-lg">
              <Clock size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">AM STORE</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="hidden md:flex gap-4">
              <Instagram size={20} className="text-gray-400 hover:text-gold-600 cursor-pointer transition-colors" />
              <a href="https://www.tiktok.com/@am_store_dz16" target="_blank" rel="noopener noreferrer">
                <Music2 size={20} className="text-gray-400 hover:text-gold-600 cursor-pointer transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[550px] md:h-[650px] flex items-center justify-center text-white overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1600&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60 animate-[pulse_10s_infinite]"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-gold-600/20 border border-gold-400/30 text-gold-400 text-xs font-bold tracking-widest mb-6">
            تشكيلة 2024 الفاخرة
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-6 leading-tight">فخامة تليق <br/> <span className="text-gold-500 italic drop-shadow-md">بشخصيتك</span></h2>
          <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            اكتشف عالم الساعات الراقية في AM STORE. جودة عالمية، تصميمات ساحرة، وتوصيل سريع لجميع الولايات الجزائرية.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="bg-gold-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gold-500 hover:scale-105 transition-all shadow-2xl shadow-gold-900/40">تصفح المتجر</a>
            <a href="tel:0555000000" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all">اتصل بنا</a>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-gold-50 text-gold-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-gold-600 group-hover:text-white transition-all shadow-sm">
              <Truck size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">توصيل 58 ولاية</h3>
            <p className="text-gray-500 leading-relaxed">خدمة توصيل موثوقة وسريعة لباب منزلك في أي مكان في الجزائر بأسعار تنافسية.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-gold-50 text-gold-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-gold-600 group-hover:text-white transition-all shadow-sm">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">جودة مضمونة</h3>
            <p className="text-gray-500 leading-relaxed">نضمن لك الحصول على المنتج تماماً كما في الصور، مع فحص شامل لكل ساعة قبل خروجها.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-gold-50 text-gold-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-gold-600 group-hover:text-white transition-all shadow-sm">
              <Star size={36} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">رضا الزبائن</h3>
            <p className="text-gray-500 leading-relaxed">أكثر من 5000 زبون راضٍ في جميع أنحاء الوطن. خدمتنا تبدأ من الطلب ولا تنتهي إلا برضاكم.</p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">أرقى الساعات</h2>
              <p className="text-gray-500 text-lg">اختر ما يناسب ذوقك من تشكيلتنا الحصرية</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              <div className="bg-gold-50 p-2 rounded-xl text-gold-600 shrink-0">
                <Filter size={20} />
              </div>
              <div className="flex gap-2">
                {categories.length > 1 ? categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                      categoryFilter === cat 
                        ? 'bg-gold-600 text-white shadow-lg shadow-gold-200' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                )) : <p className="text-gray-400 text-sm font-bold">لا توجد تصنيفات بعد</p>}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
              <div className="bg-gray-50 p-2 rounded-xl text-gray-500">
                <ArrowUpDown size={20} />
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer flex-1 lg:flex-none"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {displayedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-transparent hover:border-gold-100"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gold-600 px-4 py-1 rounded-full text-xs font-black shadow-sm">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <button className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <ShoppingBag size={20} /> التفاصيل والطلب
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-2xl font-black text-gold-600">{product.price.toLocaleString()} دج</span>
                      <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-gold-50 transition-colors">
                        <ShoppingBag size={24} className="text-gray-400 group-hover:text-gold-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2">المتجر فارغ حالياً</h3>
              <p className="text-gray-400 font-bold">يرجى الدخول للوحة التحكم وإضافة أول منتج.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-12 mb-12">
            <h1 className="text-3xl font-black tracking-tighter">AM STORE</h1>
            <div className="flex gap-6">
               <Instagram className="text-gray-500 hover:text-white cursor-pointer" />
               <Music2 className="text-gray-500 hover:text-white cursor-pointer" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} AM STORE. بكل فخر من الجزائر</p>
            <button onClick={() => setIsPasswordModalOpen(true)} className="text-gray-800 hover:text-gold-500 transition-colors"><Lock size={14} /></button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && <CheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onOrderSuccess={() => {}} />}
      
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-sm rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-center mb-6">دخول الإدارة</h3>
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-right">
              <label className="block text-sm font-bold text-gray-500 mb-1 px-2">كلمة المرور الخاصة بك:</label>
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 border rounded-2xl text-center font-bold text-black focus:ring-2 ring-gold-500 outline-none" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} autoFocus />
              {passError && <p className="text-red-500 text-center font-bold text-sm">كلمة المرور غير صحيحة!</p>}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-black text-white py-4 rounded-2xl font-black">دخول</button>
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 bg-gray-100 py-4 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel 
          products={products}
          orders={orders}
          onAddProduct={() => {}} 
          onUpdateProduct={() => {}} 
          onDeleteProduct={deleteProductDB}
          onUpdateOrder={updateOrderStatusDB}
          onDeleteOrder={deleteOrderDB}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};

export default App;
