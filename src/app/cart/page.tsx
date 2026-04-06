'use client'

import { useState, useEffect } from 'react';
import { useCart } from '../../store/useCart';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { items, removeItem, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * (Number(item.quantity) || 1)), 0);
  const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const safeItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1
    }));

    const orderData = {
      customerName: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      paymentMethod: formData.get('payment') as string,
      items: safeItems
    };

    try {
      console.log("🚀 Отправляем в Supabase...");
      
      // Сохраняем заказ в Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          phone: orderData.phone,
          address: orderData.address,
          payment_method: orderData.paymentMethod,
          total_price: total,
          items: safeItems,
          status: 'Новый'
        }])
        .select();

      if (error) throw error;
      
      const orderId = data[0].id;
      const orderUrl = `${window.location.origin}/order/${orderId}`;

      console.log("✅ Успешно! ID заказа:", orderId);

      // Отправляем уведомление в Telegram-бота
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, orderId: String(orderId).slice(0, 6), orderUrl }),
      });

      // Независимо от того, дошла ли телега, заказ в базе есть, кидаем на страницу успеха
      clearCart();
      router.push(`/order/${orderId}`);

    } catch (error) {
      console.error("❌ Ошибка при оформлении:", error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  if (!isClient) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-4xl text-gray-900 mb-6">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-8 font-light">Добавьте прекрасные букеты, чтобы оформить заказ.</p>
        <Link href="/" className="px-8 py-4 bg-gray-900 text-white rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-rose-400 transition-colors">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans text-gray-900">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
      `}} />

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gray-900 bg-white px-8 py-4 rounded-[3rem] shadow-sm border border-gray-100 inline-block">Оформление заказа</h1>
          <Link href="/" className="px-6 py-3 bg-white rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100 transition-all">
            ← Назад
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ЛЕВАЯ КОЛОНКА - ЗАКАЗ */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex-grow">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Ваш заказ</h2>
                <button onClick={clearCart} className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-rose-400 transition-colors">Очистить всё</button>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-3xl shadow-sm" />
                    <div className="flex-grow">
                      <h3 className="font-serif text-2xl text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Кол-во: {item.quantity}</p>
                      <button onClick={() => removeItem(item.id)} className="text-[9px] uppercase tracking-widest font-bold text-rose-400 border border-rose-100 px-4 py-2 rounded-full hover:bg-rose-50 transition-colors">
                        Удалить
                      </button>
                    </div>
                    <div className="text-2xl font-light text-gray-900 whitespace-nowrap bg-gray-50 px-6 py-3 rounded-2xl">
                      {(item.price * (Number(item.quantity) || 1)).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100">
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 text-gray-600 font-light">
                <div className="flex justify-between">
                  <span>Товары ({totalItems} шт.)</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Доставка</span>
                  <span className="text-emerald-500 font-bold text-sm">Бесплатно</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Итого к оплате:</span>
                <span className="font-serif text-4xl text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА - ФОРМА */}
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 h-full flex flex-col">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-10">Куда везти?</h2>

              <div className="space-y-8 flex-grow">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 ml-4">Имя получателя</label>
                  <input required name="name" type="text" className="w-full px-8 py-5 bg-blue-50/50 rounded-3xl border-none focus:ring-2 focus:ring-rose-200 outline-none transition-all text-gray-900" placeholder="Например, Анна" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 ml-4">Телефон</label>
                  <input required name="phone" type="tel" className="w-full px-8 py-5 bg-blue-50 rounded-3xl border-none focus:ring-2 focus:ring-rose-200 outline-none transition-all text-gray-900" placeholder="+7 (999) 000-00-00" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 ml-4">Адрес доставки</label>
                  <textarea required name="address" rows={3} className="w-full px-8 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-2 focus:ring-rose-200 outline-none transition-all resize-none text-gray-900 shadow-sm" placeholder="Улица, дом, квартира..."></textarea>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 ml-4">Оплата</label>
                  <select name="payment" className="w-full px-8 py-5 bg-white border border-gray-100 rounded-3xl focus:ring-2 focus:ring-rose-200 outline-none transition-all text-gray-900 shadow-sm appearance-none cursor-pointer">
                    <option>Перевод на карту</option>
                    <option>Наличными курьеру</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-10 w-full py-6 bg-gray-200 hover:bg-gray-900 text-white rounded-[2rem] text-[10px] uppercase tracking-[0.3em] font-bold transition-all disabled:opacity-50"
              >
                {loading ? 'Отправляем...' : 'Оформить заказ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}