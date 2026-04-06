'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния для формы добавления товара
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Премиум', image: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } else {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      fetchData();
    } catch (error) { alert('Ошибка обновления'); }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Точно удалить товар?')) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
      fetchData();
    } catch (error) { alert('Ошибка удаления'); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const { error } = await supabase.from('products').insert([{
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        image: newProduct.image || 'https://images.unsplash.com/photo-1582791694776-085e5077ea41?q=80&w=800&auto=format&fit=crop'
      }]);
      if (error) throw error;
      
      setNewProduct({ name: '', price: '', category: 'Премиум', image: '' });
      setShowAddForm(false);
      fetchData(); // Обновляем список
    } catch (error) {
      alert('Ошибка при добавлении товара');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold tracking-tight">Панель управления</h1>
          <Link href="/" className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">На сайт</Link>
        </header>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 rounded-2xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>📦 Заказы</button>
          <button onClick={() => setActiveTab('products')} className={`px-6 py-3 rounded-2xl font-semibold transition-all ${activeTab === 'products' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>🌸 Товары</button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            {activeTab === 'orders' && (
              <div className="p-6 overflow-x-auto">
                {orders.length === 0 ? <p className="text-gray-500 text-center py-10">Заказов пока нет.</p> : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-4 font-semibold">ID / Дата</th>
                        <th className="pb-4 font-semibold">Клиент</th>
                        <th className="pb-4 font-semibold">Сумма</th>
                        <th className="pb-4 font-semibold">Статус</th>
                        <th className="pb-4 font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-4">
                            <div className="text-sm font-medium">#{String(order.id).slice(0, 6)}</div>
                            <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-sm font-medium">{order.customer_name}</div>
                            <div className="text-xs text-gray-500">{order.phone}</div>
                          </td>
                          <td className="py-4 font-semibold">{order.total_price?.toLocaleString('ru-RU')} ₽</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Новый' ? 'bg-blue-100 text-blue-700' : order.status === 'Выполнен' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {order.status || 'Новый'}
                            </span>
                          </td>
                          <td className="py-4">
                            <select value={order.status || 'Новый'} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-2 outline-none cursor-pointer">
                              <option value="Новый">Новый</option>
                              <option value="В обработке">В обработке</option>
                              <option value="Выполнен">Выполнен</option>
                              <option value="Отменен">Отменен</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Каталог товаров</h2>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-400 transition-colors">
                    {showAddForm ? '✕ Отменить' : '+ Добавить букет'}
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={handleAddProduct} className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Название</label>
                        <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900" placeholder="Букет 'Весна'" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Цена (₽)</label>
                        <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900" placeholder="5000" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Категория</label>
                        <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900 bg-white">
                          <option value="Премиум">Премиум</option>
                          <option value="Монобукеты">Монобукеты</option>
                          <option value="Свадебные">Свадебные</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Ссылка на фото (URL)</label>
                        <input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gray-900" placeholder="https://..." />
                      </div>
                    </div>
                    <button type="submit" disabled={isAdding} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors w-full md:w-auto">
                      {isAdding ? 'Сохраняем...' : 'Сохранить товар'}
                    </button>
                  </form>
                )}

                {products.length === 0 ? <p className="text-gray-500 text-center py-10">Товаров пока нет.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-4 font-semibold">Фото</th>
                          <th className="pb-4 font-semibold">Название</th>
                          <th className="pb-4 font-semibold">Категория</th>
                          <th className="pb-4 font-semibold">Цена</th>
                          <th className="pb-4 font-semibold text-right">Удалить</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4"><img src={product.image} className="w-12 h-12 rounded-xl object-cover bg-gray-200" alt="" /></td>
                            <td className="py-4 font-medium">{product.name}</td>
                            <td className="py-4 text-sm text-gray-500">
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">{product.category}</span>
                            </td>
                            <td className="py-4 font-semibold">{product.price?.toLocaleString('ru-RU')} ₽</td>
                            <td className="py-4 text-right">
                              <button onClick={() => deleteProduct(product.id)} className="text-gray-400 hover:text-red-500 transition-colors font-bold p-2 text-xl">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}