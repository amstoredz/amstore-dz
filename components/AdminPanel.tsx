
import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { addProductDB, updateProductDB } from '../services/databaseService';
import { Plus, X, Trash2, Edit, LayoutDashboard, ShoppingCart, Package, ArrowRight, Save, TrendingUp, Phone } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrder: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onDeleteProduct, 
  onUpdateOrder, 
  onDeleteOrder,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, description: '', color: '', image: '', category: 'Classic'
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await updateProductDB(editingProduct.id, formData);
      } else {
        await addProductDB(formData as Omit<Product, 'id'>);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: 0, description: '', color: '', image: '', category: 'Classic' });
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
    setLoading(false);
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setShowForm(true);
  };

  const stats = {
    totalSales: orders.filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.SHIPPED).reduce((acc, o) => acc + o.totalPrice, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
    stockCount: products.length
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-100 overflow-hidden text-right" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-gold-600 p-2 rounded-lg"><LayoutDashboard size={20} /></div>
          <span className="font-black text-xl">لوحة التحكم</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-gold-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}>
            <TrendingUp size={20} /> الإحصائيات
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-gold-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}>
            <Package size={20} /> المنتجات
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-gold-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}>
            <ShoppingCart size={20} /> الطلبات
          </button>
        </nav>
        <button onClick={onClose} className="m-4 p-4 flex items-center gap-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all mt-auto"><ArrowRight size={20} /> خروج</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex bg-white border-b overflow-x-auto">
          <button onClick={() => setActiveTab('stats')} className={`px-6 py-4 flex-none border-b-2 font-bold ${activeTab === 'stats' ? 'border-gold-600 text-gold-600' : 'border-transparent text-gray-500'}`}>الإحصائيات</button>
          <button onClick={() => setActiveTab('products')} className={`px-6 py-4 flex-none border-b-2 font-bold ${activeTab === 'products' ? 'border-gold-600 text-gold-600' : 'border-transparent text-gray-500'}`}>المنتجات</button>
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-4 flex-none border-b-2 font-bold ${activeTab === 'orders' ? 'border-gold-600 text-gold-600' : 'border-transparent text-gray-500'}`}>الطلبات</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border text-right">
                <p className="text-gray-500 text-sm font-bold mb-2">إجمالي المبيعات</p>
                <p className="text-3xl font-black text-gold-600">{stats.totalSales.toLocaleString()} دج</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border text-right">
                <p className="text-gray-500 text-sm font-bold mb-2">عدد الطلبات</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border text-right">
                <p className="text-gray-500 text-sm font-bold mb-2">طلبات معلقة</p>
                <p className="text-3xl font-black text-orange-500">{stats.pendingOrders}</p>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-black">إدارة المنتجات</h2>
                <button onClick={() => { setEditingProduct(null); setFormData({name: '', price: 0, description: '', color: '', image: '', category: 'Classic'}); setShowForm(true); }} className="bg-gold-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-gold-200">
                  <Plus size={20} /> إضافة منتج
                </button>
              </div>

              {showForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                  <form onSubmit={handleSaveProduct} className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-black">{editingProduct ? 'تعديل منتج' : 'منتج جديد'}</h3>
                      <button type="button" onClick={() => setShowForm(false)} className="text-black"><X /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input placeholder="اسم الساعة" required className="p-4 bg-gray-50 border rounded-2xl text-black font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input type="number" placeholder="السعر" required className="p-4 bg-gray-50 border rounded-2xl text-black font-bold" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                      <input placeholder="اللون" required className="p-4 bg-gray-50 border rounded-2xl text-black font-bold" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                      <select className="p-4 bg-gray-50 border rounded-2xl text-black font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="Classic">كلاسيك</option><option value="Sport">رياضي</option><option value="Luxury">فاخر</option>
                      </select>
                      <input placeholder="رابط الصورة" className="md:col-span-2 p-4 bg-gray-50 border rounded-2xl text-black font-bold" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                      <textarea placeholder="الوصف" required className="md:col-span-2 p-4 bg-gray-50 border rounded-2xl h-32 text-black font-bold" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <Save size={20} /> {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-3xl border flex items-center gap-6 shadow-sm">
                    <img src={product.image} className="w-20 h-20 object-cover rounded-2xl" alt="" />
                    <div className="flex-1">
                      <h3 className="font-black text-black">{product.name}</h3>
                      <p className="text-gold-600 font-bold">{product.price} دج</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(product)} className="p-2 bg-gray-100 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => { if(confirm('حذف؟')) onDeleteProduct(product.id); }} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-black">{order.customerName}</h3>
                      <p className="text-sm text-gray-500">{order.wilaya} - {order.phone}</p>
                    </div>
                    <p className="font-black text-gold-600">{order.totalPrice} دج</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-400">{order.productName}</p>
                    <div className="flex gap-2">
                      <select className="px-3 py-1 rounded-lg border text-sm font-bold text-black" value={order.status} onChange={(e) => onUpdateOrder(order.id, e.target.value as OrderStatus)}>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => { if(confirm('حذف؟')) onDeleteOrder(order.id); }} className="text-red-400"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
