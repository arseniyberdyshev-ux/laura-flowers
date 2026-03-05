// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: "L'AURA FLOWERS | Премиальная доставка",
  description: "Доставка премиальных букетов",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}