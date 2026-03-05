'use client'

import { useCart } from '../store/useCart';
import { products } from '../data/products';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { items, addItem } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleAddToCart = (product: any) => {
    addItem(product);
    setAddedId(product.id);
    
    // Эффекты длятся 1.5 секунды, затем возвращаются в норму
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F9FAFB_0%,#E8EBEE_27%,#E0E6EB_51%,#EAEDF0_78%,#F9FAFB_100%)] p-6 font-sans text-gray-900 overflow-x-hidden">
      
      {/* Шапка: теперь она прилипает к верху (sticky) */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 pt-4 sticky top-4 z-50">
        <h1 className="text-3xl tracking-[0.2em] uppercase font-light text-gray-800 drop-shadow-sm bg-white/40 px-6 py-2 rounded-2xl backdrop-blur-md shadow-sm border border-white/50">
          L'AURA
        </h1>
        <Link 
          href="/cart" 
          // Кнопка корзины тоже реагирует, когда товар добавлен
          className={`relative bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 text-sm uppercase tracking-widest font-medium text-gray-700 border border-white/50 ${addedId ? 'scale-105 shadow-rose-200' : ''}`}
        >
          Корзина
          {totalItems > 0 && (
            <>
              {/* Пульсирующий всплеск при добавлении товара */}
              {addedId && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 rounded-full animate-ping opacity-75"></span>
              )}
              {/* Сам кружок со счетчиком */}
              <span className="absolute -top-2 -right-2 bg-rose-400 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            </>
          )}
        </Link>
      </header>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(p => (
          <div 
            key={p.id} 
            // Анимация самой карточки при добавлении
            className={`bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col transition-all duration-500 ${
              addedId === p.id 
                ? 'border-2 border-emerald-300 shadow-2xl shadow-emerald-100/60 scale-[1.02] -translate-y-2' 
                : 'border border-white/50 shadow-sm hover:shadow-xl hover:shadow-rose-100/50 hover:-translate-y-1'
            }`}
          >
            <div className="w-full h-80 overflow-hidden bg-gray-50 relative">
               <img 
                  src={p.image} 
                  alt={p.name} 
                  // Фото приближается
                  className={`w-full h-full object-cover transition-transform duration-700 ${addedId === p.id ? 'scale-110' : 'hover:scale-105'}`} 
               />
               {/* Зеленоватая пелена на фото */}
               <div className={`absolute inset-0 bg-emerald-400/10 transition-opacity duration-300 pointer-events-none ${addedId === p.id ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow justify-between relative bg-white/40">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-1">{p.name}</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Артикул: {p.id}</p>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xl font-light text-gray-900 drop-shadow-sm">
                  {p.price.toLocaleString('ru-RU')} ₽
                </span>
                
                <button 
                  onClick={() => handleAddToCart(p)}
                  // Мощный эффект на самой кнопке
                  className={`px-5 py-3 rounded-xl text-[11px] uppercase tracking-widest transition-all duration-300 font-bold overflow-hidden relative ${
                    addedId === p.id 
                    ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-200 scale-105' 
                    : 'bg-rose-300 text-white hover:bg-rose-400 hover:shadow-md hover:shadow-rose-300/40 active:scale-95'
                  }`}
                >
                  {addedId === p.id ? 'В КОРЗИНЕ ✓' : 'В корзину'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}