/* ==========================================================================
   Sunrise Bakery – order status page.
   The payment provider redirects here with ?status=success|pending|failed (and optional ?ref=...).
   Set the provider's return/cancel URLs to point at this page.
   IMPORTANT: a redirect alone is not proof of payment (SRS 8.5). Staff must verify the payment in the
   provider dashboard (or via a verified webhook) before treating an order as paid (FR-BAK-005).
   Opening the page with ?demo=all shows all three states for design review.
   ========================================================================== */

// Run immediately inside a wrapper so variables stay private
(function () {
  "use strict"; // strict mode catches common mistakes
  var S = window.SBS;                                      // shared helpers and cart
  var q = new URLSearchParams(window.location.search);     // the values after "?" in the address
  var status = q.get("status");                            // success, pending or failed (or null)
  var ref = q.get("ref");                                  // the provider's order reference (or null)
  var root = document.getElementById("status-root");       // the container this page fills in

  // The three round icons, drawn as inline SVG pictures (white on a coloured circle)
  var ICON = {
    ok: '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M9 19l6 6 12-13" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',                                                                    // tick mark
    wait: '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="12" stroke="#fff" stroke-width="4"/><path d="M18 11v8l5 3" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>', // clock
    bad: '<svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M11 11l14 14M25 11L11 25" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>'                                                                              // cross
  };

  // The wording and buttons for each state
  var STATES = {
    success: { cls: "ok", title: "Order confirmed", body: "Thank you! Your payment was successful and your order has been received. If your provider is set up to send confirmations, you’ll get one shortly. We’ll be in touch if we need to confirm anything.", btn1: ["index.html", "Back to home"], btn2: ["contact.html", "Contact us"], ref: true },       // payment worked
    pending: { cls: "wait", title: "Payment pending", body: "We’re waiting for your payment provider to confirm your payment. Please don’t pay again yet. We’ll treat your order as paid only once it’s confirmed.", btn1: ["contact.html", "Contact us"], btn2: ["index.html", "Back to home"], ref: true },                                      // still waiting
    failed: { cls: "bad", title: "Payment unsuccessful", body: "Your payment didn’t go through and your order hasn’t been placed. You can try again or reach out and we’ll help.", btn1: ["cart.html", "Try payment again"], btn2: ["contact.html", "Contact us"], ref: false }                                                       // payment failed
  };

  // Build the HTML card for one state
  function card(key, single) {
    var s = STATES[key]; // the wording for this state
    // show the reference for success/pending, or "No order has been placed" for failed
    var refLine = s.ref ? '<p class="small muted">Reference: ' + S.esc(ref || "[provider reference]") + "</p>" : '<p class="small muted">No order has been placed</p>';
    return '<section class="status status--' + s.cls + (single ? " status--single" : "") + '" aria-labelledby="st-' + key + '">' + // card wrapper (coloured by state)
      '<div class="status__icon">' + ICON[s.cls] + "</div><h2 id=\"st-" + key + '">' + s.title + "</h2><p class=\"muted\">" + s.body + "</p>" + refLine + // icon, title, message and reference
      '<div class="btn-row" style="justify-content:center"><a class="btn" href="' + s.btn1[0] + '">' + s.btn1[1] + '</a><a class="btn btn--secondary" href="' + s.btn2[0] + '">' + s.btn2[1] + "</a></div></section>"; // two buttons
  }

  if (q.get("demo") === "all") { // design-review mode: show all three cards side by side
    root.innerHTML = '<div class="status-grid">' + card("success") + card("pending") + card("failed") + "</div>";
  } else if (STATES[status]) { // a valid status was supplied by the provider
    if (status === "success") S.cart.clear(); // payment succeeded, so empty the cart
    root.innerHTML = card(status, true);                      // show that one card
    document.title = STATES[status].title + " | Sunrise Bakery"; // put the status in the browser tab title
  } else { // no (or an unknown) status: don't pretend anything happened
    root.innerHTML = '<div class="empty"><h2>There’s no order status to show</h2><p class="muted">If you’ve just paid, please check your email for a confirmation from the payment provider, or contact us.</p>' +
      '<div class="btn-row"><a class="btn" href="index.html">Back to home</a><a class="btn btn--secondary" href="contact.html">Contact us</a></div></div>';
  }
})(); // end of the wrapper
