import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("ОШИБКА: Ключи не найдены в .env.local");
      return NextResponse.json({ error: 'Ключи не настроены' }, { status: 500 });
    }

    const itemsList = data.items.map((item: any) => 
      `• <b>${item.name}</b> (x${item.quantity}) — ${item.price * item.quantity} ₽`
    ).join('\n');

    const total = data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    // Используем HTML-теги вместо Markdown
    const adminMessage = `
<b>🌸 НОВЫЙ ЗАКАЗ L'AURA 🌸</b>

<b>👤 Клиент:</b> ${data.customerName}
<b>📞 Телефон:</b> <code>${data.phone}</code>
<b>📍 Адрес:</b> ${data.address}
<b>💳 Оплата:</b> ${data.paymentMethod}

<b>📜 Состав заказа:</b>
${itemsList}

<b>💰 ИТОГО: ${total} ₽</b>
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: adminMessage,
        parse_mode: 'HTML', // Теперь используем HTML
      }),
    });

    // Если Telegram вернул ошибку, выведем её текст в терминал VS Code
    if (!response.ok) {
      const errorDetail = await response.json();
      console.error('Telegram Error Details:', errorDetail);
      throw new Error('Telegram API error');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}