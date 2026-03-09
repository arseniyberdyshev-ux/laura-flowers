'use client'

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // --- СОСТОЯНИЯ ДЛЯ ТОВАРОВ ---
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // --- СОСТОЯНИЯ ДЛЯ ЗАКАЗОВ ---
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error) setProducts(data || []);
    setIsLoadingProducts(false);
  };

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const form = e.currentTarget;
    const formData = new FormData(form);

    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      image: formData.get('image') as string,
      hidden_partner_name: formData.get('partner_name') as string,
      hidden_partner_address: formData.get('partner_address') as string,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        setStatus({ type: 'success', message: 'Изменения сохранены! ✏️' });
        setEditingProduct(null);
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        setStatus({ type: 'success', message: 'Букет добавлен на витрину! 🎉' });
      }
      form.reset(); 
      fetchProducts();
    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', message: 'Ошибка: ' + error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Точно удалить этот букет?')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setStatus({ type: 'success', message: 'Букет удален!' });
      setProducts(products.filter(p => p.id !== id));
      if (editingProduct?.id === id) setEditingProduct(null);
    } catch (error: any) {
      setStatus({ type: 'error', message: 'Ошибка: ' + error.message });
    } finally {
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setIsLoadingOrders(false);
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Не удалось обновить статус');
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-sans text-gray-900 relative overflow-hidden selection:bg-rose-200 selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; }`}} />
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-50/60 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ХЭДЕР АДМИНКИ */}
        <header className="mb-10 flex justify-between items-center pt-4">
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide bg-white/70 px-8 py-4 rounded-[2rem] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              Управление
          </h1>
          <Link href="/" className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:bg-white transition-all text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-gray-900 border border-white">
            ← На сайт
          </Link>
        </header>

        {/* ТАБЫ */}
        <div className="flex gap-4 mb-8">
           <button 
             onClick={() => setActiveTab('products')}
             className={`px-8 py-4 rounded-[2rem] text-[10px] uppercase tracking-[0.2em] font-bold transition-all border ${activeTab === 'products' ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white/70 text-gray-500 border-white hover:bg-white shadow-sm'}`}
           >
             📦 Каталог
           </button>
           <button 
             onClick={() => setActiveTab('orders')}
             className={`px-8 py-4 rounded-[2rem] text-[10px] uppercase tracking-[0.2em] font-bold transition-all border ${activeTab === 'orders' ? 'bg-rose-400 text-white border-rose-400 shadow-xl shadow-rose-400/30' : 'bg-white/70 text-gray-500 border-white hover:bg-white shadow-sm'}`}
           >
             📝 Заказы
           </button>
        </div>

        {/* --- ВКЛАДКА: ТОВАРЫ --- */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ФОРМА (СЛЕВА) */}
            <section className="lg:col-span-5 bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-fit">
              <h2 className="text-[10px] uppercase tracking-[0.2em] mb-8 text-gray-500 font-bold border-b border-gray-100 pb-6">
                {editingProduct ? 'Редактировать букет' : 'Новый букет'}
              </h2>

              <form onSubmit={handleProductSubmit} className="space-y-6" key={editingProduct ? editingProduct.id : 'new'}>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Название букета</label>
                  <input name="name" defaultValue={editingProduct?.name || ''} required className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-gray-300" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Категория</label>
                  <input name="category" defaultValue={editingProduct?.category || ''} list="cats" required className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-gray-300" />
                  <datalist id="cats">{uniqueCategories.map(cat => <option key={cat as string} value={cat as string} />)}</datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Цена (только цифры)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price || ''} required className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Ссылка на картинку</label>
                  <input name="image" defaultValue={editingProduct?.image || ''} required className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Поставщик</label>
                    <input name="partner_name" defaultValue={editingProduct?.hidden_partner_name || ''} className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all" placeholder="Название" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Адрес поставщика</label>
                    <input name="partner_address" defaultValue={editingProduct?.hidden_partner_address || ''} className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all" placeholder="Сайт или адрес" />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button disabled={loading} className="flex-grow bg-[#1A202C] text-white py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-rose-400 hover:shadow-xl hover:shadow-rose-400/30 transition-all active:scale-95">
                    {loading ? 'ЗАГРУЗКА...' : (editingProduct ? 'СОХРАНИТЬ ИЗМЕНЕНИЯ' : '+ ДОБАВИТЬ В КАТАЛОГ')}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => setEditingProduct(null)} className="px-6 bg-white border border-white text-gray-500 rounded-3xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-gray-50 transition-all shadow-sm">
                      ОТМЕНА
                    </button>
                  )}
                </div>
              </form>

              {status.type && (
                <div className={`mt-6 p-5 rounded-3xl text-[10px] uppercase tracking-widest text-center font-bold border shadow-sm ${status.type === 'success' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100' : 'bg-rose-50/50 text-rose-600 border-rose-100'}`}>
                  {status.message}
                </div>
              )}
            </section>

            {/* СПИСОК ТОВАРОВ (СПРАВА) */}
            <section className="lg:col-span-7 bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-fit">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Витрина ({products.length})</h2>
              </div>
              
              <input 
                type="text" placeholder="Поиск по названию..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all mb-6 placeholder:text-gray-300" 
              />
              
              {isLoadingProducts ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div></div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-white/50 p-4 rounded-[2rem] border border-white hover:shadow-sm transition-all group">
                      <div className="flex gap-4 items-center">
                         <div className="w-16 h-20 bg-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm flex-shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col">
                          <p className="font-serif text-lg text-gray-900 mb-1 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{p.price.toLocaleString('ru-RU')} ₽</p>
                          {p.hidden_partner_name && (
                            <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">Поставщик: {p.hidden_partner_name}</p>
                          )}
                         </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => {setEditingProduct(p); window.scrollTo({top:0});}} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-gray-500 rounded-xl text-xs hover:border-rose-300 hover:text-rose-400 shadow-sm transition-all">✏️</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-gray-500 rounded-xl text-xs hover:border-rose-300 hover:text-rose-400 shadow-sm transition-all">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- ВКЛАДКА: ЗАКАЗЫ --- */}
        {activeTab === 'orders' && (
          <section className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-fit">
            <h2 className="text-[10px] uppercase tracking-[0.2em] mb-8 text-gray-500 font-bold border-b border-gray-100 pb-6">Управление заказами</h2>
            
            {isLoadingOrders ? (
               <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-400"></div></div>
            ) : orders.length === 0 ? (
               <div className="text-center p-10"><span className="text-4xl">🌸</span><p className="font-serif text-xl mt-4 text-gray-500">Заказов пока нет</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/60 p-6 md:p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase">
                          Заказ #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                          {new Date(order.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="font-serif text-2xl text-gray-900 mb-2">{order.customer_name}</p>
                      <p className="text-[11px] text-gray-500 mb-4 tracking-wider uppercase font-medium">📞 {order.phone} &nbsp; • &nbsp; 📍 {order.address}</p>
                      
                      <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm text-sm text-gray-600 mb-4 space-y-2">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span>{item.name}</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <p className="font-serif text-3xl text-gray-900">{Number(order.total_price).toLocaleString('ru-RU')} ₽ <span className="text-[9px] text-gray-400 font-sans tracking-widest uppercase">({order.payment_method})</span></p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 min-w-[220px] border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 justify-center">
                      <div className="w-full space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-2">Сменить статус</label>
                        <select
                          value={order.status || 'Новый'}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`w-full p-5 rounded-3xl text-[10px] uppercase tracking-[0.2em] font-bold border shadow-sm outline-none cursor-pointer appearance-none text-center transition-all
                            ${order.status === 'Новый' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              order.status === 'В пути' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' :
                              'bg-emerald-50 text-emerald-500 border-emerald-100'}`}
                        >
                          <option value="Новый">⏳ Новый</option>
                          <option value="В пути">🏎️ В пути</option>
                          <option value="Доставлен">✨ Доставлен</option>
                        </select>
                      </div>

                      <a href={`/order/${order.id}`} target="_blank" className="w-full bg-white border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-200 shadow-sm px-6 py-4 rounded-3xl text-center text-[10px] uppercase tracking-widest font-bold transition-all">
                        Страница клиента ↗
                      </a>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}