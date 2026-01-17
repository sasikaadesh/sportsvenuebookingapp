# PayHere Sandbox Setup (Non-invasive test flow)

This project includes a minimal PayHere sandbox integration that does not change booking behavior. It provides:
- Server-side hash generation: `POST /api/payments/payhere/hash`
- Secure notify endpoint: `POST /api/payments/payhere/notify`
- Test page: `/test-payhere` (loads payhere.js and opens the sandbox popup)

## 1) Environment variables
Add these to `.env.local`:

```
# Public base URL (used to build absolute notify_url)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PayHere Sandbox credentials
PAYHERE_MERCHANT_ID=your_sandbox_merchant_id
PAYHERE_MERCHANT_SECRET=your_sandbox_merchant_secret
NEXT_PUBLIC_PAYHERE_SANDBOX=true
```

You can find Merchant ID and create a Merchant Secret in PayHere Dashboard → Integrations. Use Sandbox credentials.

## 2) Run
```bash
npm run dev
```
Visit `http://localhost:3000/test-payhere` and click "Pay with PayHere (Sandbox)".

## 3) Notes
- Hash is generated on the server per PayHere docs:
  `UPPER(md5(merchant_id + order_id + amount(2dp) + currency + UPPER(md5(merchant_secret))))`.
- PayHere sends the final status to `notify_url` (server-to-server). The return URL does not include the status.
- The notify handler verifies `md5sig`. If `order_id` is a UUID of an existing booking, it will update that booking's `status` and `payment_status` accordingly. Otherwise it just responds 200 for PayHere.
- For local testing of `notify_url`, expose your dev server with a tunnel (e.g., ngrok) and set `NEXT_PUBLIC_APP_URL` to that public URL.

## 4) Wiring into real booking (optional)
- Create a booking with `status=pending` and `payment_status=pending`, then start PayHere with `order_id = booking.id`.
- On notify success (`status_code=2`), set `status=confirmed` and `payment_status=paid`.
- Show confirmation on your return page by fetching the booking by `order_id`.

