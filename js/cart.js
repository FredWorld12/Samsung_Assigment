/* ==========================================================================
   Sunrise Bakery – cart & checkout page.
   Shows the cart, collects order details, validates them, then hands off to the
   configured payment provider (CFG.checkout.paymentUrl).
   No card details are ever collected on this page (FR-PAY-003).
   ========================================================================== */

// Run immediately inside a wrapper so variables stay private
(function () {
  "use strict"; // strict mode catches common mistakes
  var S = window.SBS, CFG = S.cfg;                   // shared helpers/cart and the settings
  var root = document.getElementById("cart-root");   // the container this page fills in
  var F = CFG.fulfilment;                            // shortcut to the collection/delivery settings

  // The earliest date a customer may pick, as "YYYY-MM-DD" (today plus the lead time in whole days)
  var minDate = (function () {
    var d = new Date();                                                                   // today
    d.setDate(d.getDate() + (CFG.leadTimeHours ? Math.ceil(CFG.leadTimeHours / 24) : 0)); // add the lead time, rounded up to whole days
    var m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0"); // month and day with leading zeros
    return d.getFullYear() + "-" + m + "-" + day;                                         // format as YYYY-MM-DD
  })();

  // Build one form field: a label, the input, optional hint text and a hidden error message
  function field(id, label, input, hint) {
    return '<div class="field" data-field="' + id + '"><label for="' + id + '">' + label + "</label>" + input + // wrapper, label and the input itself
      (hint ? '<span class="small muted" id="' + id + '-hint">' + hint + "</span>" : "") +                      // optional helper text
      '<span class="field__err" id="' + id + '-err" hidden></span></div>';                                       // error text, hidden until needed
  }

  // Build one "Collection" / "Delivery" choice card
  function radio(value, title, sub, checked) {
    return '<label class="radio-card"><input type="radio" name="fulfil" value="' + value + '"' + (checked ? " checked" : "") + ">" + // the radio button
      '<span><strong>' + title + "</strong><br><span class=\"small muted\">" + sub + "</span></span></label>";                          // its title and subtitle
  }

  // Build the whole checkout form (items, fulfilment, details, summary)
  function skeleton() {
    var first = F.collection ? "collection" : "delivery"; // which option is pre-selected
    var opts = "";                                         // HTML for the choice cards
    if (F.collection) opts += radio("collection", "Collection", S.esc(CFG.bakery.collectionAddress || (CFG.showPlaceholders ? "Free · [address – to be supplied]" : "Free")), first === "collection"); // add Collection if offered
    if (F.delivery) opts += radio("delivery", "Delivery", S.esc(CFG.bakery.deliveryInfo || "Fee and areas confirmed by the bakery"), first === "delivery"); // add Delivery if offered
    return '<form class="checkout" id="checkout-form" novalidate>' + // novalidate: we show our own friendlier error messages
      '<div><section class="panel" aria-labelledby="items-h"><h2 id="items-h" class="sr-only">Items in your cart</h2><div id="lines"></div></section>' + // panel that will list the cart items
      '<section class="panel" id="details-panel" aria-labelledby="fulfil-h"><h2 id="fulfil-h">Collection or delivery</h2>' +                           // fulfilment and details panel
      '<div class="stack" style="--gap:20px;margin-top:20px"><fieldset><legend class="sr-only">Fulfilment method</legend><div class="row2" style="margin-top:0">' + opts + "</div></fieldset>" + // the choice cards
      '<div class="row2">' +
      field("date", "Preferred date", '<input id="date" name="date" type="date" min="' + minDate + '" required aria-describedby="date-hint date-err">', S.esc(S.leadText())) + // date picker with minimum date
      field("time", "Preferred time", '<select id="time" name="time"><option value="Any time">Any time</option><option>Morning (before 12:00)</option><option>Afternoon (12:00–17:00)</option></select>') + // time-of-day dropdown
      "</div></div>" +
      '<h2 style="margin-top:32px">Your details</h2><div class="stack" style="--gap:16px;margin-top:20px">' +
      '<div class="row2">' +
      field("name", "Full name", '<input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" required aria-describedby="name-err">') +                      // name box
      field("phone", "Mobile number", '<input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="e.g. 082 000 0000" aria-describedby="phone-err">') +                // phone box
      "</div>" +
      field("email", "Email", '<input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" aria-describedby="email-err">', "Give us a mobile number, an email, or both, so we can reach you about your order.") + // email box
      field("notes", "Notes for the bakery (optional)", '<textarea id="notes" name="notes" placeholder="Allergies, delivery instructions, anything we should know"></textarea>') +   // notes box
      "</div></section></div>" +
      '<aside class="panel panel--peach summary" aria-labelledby="sum-h"><h2 id="sum-h">Order summary</h2><div id="summary"></div>' + // summary panel (totals filled in later)
      '<button class="btn btn--block" type="submit" id="pay">Continue to secure payment</button>' +                                    // the submit button
      '<div id="checkout-msg" role="alert" tabindex="-1"></div>' +                                                                    // area for the result message
      '<p class="small muted">You’ll be taken to our payment provider’s secure page. We never see or store your card details.</p>' +
      '<p class="small muted">Your order is confirmed only once payment succeeds. <span data-lead-text></span></p></aside></form>';
  }

  // Build the message shown when the cart is empty
  function emptyState() {
    return '<div class="empty panel"><h2>Your cart is empty</h2><p class="muted">Add something fresh from the bakery to get started.</p>' +
      '<div class="btn-row"><a class="btn" href="scones.html">Browse scones</a><a class="btn btn--secondary" href="muffins.html">Browse muffins</a><a class="btn btn--secondary" href="cakes.html">Browse cakes</a></div></div>';
  }

  var built = false; // remembers whether the form has been drawn (so typed details aren't wiped on every change)

  // Make sure the right layout is showing; returns true if there are items to display
  function ensure() {
    var has = S.cart.lines().length > 0; // is there anything in the cart?
    if (!has) { root.innerHTML = emptyState(); built = false; return false; } // empty: show the empty message
    if (!built) { // first time with items: draw the form
      root.innerHTML = skeleton(); built = true;                                         // draw it and remember
      root.querySelector("[data-lead-text]").textContent = S.leadText();                 // fill in the lead-time sentence
      root.querySelector("#checkout-form").addEventListener("submit", onSubmit);         // handle the submit button
      root.querySelector("#checkout-form").addEventListener("change", function (e) { if (e.target.name === "fulfil") renderSummary(); }); // recalculate totals when Collection/Delivery changes
    }
    return true; // there are items to render
  }

  // Draw the list of cart items with quantity controls
  function renderLines() {
    var el = root.querySelector("#lines"); // where the items go
    el.innerHTML = S.cart.lines().map(function (l) { // one row per cart line
      var k = S.esc(l.key); // safe version of the line's key
      return '<div class="line" data-key="' + k + '">' + S.photo(l.product) + // row with the product picture
        '<div><div class="line__name">' + S.esc(l.product.name) + "</div>" + // product name
        '<div class="small muted">' + S.esc(l.option ? l.option.label : "Single") + (l.note ? " · Message: “" + S.esc(l.note) + "”" : "") + "</div></div>" + // chosen size and cake message
        '<div class="line__price">' + S.fmt(l.total) + "</div>" + // line total price
        '<div class="line__ctrl"><div class="stepper" role="group" aria-label="Quantity for ' + S.esc(l.product.name) + '">' + // quantity stepper
        '<button type="button" data-dec aria-label="Decrease quantity">–</button><output>' + l.qty + '</output><button type="button" data-inc aria-label="Increase quantity">+</button></div>' +
        '<button type="button" class="link-btn" data-remove aria-label="Remove ' + S.esc(l.product.name) + '">Remove</button></div></div>'; // remove link
    }).join(""); // join all rows
  }

  // Which fulfilment option is currently chosen ("collection" or "delivery")
  function fulfil() { var r = root.querySelector('input[name="fulfil"]:checked'); return r ? r.value : "collection"; }

  // Work out subtotal, delivery and total for the chosen option
  function totals() {
    var sub = S.cart.subtotal(), delivery = 0, deliveryText = "R 0.00"; // start with no delivery cost
    if (fulfil() === "delivery") { // customer chose delivery
      if (typeof F.deliveryFee === "number") { delivery = F.deliveryFee; deliveryText = S.fmt(F.deliveryFee); } // a fixed fee is configured
      else deliveryText = "Confirmed by bakery"; // no fee yet: the bakery will confirm it
    } else deliveryText = "R 0.00 (collection)"; // collection is free
    return { sub: sub, delivery: delivery, deliveryText: deliveryText, total: sub + delivery }; // all the numbers
  }

  // Draw the order summary box (subtotal, delivery, total)
  function renderSummary() {
    var t = totals(), n = S.cart.count(); // totals and item count
    root.querySelector("#summary").innerHTML =
      '<div class="stack" style="--gap:14px"><div class="summary__row"><span>Subtotal (' + n + (n === 1 ? " item" : " items") + ")</span><span>" + S.fmt(t.sub) + "</span></div>" + // subtotal row
      '<div class="summary__row"><span>Delivery</span><span>' + S.esc(t.deliveryText) + "</span></div>" +                                                     // delivery row
      '<div class="summary__row summary__total"><span>Total</span><span>' + S.fmt(t.total) + "</span></div></div>";                                            // total row
  }

  // Redraw everything that depends on the cart
  function render() { if (ensure()) { renderLines(); renderSummary(); } }

  // Handle clicks on the + / – / Remove buttons in the item list
  function onClick(e) {
    var line = e.target.closest(".line"); // which cart row was clicked?
    if (!line) return;                    // clicked elsewhere: ignore
    var key = line.getAttribute("data-key"); // that row's key
    var cur = S.cart.lines().filter(function (l) { return l.key === key; })[0]; // the matching cart line
    if (!cur) return; // line not found: ignore
    if (e.target.closest("[data-inc]")) S.cart.setQty(key, cur.qty + 1);         // "+" adds one
    else if (e.target.closest("[data-dec]")) S.cart.setQty(key, cur.qty - 1);    // "–" removes one (at zero the line disappears)
    else if (e.target.closest("[data-remove]")) S.cart.remove(key);              // "Remove" deletes the line
  }

  // Show or clear the error message under one field
  function setErr(id, msg) {
    var wrap = root.querySelector('[data-field="' + id + '"]'), err = root.querySelector("#" + id + "-err"), input = root.querySelector("#" + id); // the field's parts
    if (!wrap) return; // field not on the page: nothing to do
    if (msg) { wrap.classList.add("field--invalid"); err.textContent = msg; err.hidden = false; input.setAttribute("aria-invalid", "true"); } // show the error
    else { wrap.classList.remove("field--invalid"); err.hidden = true; input.removeAttribute("aria-invalid"); }                                // clear the error
  }

  // Check the form; returns the order details if valid, or null if something needs fixing
  function validate() {
    var v = function (id) { return root.querySelector("#" + id).value.trim(); }; // read a field's value without spaces at the ends
    var bad = []; // ids of fields with problems
    var check = function (id, msg) { setErr(id, msg); if (msg) bad.push(id); }; // show/clear an error and remember bad fields
    check("name", v("name") ? "" : "Enter your name."); // name is required
    var phone = v("phone"), email = v("email");         // phone and email values
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);   // simple email shape check
    var phoneOk = phone.replace(/[^\d]/g, "").length >= 9;    // phone needs at least 9 digits
    check("phone", phone && !phoneOk ? "Enter a valid mobile number." : (!phone && !email ? "Enter a mobile number or an email." : "")); // need a valid phone, or an email instead
    check("email", email && !emailOk ? "Enter a valid email address." : ""); // email must look right if given
    var d = v("date"); // chosen date
    check("date", !d ? "Choose a date." : (d < minDate ? "Choose a later date to allow for our lead time." : "")); // date required and not too soon
    if (bad.length) { root.querySelector("#" + bad[0]).focus(); return null; } // focus the first problem and stop
    return { name: v("name"), phone: phone, email: email, date: d, time: root.querySelector("#time").value, notes: v("notes"), fulfilment: fulfil() }; // everything is fine
  }

  // Turn the cart and details into plain text (used for the WhatsApp/email order request)
  function orderText(o) {
    var t = totals(); // current totals
    var lines = S.cart.lines().map(function (l) { // one text line per cart item
      return "- " + l.qty + " × " + l.product.name + (l.option ? " (" + l.option.label + ")" : "") + (l.note ? " – message: " + l.note : "") + " = " + S.fmt(l.total);
    });
    return ["Order request – " + CFG.bakery.name, ""].concat(lines, [ // title, then the items, then the totals and customer details
      "", "Subtotal: " + S.fmt(t.sub), "Delivery: " + t.deliveryText, "Total: " + S.fmt(t.total), "",
      "Method: " + o.fulfilment, "Date: " + o.date + " (" + o.time + ")", "Name: " + o.name,
      "Phone: " + (o.phone || "–"), "Email: " + (o.email || "–"), "Notes: " + (o.notes || "–")
    ]).join("\n"); // join everything with line breaks
  }

  // Handle the "Continue to secure payment" button
  function onSubmit(e) {
    e.preventDefault(); // stop the browser's default form submission
    var msg = root.querySelector("#checkout-msg"); // the result message area
    msg.className = ""; msg.innerHTML = "";         // clear any earlier message
    var o = validate(); // check the form
    if (!o) return;     // problems found: stay on the page
    try { window.sessionStorage.setItem("sbs_order_draft", JSON.stringify({ order: o, text: orderText(o) })); } catch (err) { /* ignore if storage is blocked */ } // keep a copy of the order details for this visit

    // Hand off to the provider's hosted checkout. The provider's own result (and, ideally, a verified
    // webhook) decides whether the order is paid – never this page (FR-PAY-004, FR-BAK-005).
    if (CFG.checkout.paymentUrl) { window.location.href = CFG.checkout.paymentUrl; return; } // a provider is set up: go to its secure payment page

    var text = encodeURIComponent(orderText(o)); // order text made safe for use inside a link
    var wa = CFG.bakery.whatsapp ? '<a class="btn btn--sm" href="https://wa.me/' + S.esc(CFG.bakery.whatsapp.replace(/\D/g, "")) + "?text=" + text + '">Send request by WhatsApp</a>' : ""; // WhatsApp button if a number is set
    var mail = CFG.bakery.email ? '<a class="btn btn--secondary btn--sm" href="mailto:' + S.esc(CFG.bakery.email) + "?subject=" + encodeURIComponent("Order request") + "&body=" + text + '">Send request by email</a>' : ""; // email button if an address is set
    msg.className = "notice notice--error"; // style the message as a warning
    msg.innerHTML = "<strong>Online payment isn’t switched on yet.</strong> Your order has <em>not</em> been placed or paid. " + // be honest that nothing was paid (FR-ORD-008)
      (wa || mail ? 'Send your request to the bakery and they’ll confirm it with you:<div class="btn-row" style="margin-top:12px">' + wa + mail + "</div>" // offer the request buttons
        : 'Please <a href="contact.html">contact the bakery</a> to place this order.'); // or point to the Contact page
    msg.focus(); // move focus to the message so screen readers announce it
  }

  root.addEventListener("click", onClick);     // listen for item +/–/Remove clicks (attached once)
  render();                                    // draw the page now
  window.addEventListener("sbs:cart", render); // redraw whenever the cart changes
})(); // end of the wrapper
