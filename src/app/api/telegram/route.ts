import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Не настроены ключи Telegram в .env');
    }

    // Собираем красивый список букетов
    const itemsText = data.items.map((item: any) => 
      `▫️ ${item.name} (x${item.quantity}) — ${item.price * item.quantity} ₽`
    ).join('\n');

    // Считаем итоговую сумму
    const total = data.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Формируем сообщение с HTML-разметкой
// Формируем сообщение с HTML-разметкой
    const message = `
🌸 <b>НОВЫЙ ЗАКАЗ #${data.orderId || '???'}</b> 🌸

👤 <b>Имя:</b> ${data.customerName}
📞 <b>Телефон:</b> ${data.phone}
📍 <b>Адрес:</b> ${data.address}
💳 <b>Оплата:</b> ${data.paymentMethod}

💐 <b>Состав заказа:</b>
${itemsText}

💰 <b>Итого:</b> ${total} ₽

🔗 <b>УПРАВЛЕНИЕ ЗАКАЗОМ:</b>
${data.orderUrl}
    `;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML', // Разрешаем жирный текст и красивые ссылки
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при отправке в Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}