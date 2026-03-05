'use client'
// Проверь, что здесь стоят две точки!
import { products } from '../data/products';
import { useCart } from '../store/useCart';
import Link from 'next/link';

export default function Home() {
  const addItem = useCart(state => state.addItem);
  const cartItems = useCart(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <main className="max-w-6xl mx-auto p-6 font-sans text-gray-900">
      <header className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
        <h1 className="text-3xl tracking-widest uppercase font-light">L'AURA FLOWERS</h1>
        <Link href="/cart" className="text-sm tracking-wide font-medium hover:text-gray-500 transition">
          КОРЗИНА ({cartCount})
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map(product => (
          <div key={product.id} className="group flex flex-col">
            <div className="aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            </div>
            <h2 className="text-base font-medium mb-2">{product.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{product.price.toLocaleString('ru-RU')} ₽</p>
            <button 
              onClick={() => addItem(product.id)}
              className="mt-auto w-full border border-black py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}