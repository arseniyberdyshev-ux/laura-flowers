import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, address, paymentMethod, items, orderId, orderUrl } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Ошибка: Нет ключей от Telegram в .env.local');
      return NextResponse.json({ error: 'Ключи не найдены' }, { status: 500 });
    }

    // Собираем красивый список товаров
    const itemsText = items.map((item: any) => `▫️ ${item.name} (x${item.quantity})`).join('\n');

    // Формируем премиальное сообщение с HTML-разметкой
    const text = `🌸 <b>Новый заказ #${orderId}</b>\n\n` +
                 `👤 <b>Клиент:</b> ${customerName}\n` +
                 `📞 <b>Телефон:</b> ${phone}\n` +
                 `📍 <b>Адрес:</b> ${address}\n` +
                 `💳 <b>Оплата:</b> ${paymentMethod}\n\n` +
                 `🛍️ <b>Состав заказа:</b>\n${itemsText}\n\n` +
                 `🔗 <a href="${orderUrl}">Перейти на страницу заказа</a>`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка от Telegram: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке в ТГ:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}