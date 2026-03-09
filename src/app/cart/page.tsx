'use client'

import { useCart } from '../../store/useCart';
import { supabase } from '../../lib/supabase'; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Добавили роутер для перенаправления

export default function Cart() {
  const { items, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Инициализируем роутер

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      customerName: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      paymentMethod: formData.get('payment') as string,
      items: safeItems
    };

    try {
      // 1. Сохраняем заказ в Supabase и СРАЗУ ПРОСИМ ВЕРНУТЬ НАМ ЕГО ДАННЫЕ (.select().single())
      const { data: newOrder, error: dbError } = await supabase.from('orders').insert([{
        customer_name: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        payment_method: orderData.paymentMethod,
        total_price: total,
        items: safeItems,
        status: 'Новый' // Явно задаем статус
      }]).select().single();

      if (dbError || !newOrder) throw new Error('Ошибка при сохранении в БД');

      // 2. Генерируем ссылку для Telegram
      const orderUrl = `${window.location.origin}/order/${newOrder.id}`;

      // 3. Отправляем уведомление в Telegram (передаем туда ID и ссылку)
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orderData, orderId: newOrder.id, orderUrl }),
      });

      if (response.ok) {
        clearCart();
        // 4. МАГИЯ: Мгновенно перебрасываем клиента на страницу его заказа!
        router.push(`/order/${newOrder.id}`);
      } else {
        throw new Error('Ошибка Telegram');
      }
    } catch (error) {
      console.error(error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (safeItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-8 text-gray-900 relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; }`}} />
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl p-16 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center flex flex-col items-center z-10 animate-fade-in-up">
            <span className="text-6xl mb-8">🛒</span>
            <p className="font-serif text-3xl md:text-4xl text-gray-800 mb-8 tracking-wide">Ваша корзина пуста</p>
            <Link href="/" className="px-10 py-5 bg-gray-900 text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-rose-400 hover:shadow-xl hover:shadow-rose-400/30 transition-all font-bold">
              Вернуться к витрине
            </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-sans text-gray-900 relative overflow-hidden selection:bg-rose-200 selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; }`}} />
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-50/60 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
          <header className="mb-10 flex justify-between items-center pt-4">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 tracking-wide bg-white/70 px-8 py-4 rounded-[2rem] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                Оформление заказа
            </h1>
            <Link href="/" className="bg-white/70 backdrop-blur-xl px-8 py-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:bg-white transition-all text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-gray-900 border border-white">
              ← Назад
            </Link>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-7 bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-fit">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Ваш заказ</h2>
                <button onClick={clearCart} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-rose-400 transition-colors font-bold">Очистить всё</button>
              </div>

              <div className="space-y-4">
                {safeItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white/50 p-4 rounded-[2rem] border border-white hover:shadow-sm transition-all group">
                    <div className="flex gap-4 md:gap-6 items-center">
                       <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex flex-col">
                        <p className="font-serif text-lg text-gray-900 mb-1 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-widest font-semibold">Кол-во: {p.quantity}</p>
                        <button type="button" onClick={() => removeItem(p.id)} className="text-[10px] text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors self-start font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-rose-50 opacity-90 hover:opacity-100">
                          Удалить
                        </button>
                       </div>
                    </div>
                    <p className="text-lg md:text-xl font-light text-gray-900 whitespace-nowrap bg-white/80 px-4 md:px-5 py-3 rounded-2xl border border-white shadow-sm ml-4">
                      {((Number(p.price) || 0) * (Number(p.quantity) || 1)).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-white/60 p-8 rounded-[2rem] border border-white shadow-sm">
                <div className="space-y-4 mb-6 text-sm text-gray-600 border-b border-gray-100 pb-6">
                  <div className="flex justify-between font-medium">
                    <span>Товары ({safeItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)} шт.)</span>
                    <span>{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between font-medium"><span>Доставка</span><span className="text-emerald-500">Бесплатно</span></div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">ИТОГО К ОПЛАТЕ:</span>
                  <span className="font-serif text-3xl md:text-4xl text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-fit">
              <h2 className="text-[10px] uppercase tracking-[0.2em] mb-8 text-gray-500 font-bold border-b border-gray-100 pb-6">Куда везти?</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Имя получателя</label>
                  <input name="name" required className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-gray-300" placeholder="Например, Анна" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Телефон</label>
                  <input name="phone" required type="tel" className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all placeholder:text-gray-300" placeholder="+7 (999) 000-00-00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Адрес доставки</label>
                  <textarea name="address" required rows={3} className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all resize-none placeholder:text-gray-300" placeholder="Улица, дом, квартира..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 ml-3 font-bold">Оплата</label>
                  <select name="payment" className="w-full bg-white/80 border border-white shadow-sm p-5 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all appearance-none cursor-pointer text-gray-700">
                    <option value="Перевод">Перевод на карту</option>
                    <option value="Наличные">Наличные курьеру</option>
                  </select>
                </div>
                <button disabled={loading} className="w-full bg-gray-900 text-white py-6 mt-4 rounded-3xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-rose-400 hover:shadow-xl hover:shadow-rose-400/30 transition-all disabled:bg-gray-300 active:scale-95">
                  {loading ? 'Отправляем...' : 'Оформить заказ'}
                </button>
              </form>
            </section>
          </div>
      </div>
    </main>
  );
}