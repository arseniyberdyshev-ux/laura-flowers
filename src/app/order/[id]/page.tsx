'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Состояния для формы отзыва
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    // Ищем заказ в базе данных по ID из ссылки
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) setOrder(data);
    setLoading(false);
  };

  const handleReviewSubmit = async () => {
    if (!comment.trim()) return alert('Пожалуйста, напишите пару слов!');

    // Сохраняем отзыв в новую таблицу reviews
    const { error } = await supabase.from('reviews').insert([{
      order_id: order.id,
      customer_name: order.customer_name,
      rating: rating,
      comment: comment
    }]);

    if (!error) {
      setIsSubmitted(true);
    } else {
      alert('Произошла ошибка при отправке отзыва.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans">
        <div className="text-center bg-white/70 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-sm">
          <h1 className="text-2xl mb-4">Заказ не найден 🌸</h1>
          <Link href="/" className="text-rose-400 hover:text-rose-600 font-bold uppercase tracking-widest text-xs transition-colors">Вернуться на витрину</Link>
        </div>
      </div>
    );
  }

  // Магия статусов: меняем дизайн блока в зависимости от текста в БД
  const getStatusText = (status: string) => {
    switch(status.toLowerCase()) {
      case 'новый': return { icon: '⏳', text: 'Мы приняли ваш заказ и уже собираем цветы', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' };
      case 'в пути': return { icon: '🏎️', text: 'Букет передан курьеру и мчится к вам!', color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-100' };
      case 'доставлен': return { icon: '✨', text: 'Заказ успешно доставлен', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' };
      default: return { icon: '📦', text: 'Обрабатываем заказ', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-100' };
    }
  };

  const statusInfo = getStatusText(order.status || 'Новый');

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-sans text-gray-900 relative overflow-hidden selection:bg-rose-200 selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; }`}} />
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-50/60 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 pt-4 md:pt-10 mb-20">
        <Link href="/" className="inline-block mb-8 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-rose-400 transition-colors bg-white/70 px-6 py-4 rounded-2xl backdrop-blur-md border border-white shadow-sm hover:shadow-md hover:-translate-y-0.5">
          ← На витрину
        </Link>

        {/* ОСНОВНОЙ БЛОК ИНФОРМАЦИИ О ЗАКАЗЕ */}
        <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mb-8">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3">Детали заказа #{order.id}</p>
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900">Здравствуйте, {order.customer_name}!</h1>
          </div>

          {/* Яркая плашка статуса */}
          <div className={`p-6 md:p-8 rounded-[2rem] border flex flex-col items-center text-center transition-all duration-500 ${statusInfo.bg}`}>
            <span className="text-5xl mb-4 drop-shadow-sm">{statusInfo.icon}</span>
            <h2 className={`font-bold uppercase tracking-[0.15em] text-sm md:text-base mb-2 ${statusInfo.color}`}>
              {order.status || 'Новый'}
            </h2>
            <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed">{statusInfo.text}</p>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-8 space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-6">Информация:</h3>
            <div className="flex justify-between items-center text-sm text-gray-600 font-medium border-b border-gray-50 pb-4">
                <span>Адрес доставки:</span> <span className="text-right pl-4">{order.address}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 font-medium border-b border-gray-50 pb-4">
                <span>Оплата:</span> <span className="text-gray-900">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-end pt-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Итого:</span> 
                <span className="font-serif text-3xl text-gray-900">{Number(order.total_price).toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>

        {/* БЛОК ОТЗЫВА (Магически появляется только при статусе "Доставлен") */}
        {order.status?.toLowerCase() === 'доставлен' && (
          <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white animate-fade-in-up">
            {isSubmitted ? (
               <div className="text-center py-8">
                 <span className="text-5xl block mb-4 animate-bounce">💖</span>
                 <h3 className="font-serif text-3xl text-gray-900 mb-3">Спасибо за доверие!</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Ваш отзыв делает нас лучше.<br/>Будем рады видеть вас снова.</p>
               </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="font-serif text-3xl text-gray-900 mb-2">Оцените букет</h3>
                  <p className="text-sm text-gray-500">Вам всё понравилось?</p>
                </div>
                
                {/* Интерактивные звездочки */}
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className={`text-5xl transition-all duration-300 hover:scale-110 active:scale-90 ${rating >= star ? 'text-rose-400 drop-shadow-md' : 'text-gray-200 grayscale opacity-50'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Напишите пару слов о свежести цветов и работе курьера..." 
                  className="w-full bg-white/80 border border-white shadow-inner p-6 rounded-3xl text-sm outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all resize-none placeholder:text-gray-400 h-32 mb-6" 
                />
                
                <button 
                  onClick={handleReviewSubmit}
                  className="w-full bg-gray-900 text-white py-5 rounded-3xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-rose-400 hover:shadow-xl hover:shadow-rose-400/30 transition-all active:scale-95"
                >
                  Отправить отзыв
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}