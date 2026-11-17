# Sunrise Bakery – static website (SRS v1.0)

Plain HTML, CSS and a little vanilla JavaScript. No build step, no backend. Deploys to Netlify, GitHub Pages or Cloudflare Pages by uploading the folder.

## Run locally
    python3 -m http.server 8000     # then open http://localhost:8000

## Pages
| File | Purpose |
|---|---|
| index.html | Home: hero, ordering info, categories, favourites, how it works, custom cake CTA |
| scones.html / muffins.html / cakes.html | Catalogue pages (rendered from js/products.js) |
| product.html?id=… | Product detail: size/option, quantity, cake message, add to cart |
| cart.html | Cart, collection/delivery, customer details, order summary, payment handoff |
| order-status.html | Confirmed / pending / unsuccessful states (`?status=success|pending|failed&ref=…`; `?demo=all` for review) |
| contact.html | Contact details, enquiry buttons, custom cake process, policies |

## Things the bakery edits
- **js/products.js** – products, prices, options, availability, images (FR-PROD-009). Set `available:false` for "Currently unavailable". Product photos live in `assets/` (one `<product-id>.jpg` per product, already linked via the `image` field). To change a photo, replace the file with the same name; keep new photos compressed (NFR-PERF-002).
- **js/config.js** – phone, email, WhatsApp, hours, collection address, delivery info, lead time, cut-off, delivery fee. Missing values show as "[… – to be supplied]" while `showPlaceholders` is true. **Set it to false before launch** (FR-CON-004).

## Payment (decision still open – SRS 10.4)
The cart validates the customer's details, then redirects to `checkout.paymentUrl` in config.js. Until a provider is chosen, the page clearly says online payment isn't switched on, that the order is **not** placed or paid, and offers a WhatsApp/email order request (FR-ORD-008, NFR-REL-001).

Provider notes:
- **Payment links (Yoco/PayFast):** one link per fixed amount, so a multi-item cart can't map to one link without extra work. Suitable for a very small range.
- **Snipcart (hosted cart):** best fit for multi-item carts; replace the add-to-cart buttons with Snipcart's `data-item-*` attributes and remove js/cart.js.
- Set the provider's return/cancel URLs to `order-status.html?status=success|pending|failed`.
- A redirect is **not proof of payment**: staff confirm payment in the provider dashboard (or via a verified webhook in a serverless function) before preparing an order (FR-BAK-005, FR-PAY-008).
- Never put API keys, tokens or webhook secrets in this repo or in browser code (NFR-SEC-003).

## Before launch (SRS acceptance criteria)
- [ ] Real contact details, hours, collection/delivery rules, lead times in config.js; `showPlaceholders:false`
- [ ] Privacy notice and cancellation/refund policy text in contact.html (FR-ADM-004)
- [ ] Final product list, prices, photos and allergen info
- [ ] Provider chosen; test successful, declined, cancelled and pending payments (AC-007/008/009/015)
- [ ] Prices at checkout match the catalogue (AC-013)
- [ ] HTTPS enabled on the host (AC-012); no secrets in source (AC-011)
- [ ] Test Chrome, Edge, Firefox, Safari at ~360px and desktop widths

## Design notes
Tokens (colours, type, radii) come from the Figma file "Sunrise Bakery System – UI/UX". The primary button uses #C45A0A instead of Figma's #E8741C so white text meets WCAG AA contrast. Fonts (Playfair Display, DM Sans) load from Google Fonts with system fallbacks. The 23 product photos are real; the Home hero and category tiles are still drawn placeholders until photos are supplied.

## Code comments
Every HTML, CSS and JavaScript file has comments explaining what each line or block does.
