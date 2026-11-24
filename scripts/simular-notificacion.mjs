// Envía al webhook una notificación firmada igual que Mercado Pago.
// Sirve para probar el flujo sin esperar a que MP notifique.
//
// Uso:
//   node scripts/simular-notificacion.mjs <url-del-webhook> <id-de-pago> <clave-secreta>
// Ejemplo:
//   node scripts/simular-notificacion.mjs https://n8n.ejemplo.com.ar/webhook-test/mercadopago 123456789 abc123
//
// El id tiene que ser un pago real de tu cuenta de PRUEBA, porque el flujo lo consulta en la API.
import crypto from 'node:crypto';

const [url, paymentId, secret] = process.argv.slice(2);
if (!url || !paymentId || !secret) {
  console.error('Uso: node scripts/simular-notificacion.mjs <url> <id-de-pago> <clave-secreta>');
  process.exit(1);
}

const ts = Date.now().toString();
const requestId = crypto.randomUUID();
const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${ts};`;
const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

const res = await fetch(`${url}?data.id=${encodeURIComponent(paymentId)}&type=payment`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-signature': `ts=${ts},v1=${v1}`,
    'x-request-id': requestId,
  },
  body: JSON.stringify({ type: 'payment', action: 'payment.created', data: { id: paymentId } }),
});

console.log(res.status, await res.text());
