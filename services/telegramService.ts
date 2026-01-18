
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_CHAT_ID_2 } from '../constants';
import { Order } from '../types';

export const sendOrderToTelegram = async (order: Order) => {
  const message = `
🔔 *طلب جديد من AM Store*
-----------------------------
👤 *الزبون:* ${order.customerName}
📞 *الهاتف:* ${order.phone}
📍 *الولاية:* ${order.wilaya}
🏙️ *البلدية:* ${order.baladiya}
-----------------------------
⌚ *المنتج:* ${order.productName}
💰 *الإجمالي:* ${order.totalPrice} دج
-----------------------------
📅 التاريخ: ${new Date().toLocaleString('ar-DZ')}
  `;

  const chatIds = [TELEGRAM_CHAT_ID, TELEGRAM_CHAT_ID_2];
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const promises = chatIds.map(id => 
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: id,
          text: message,
          parse_mode: 'Markdown',
        }),
      })
    );
    
    const results = await Promise.all(promises);
    return results.some(res => res.ok);
  } catch (error) {
    console.error('Telegram Error:', error);
    return false;
  }
};
