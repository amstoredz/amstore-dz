
import React, { useState } from 'react';
import { Product, Order, Wilaya, SHIPPING_COSTS, OrderStatus } from '../types';
import { X, CheckCircle, Truck, Phone, User, MapPin } from 'lucide-react';
import { sendOrderToTelegram } from '../services/telegramService';
import { addOrderDB } from '../services/databaseService';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, onClose, onOrderSuccess }) => {
  const [step, setStep] = useState<'details' | 'form' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: Wilaya.ALGER,
    baladiya: ''
  });

  const selectedShipping = SHIPPING_COSTS[formData.wilaya] || SHIPPING_COSTS.default;
  const total = product.price + selectedShipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const orderData: Omit<Order, 'id'> = {
      customerName: formData.name,
      phone: formData.phone,
      wilaya: formData.wilaya,
      baladiya: formData.baladiya,
      productName: product.name,
      totalPrice: total,
      date: new Date().toLocaleDateString('ar-DZ'),
      status: OrderStatus.PENDING
    };

    try {
      // حفظ في قاعدة البيانات
      const docRef = await addOrderDB(orderData);
      
      // إرسال للتليجرام
      await sendOrderToTelegram({ id: docRef.id, ...orderData } as Order);
      
      setStep('success');
    } catch (error) {
      alert("حدث خطأ أثناء إرسال الطلب.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative text-right" dir="rtl">
        <button onClick={onClose} className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md"><X size={20} /></button>

        {step === 'details' && (
          <div>
            <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-6">{product.description}</p>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-gray-400 text-sm font-bold">السعر</p>
                  <p className="text-2xl font-black text-gold-600">{product.price.toLocaleString()} دج</p>
                </div>
                <button onClick={() => setStep('form')} className="bg-gold-600 text-white px-8 py-3 rounded-xl font-black shadow-lg">اطلب الآن</button>
              </div>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Truck className="text-gold-600" /> اتمام الطلب</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="الاسم الكامل" required className="w-full p-4 bg-gray-50 border rounded-xl text-black font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="tel" placeholder="رقم الهاتف" required className="w-full p-4 bg-gray-50 border rounded-xl text-black font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 border rounded-xl font-bold text-black" value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value as Wilaya})}>
                {Object.values(Wilaya).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <input placeholder="البلدية" required className="w-full p-4 bg-gray-50 border rounded-xl text-black font-bold" value={formData.baladiya} onChange={e => setFormData({...formData, baladiya: e.target.value})} />
              
              <div className="bg-gray-100 p-4 rounded-xl space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">الشحن:</span><span className="font-black text-black">{selectedShipping} دج</span></div>
                <div className="flex justify-between text-xl font-black text-gold-600"><span>الإجمالي:</span><span>{total.toLocaleString()} دج</span></div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-black text-lg shadow-xl">
                {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">تم استلام طلبك!</h2>
            <p className="text-gray-600 mb-8 font-medium">سوف نتواصل معك قريباً لتأكيد الطلب.</p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-4 rounded-xl font-black shadow-lg">العودة للمتجر</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
