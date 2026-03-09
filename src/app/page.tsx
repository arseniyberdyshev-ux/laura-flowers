'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { useCart } from '../store/useCart';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  // НОВОЕ СОСТОЯНИЕ: Для хранения отзывов
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все'); 
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  
  const { addItem, items } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchReviews(); // Загружаем отзывы при старте
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  // ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ПОСЛЕДНИХ ОТЗЫВОВ
  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6); // Берем 6 самых свежих
    if (!error && data) setReviews(data);
  };

  const categories = ['Все', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filteredProducts = selectedCategory === 'Все' ? products : products.filter(p => p.category === selectedCategory);
  const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const handleAddToCart = (product: any, e?: any) => {
    if (e) e.stopPropagation(); 
    addItem({ ...product, quantity: 1 }); 
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
    setIsCartBumping(true);
    setTimeout(() => setIsCartBumping(false), 300);
    setShowCartTooltip(true);
    setTimeout(() => setShowCartTooltip(false), 2000);
    if (selectedProduct) {
      setTimeout(() => setSelectedProduct(null), 1200); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-sans text-gray-900 selection:bg-rose-200 selection:text-white relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        /* Прячем скроллбар для карусели отзывов, но оставляем скролл */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-50/60 rounded-full blur-[120px] mix-blend-multiply opacity-70"></div>
        <div className="absolute top-[20%] left-[60%] w-[30vw] h-[30vw] bg-pink-50/60 rounded-full blur-[100px] mix-blend-multiply opacity-50 animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center pt-2 gap-4 sticky top-4 z-50">
          <div className="bg-white/70 backdrop-blur-xl px-10 py-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full md:w-auto flex flex-col md:flex-row justify-between items-center flex-grow gap-8 transition-all duration-500 hover:bg-white/80">
            <h1 className="font-serif text-2xl md:text-4xl tracking-[0.1em] uppercase font-medium text-gray-900 drop-shadow-sm text-center">
              Laura Flowers
            </h1>
            <nav className="flex gap-8 text-[10px] md:text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">
              <a href="#" className="hover:text-rose-400 transition-colors">Каталог</a>
              <a href="#" className="hover:text-rose-400 transition-colors">О нас</a>
              <a href="#" className="hover:text-rose-400 transition-colors">Доставка</a>
            </nav>
          </div>

          <div className="relative">
            <Link 
              href="/cart" 
              className={`relative bg-white/70 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 border border-white group flex-shrink-0 z-50 flex items-center justify-center
              ${isCartBumping ? 'scale-110 shadow-rose-200/50 border-rose-100 bg-white' : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white hover:-translate-y-1'}`}
            >
              <span className={`text-2xl inline-block transition-transform duration-300 ${isCartBumping ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>
                🛒
              </span>
              {totalItems > 0 && (
                <span className={`absolute -top-2 -right-2 bg-rose-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md border-2 border-white transition-transform duration-300 ${isCartBumping ? 'scale-125' : 'animate-fade-in'}`}>
                  {totalItems}
                </span>
              )}
            </Link>
            <div className={`absolute top-[120%] right-0 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white text-[10px] uppercase tracking-widest font-bold text-emerald-500 whitespace-nowrap transition-all duration-300 pointer-events-none z-50
              ${showCartTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              ✓ В корзине
            </div>
          </div>
        </header>

        <section className="relative w-full h-[40vh] md:h-[50vh] rounded-[3rem] overflow-hidden mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-fade-in-up border border-white/20">
          <img 
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop" 
            alt="Premium Flowers" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
            <div className="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/20 shadow-2xl">
              <h2 className="font-serif text-3xl md:text-5xl mb-3 font-medium tracking-wide leading-tight">
                Искусство в каждом лепестке
              </h2>
              <div className="w-12 h-[1px] bg-white/60 mx-auto mb-4" />
              <p className="text-[9px] md:text-[11px] tracking-[0.3em] uppercase font-light opacity-90">
                Студия премиальной флористики
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 mb-12 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {categories.map(category => (
            <button
              key={category as string}
              onClick={() => setSelectedCategory(category as string)}
              className={`px-7 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-[0.15em] font-bold transition-all duration-300 backdrop-blur-md ${selectedCategory === category ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105' : 'bg-white/60 text-gray-500 border border-white hover:bg-white hover:text-gray-900 hover:shadow-md hover:-translate-y-0.5'}`}
            >
              {category as string}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white transition-all duration-500 group flex flex-col hover:-translate-y-2 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="h-80 md:h-96 overflow-hidden relative m-3 rounded-[2rem]">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                {product.category && <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-800 text-[9px] uppercase tracking-widest px-4 py-2 rounded-2xl font-bold shadow-sm">{product.category}</span>}
              </div>
              <div className="p-6 pt-4 flex flex-col flex-grow">
                <h2 className="font-serif text-2xl text-gray-900 mb-2 leading-snug">{product.name}</h2>
                <div className="mt-auto flex justify-between items-end pt-4">
                  <p className="text-xl md:text-2xl font-light text-gray-700 tracking-tight">{product.price.toLocaleString('ru-RU')} ₽</p>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 active:scale-90 shadow-sm
                      ${addedProductId === product.id ? 'bg-emerald-400 text-white shadow-emerald-400/40' : 'bg-gray-100 text-gray-900 hover:bg-rose-300 hover:text-white'}
                    `}
                  >
                    {addedProductId === product.id ? '✓' : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* НОВЫЙ БЛОК ОТЗЫВОВ */}
        {reviews.length > 0 && (
          <section className="mt-24 mb-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
             <div className="text-center mb-10">
               <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-4 tracking-wide">Говорят о нас</h2>
               <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">Искренние эмоции наших клиентов</p>
             </div>
             
             {/* Карусель отзывов */}
             <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar px-4 -mx-4 md:px-0 md:mx-0">
                {reviews.map(review => (
                   <div key={review.id} className="min-w-[300px] md:min-w-[380px] bg-white/50 backdrop-blur-xl p-8 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white snap-center flex flex-col hover:bg-white/80 transition-all hover:-translate-y-1">
                      <div className="flex gap-1 mb-6 text-rose-400 text-xl">
                         {/* Отрисовка звездочек */}
                         {Array.from({length: 5}).map((_, i) => (
                            <span key={i} className={i < review.rating ? 'opacity-100 drop-shadow-sm' : 'opacity-20 grayscale'}>★</span>
                         ))}
                      </div>
                      <p className="text-gray-600 font-serif text-lg leading-relaxed italic mb-8 flex-grow">«{review.comment}»</p>
                      <div className="mt-auto border-t border-gray-200/50 pt-6 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-200 to-indigo-100 flex items-center justify-center text-gray-700 font-serif text-xl border border-white shadow-sm">
                           {review.customer_name?.charAt(0).toUpperCase() || 'Г'}
                         </div>
                         <div>
                           <p className="font-bold text-gray-900 text-[10px] uppercase tracking-[0.15em]">{review.customer_name || 'Гость'}</p>
                           <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('ru-RU')}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </section>
        )}

        <footer className="mt-16 mb-8 bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div>
                 <h3 className="font-serif text-3xl text-gray-900 mb-4 tracking-wide">Laura Flowers</h3>
                 <p className="text-sm text-gray-500 leading-relaxed font-light">Студия премиальной флористики. Создаем не просто букеты, а доставляем чувства.</p>
              </div>
              <div className="flex flex-col gap-4 text-sm text-gray-500 font-light items-center md:items-start">
                 <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold">Клиентам</h4>
                 <a href="#" className="hover:text-rose-400 transition-colors">Условия доставки</a>
                 <a href="#" className="hover:text-rose-400 transition-colors">Гарантия свежести</a>
              </div>
              <div className="flex flex-col gap-4 text-sm text-gray-500 font-light items-center md:items-start">
                 <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-900 font-bold">Контакты</h4>
                 <p>+7 (999) 000-00-00</p>
                 <p>г. Москва, ул. Цветочная, 1</p>
              </div>
           </div>
        </footer>
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/30 backdrop-blur-md transition-opacity animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-white" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-gray-900 hover:text-white text-gray-500 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur-md text-xl">✕</button>
            <div className="w-full md:w-1/2 h-72 md:h-auto relative p-3"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-[2.5rem]" /></div>
            <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold mb-4">{selectedProduct.category || 'Премиум коллекция'}</span>
              <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-6 leading-tight">{selectedProduct.name}</h2>
              <p className="text-gray-500 font-light leading-relaxed mb-8 text-sm md:text-base">Этот изысканный букет собран нашими флористами с особым вниманием к деталям.</p>
              <div className="flex items-center justify-between mt-auto pt-6">
                <p className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">{selectedProduct.price.toLocaleString('ru-RU')} ₽</p>
                <button 
                  onClick={() => handleAddToCart(selectedProduct)} 
                  className={`px-8 md:px-10 py-4 md:py-5 rounded-2xl uppercase tracking-[0.15em] text-[10px] md:text-xs font-bold transition-all shadow-xl active:scale-95
                    ${addedProductId === selectedProduct.id ? 'bg-emerald-400 text-white shadow-emerald-400/40' : 'bg-gray-900 text-white hover:bg-rose-400'}
                  `}
                >
                  {addedProductId === selectedProduct.id ? '✓ Добавлено' : 'В корзину'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* КНОПКА АДМИНКИ */}
      <Link href="/admin" className="fixed bottom-8 right-8 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-xl shadow-gray-900/20 hover:bg-rose-400 hover:shadow-rose-400/30 hover:-translate-y-1 transition-all z-40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 backdrop-blur-md border border-white/20">
        <span className="text-lg">⚙️</span>Админка
      </Link>
    </main>
  );
}