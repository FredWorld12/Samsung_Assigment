/* ==========================================================================
   Sunrise Bakery – site configuration
   Fill these in as the bakery confirms them (SRS FR-CON-001..004, FR-ORD-006/007, FR-PAY-001).
   NEVER put secret keys, API tokens or webhook secrets in this file (FR-PAY-007, NFR-SEC-003),
   because everything in this file is public and visible to anyone using the website.
   ========================================================================== */

// Store all settings on one global object that the other scripts read
window.SBS_CONFIG = {

  // While true, any missing detail shows as "[… – to be supplied]". Set to false before launch (FR-CON-004).
  showPlaceholders: true,

  // Business details shown in the footer, on the Contact page and in order requests
  bakery: {
    name: "Sunrise Bakery",   // business name used in the logo, page titles and order messages
    phone: "",                // phone number, e.g. "+27 82 000 0000" (empty = not supplied yet)
    email: "",                // email address, e.g. "orders@example.co.za"
    whatsapp: "",             // WhatsApp number as digits only with country code, e.g. "27820000000"
    hours: "",                // opening hours, e.g. "Mon–Sat 7:00–16:00"
    collectionAddress: "",    // where customers collect orders
    deliveryInfo: ""          // delivery areas and fees, if delivery is offered
  },

  // Ordering rules decided by the bakery (SRS 8.5)
  leadTimeHours: null,        // minimum hours of notice needed, e.g. 24 (null = not decided yet)
  cutOffTime: "",             // daily order cut-off, e.g. "15:00 the day before"
  fulfilment: {
    collection: true,         // true = customers may choose to collect
    delivery: true,           // true = customers may choose delivery
    deliveryFee: null         // delivery fee in rand, or null = "confirmed by the bakery"
  },

  // Checkout handoff. Choose ONE provider (SRS 10.4) and validate it with a test order.
  checkout: {
    provider: "",             // which provider is used: "yoco", "payfast" or "snipcart" (for your own reference)
    paymentUrl: ""            // the provider's hosted payment/checkout link (a public URL only, never a secret)
  }
}; // end of settings
