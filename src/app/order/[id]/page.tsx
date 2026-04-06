'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder(id as string);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Ошибка загрузки заказа:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Заказ не найден</div>;

  return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-2xl w-full">
        <div className="text-6xl mb-6 animate-bounce">🌸</div>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">Спасибо, {order.customer_name}!</h1>
        <p className="text-gray-500 mb-8 font-light">Ваш заказ #{String(order.id).slice(0, 6)} успешно оформлен.</p>

        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 mb-8 text-left">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Детали заказа</h3>
          <p className="text-gray-900 mb-2 font-medium">Адрес: <span className="font-light">{order.address}</span></p>
          <p className="text-gray-900 mb-2 font-medium">Телефон: <span className="font-light">{order.phone}</span></p>
          <p className="text-gray-900 mb-6 font-medium">Сумма: <span className="font-light">{order.total_price.toLocaleString('ru-RU')} ₽</span></p>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="text-sm flex justify-between">
                <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                <span className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="inline-block px-10 py-5 bg-gray-900 text-white rounded-full uppercase tracking-widest text-[10px] font-bold hover:bg-rose-400 transition-colors shadow-lg shadow-gray-900/20">
          Вернуться в магазин
        </Link>
      </div>
    </main>
  );
}