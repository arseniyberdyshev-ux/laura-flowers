'use client'

import { useCart } from '../../store/useCart';
import { products } from '../../data/products';
import { useState } from 'react';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Сопоставляем товары из корзины с базой данных
  const cartProducts = items.map(item => {
    const product = products.find(p => p.id === item.id);
    return { ...product!, quantity: item.quantity };
  });

  const total = cartProducts.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const orderData = {
      customerName: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      paymentMethod: formData.get('payment'),
      items: cartProducts
    };

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        alert('Заказ успешно отправлен в Telegram!');
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при отправке заказа. Проверьте настройки бота.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-gray-900">
        <p className="text-lg text-gray-400 mb-6 uppercase tracking-[0.2em] font-light">Корзина пуста</p>
        <Link href="/" className="border-b border-black pb-1 text-xs uppercase tracking-widest hover:text-gray-400 transition-colors">
          Вернуться к букетам
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 font-sans text-gray-900 bg-white min-h-screen">
      <header className="mb-16 border-b border-gray-100 pb-8 flex justify-between items-center mt-8">
        <h1 className="text-2xl tracking-[0.3em] uppercase font-light text-gray-800">Оформление</h1>
        <Link href="/" className="text-xs tracking-widest text-gray-400 hover:text-black transition-colors uppercase">
          Назад
        </Link>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <section>
          <h2 className="text-xs uppercase tracking-widest mb-8 text-gray-400 font-semibold">Ваш выбор</h2>
          <div className="space-y-8">
            {cartProducts.map(p => (
              <div key={p.id} className="flex justify-between items-start border-b border-gray-50 pb-6">
                <div className="flex gap-4">
                   <div className="w-16 h-20 bg-gray-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                   </div>
                   <div>
                    <p className="font-medium text-sm text-gray-800 mb-1">{p.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Кол-во: {p.quantity}</p>
                    <button 
                      onClick={() => removeItem(p.id)} 
                      className="text-[10px] text-red-300 mt-2 uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Удалить
                    </button>
                   </div>
                </div>
                <p className="text-sm font-light">{(p.price * p.quantity).toLocaleString('ru-RU')} ₽</p>
              </div>
            ))}
          </div>
          <div className="text-xl font-light pt-10 mt-4 flex justify-between items-center tracking-widest">
            <span className="text-gray-400 text-sm">ИТОГО:</span>
            <span className="text-2xl">{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </section>

        <section className="bg-gray-50 p-8 rounded-sm">
          <h2 className="text-xs uppercase tracking-widest mb-8 text-gray-400 font-semibold">Куда везти?</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Имя</label>
              <input name="name" required className="w-full border-b border-gray-200 bg-transparent p-3 text-sm outline-none focus:border-black transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Телефон</label>
              <input name="phone" required type="tel" className="w-full border-b border-gray-200 bg-transparent p-3 text-sm outline-none focus:border-black transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Адрес</label>
              <textarea name="address" required rows={2} className="w-full border-b border-gray-200 bg-transparent p-3 text-sm outline-none focus:border-black transition-colors resize-none" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 ml-1">Оплата</label>
              <select name="payment" className="w-full border-b border-gray-200 bg-transparent p-3 text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer">
                <option value="Перевод">Перевод на карту</option>
                <option value="Наличные">Наличные</option>
              </select>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-black text-white py-5 mt-8 uppercase tracking-[0.3em] text-[10px] hover:bg-gray-900 transition-all disabled:bg-gray-300"
            >
              {loading ? 'Отправляем...' : 'Оформить заказ'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}