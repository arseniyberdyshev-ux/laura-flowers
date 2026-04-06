'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Импортируем supabase (не db!)
import { useCart } from '../store/useCart'; // ВОТ ЭТОГО НЕ ХВАТАЛО
import Link from 'next/link';

// ... остальной код

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [isCartBumping, setIsCartBumping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [showCartTooltip, setShowCartTooltip] = useState(false);

  const { addItem, items } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProduct]);

  // Запрашиваем товары из Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Ошибка при загрузке товаров:", error);
    } finally {
      setLoading(false);
    }
  };

  // Запрашиваем отзывы из Supabase
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.error("Ошибка при загрузке отзывов:", error);
    }
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

  return (
    <main className="min-h-screen bg-[#FDFDFD] p-4 md:p-6 font-sans text-gray-900 selection:bg-rose-200 selection:text-white relative overflow-hidden">

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; transform: translateY(30px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
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
              VIKI FLOWERS
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
          </div>
        </header>

        <section className="relative w-full h-[40vh] md:h-[50vh] rounded-[3rem] overflow-hidden mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-fade-in-up border border-white/20">
          <img
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2000&auto=format&fit=crop"
            alt="Premium Flowers"
            loading="lazy"
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

        {!loading && categories.length > 1 && (
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] h-[450px] animate-pulse border border-white shadow-sm flex flex-col p-3">
                <div className="w-full h-80 bg-gray-200/50 rounded-[2rem]"></div>
                <div className="p-6 space-y-4 mt-auto">
                  <div className="h-6 bg-gray-200/50 rounded-full w-3/4"></div>
                  <div className="h-8 bg-gray-200/50 rounded-full w-1/3"></div>
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white transition-all duration-500 group flex flex-col hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="h-80 md:h-96 overflow-hidden relative m-3 rounded-[2rem]">
                  <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
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
            ))
          )}
        </div>

        <footer className="mt-16 mb-8 bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div>
                 <h3 className="font-serif text-3xl text-gray-900 mb-4 tracking-wide">VIKI FLOWERS</h3>
                 <p className="text-sm text-gray-500 leading-relaxed font-light">Студия премиальной флористики.</p>
              </div>
           </div>
        </footer>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/30 backdrop-blur-md transition-opacity animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-white" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-gray-900 hover:text-white text-gray-500 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur-md text-xl">✕</button>
            <div className="w-full md:w-1/2 h-72 md:h-auto relative p-3"><img src={selectedProduct.image} alt={selectedProduct.name} loading="lazy" className="w-full h-full object-cover rounded-[2.5rem]" /></div>
            <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold mb-4">{selectedProduct.category || 'Премиум коллекция'}</span>
              <h2 className="font-serif text-3xl md:text-5xl text-gray-900 mb-6 leading-tight">{selectedProduct.name}</h2>
              <div className="flex items-center justify-between mt-auto pt-6">
                <p className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">{selectedProduct.price.toLocaleString('ru-RU')} ₽</p>
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className={`px-8 md:px-10 py-4 md:py-5 rounded-2xl uppercase tracking-[0.15em] text-[10px] md:text-xs font-bold transition-all shadow-xl active:scale-95 bg-gray-900 text-white hover:bg-rose-400`}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Link href="/admin" className="fixed bottom-8 right-8 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-xl hover:bg-rose-400 transition-all z-40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 backdrop-blur-md">
        <span className="text-lg">⚙️</span>Админка
      </Link>
    </main>
  );
}