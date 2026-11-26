/* ==========================================================================
   Sunrise Bakery – shared behaviour used on every page:
   header, footer, cart store (add/remove/count) and small helper functions.
   ========================================================================== */

// Wrap everything in a function that runs immediately so our variables don't leak into the page
(function () {
  "use strict"; // turn on strict mode so common coding mistakes throw errors instead of being ignored

  var CFG = window.SBS_CONFIG;               // shortcut to the settings from config.js
  var PRODUCTS = window.SBS_PRODUCTS || [];  // shortcut to the product list from products.js (empty list if missing)

  /* ---------- helpers ---------- */

  // Turn a number into a rand price string, e.g. 28 -> "R 28.00"
  function fmt(n) { return "R " + Number(n).toFixed(2); } // Number() makes sure it is numeric; toFixed(2) gives two decimals

  // Make text safe to put inside HTML so special characters can't break the page (or inject code)
  function esc(s) {
    // null/undefined become an empty string, then each risky character is swapped for its safe HTML code
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; // look up the safe replacement
    });
  }

  // Return a configured value, or a clearly marked placeholder while the bakery has not supplied it yet
  function val(v, label) { return v ? v : (CFG.showPlaceholders ? "[" + label + " – to be supplied]" : ""); }

  // Find a product by its id; returns null if there is no match
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; // loop until the id matches
    return null; // nothing matched
  }

  // The lowest price for a product (used for the "From R 320.00" label on products with sizes)
  function fromPrice(p) {
    if (p.options && p.options.length) { // product has sizes/options
      return Math.min.apply(null, p.options.map(function (o) { return o.price; })); // smallest option price
    }
    return p.price; // otherwise the single price
  }

  // Build the sentence that explains lead time and cut-off, using placeholders until they are configured
  function leadText() {
    var h = CFG.leadTimeHours ? CFG.leadTimeHours + " hours" : "[X hours]"; // hours of notice, or a placeholder
    var c = CFG.cutOffTime ? CFG.cutOffTime : "[time]";                     // cut-off time, or a placeholder
    return "Order at least " + h + " ahead. Cut-off: " + c + ".";           // final sentence
  }

  // Build the HTML for a product picture: the real photo if there is one, otherwise a drawn placeholder
  function photo(p) {
    if (p && p.image) { // the product has an image path in products.js
      // lazy-load the image and give it the product name as alt text for screen readers
      return '<div class="photo photo--img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></div>';
    }
    // no image: draw the decorative placeholder shapes (hidden from screen readers)
    return '<div class="photo" aria-hidden="true"><span class="photo__a"></span><span class="photo__b"></span></div>';
  }

  /* ---------- cart store (localStorage with in-memory fallback) ---------- */

  var KEY = "sbs_cart_v1"; // the name the cart is saved under in the browser's storage
  var mem = [];            // backup copy of the cart in case browser storage is blocked

  // Read the saved cart lines (a list of {id, opt, qty, note})
  function load() {
    try { var raw = window.localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } // read and decode the saved cart
    catch (e) { return mem; } // storage unavailable (e.g. private mode): use the in-memory copy
  }

  // Save the cart lines and tell the page the cart changed
  function save(lines) {
    mem = lines; // keep the backup copy up to date
    try { window.localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* storage unavailable: ignore */ } // write to browser storage
    window.dispatchEvent(new Event("sbs:cart")); // broadcast "cart changed" so counters and the cart page refresh
  }

  // Build a unique key for a cart line from the product id and chosen option
  function lineKey(id, opt) { return id + "::" + (opt || ""); }

  // Turn a saved cart line into a full object with product, option, unit price and line total
  function resolve(line) {
    var p = byId(line.id);     // find the product this line refers to
    if (!p) return null;       // product no longer exists: drop the line
    var opt = null, price = p.price; // default: no option and the product's own price
    if (p.options && p.options.length) { // product has sizes
      // find the chosen option, falling back to the first one if it can't be found
      opt = p.options.filter(function (o) { return o.id === line.opt; })[0] || p.options[0];
      price = opt.price; // use the option's price instead
    }
    // return everything the pages need to display this line
    return { key: lineKey(line.id, line.opt), product: p, option: opt, qty: line.qty, note: line.note || "", unit: price, total: price * line.qty };
  }

  // The public cart object other scripts use
  var cart = {
    // All cart lines, fully resolved (invalid lines removed)
    lines: function () { return load().map(resolve).filter(Boolean); },
    // Total number of items (sum of all quantities)
    count: function () { return cart.lines().reduce(function (n, l) { return n + l.qty; }, 0); },
    // Total price of all lines before delivery
    subtotal: function () { return cart.lines().reduce(function (n, l) { return n + l.total; }, 0); },
    // Add a product to the cart; returns false if it can't be added
    add: function (id, opt, qty, note) {
      var p = byId(id);                   // look up the product
      if (!p || !p.available) return false; // unknown or unavailable products can't be ordered
      // use the chosen option, or the first option for sized products, or "" for products without options
      var o = (p.options && p.options.length) ? (opt || p.options[0].id) : "";
      var lines = load(), k = lineKey(id, o), found = false; // current cart, this line's key, and a "found" flag
      lines.forEach(function (l) { // check whether this product+option is already in the cart
        if (lineKey(l.id, l.opt) === k) { l.qty = Math.min(99, l.qty + qty); if (note) l.note = note; found = true; } // add to its quantity (max 99)
      });
      if (!found) lines.push({ id: id, opt: o, qty: Math.min(99, qty), note: note || "" }); // otherwise add a new line
      save(lines); // store the updated cart
      return true;  // report success
    },
    // Set a line's quantity; zero or less removes the line
    setQty: function (key, qty) {
      var lines = load().filter(function (l) { return lineKey(l.id, l.opt) !== key || qty > 0; }); // drop the line if qty is 0 or less
      lines.forEach(function (l) { if (lineKey(l.id, l.opt) === key) l.qty = Math.min(99, qty); }); // otherwise set the new quantity (max 99)
      save(lines); // store the updated cart
    },
    // Remove a line completely
    remove: function (key) { save(load().filter(function (l) { return lineKey(l.id, l.opt) !== key; })); },
    // Empty the whole cart
    clear: function () { save([]); }
  };

  /* ---------- toast (small pop-up message) ---------- */

  var toastEl, toastTimer; // the pop-up element and the timer that hides it

  // Show a short message at the bottom of the screen; optionally with a "View cart" link
  function toast(msg, withLink) {
    if (!toastEl) { // create the pop-up the first time it is needed
      toastEl = document.createElement("div");          // make a new <div>
      toastEl.className = "toast";                      // give it the toast styling
      toastEl.setAttribute("role", "status");           // tell screen readers it is a status message
      toastEl.setAttribute("aria-live", "polite");      // read it out without interrupting
      document.body.appendChild(toastEl);               // add it to the page
    }
    toastEl.innerHTML = esc(msg) + (withLink ? ' <a href="cart.html">View cart</a>' : ""); // set the text (and link)
    toastEl.classList.add("is-on");                     // make it visible
    clearTimeout(toastTimer);                           // cancel any earlier hide timer
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3500); // hide it after 3.5 seconds
  }

  /* ---------- header & footer ---------- */

  var page = document.body.getAttribute("data-page") || ""; // which page this is (set on <body> in each HTML file)
  // The navigation links: [file, label, page name used to highlight the current page]
  var links = [["index.html", "Home", "home"], ["scones.html", "Scones", "scones"], ["muffins.html", "Muffins", "muffins"], ["cakes.html", "Cakes", "cakes"], ["contact.html", "Contact", "contact"]];

  // Create the header (logo, menu, cart button) and put it at the top of the page
  function buildHeader() {
    var nav = links.map(function (l) { // build one <a> per link
      // mark the link for the current page with aria-current so it is highlighted
      return '<a href="' + l[0] + '"' + (l[2] === page ? ' aria-current="page"' : "") + ">" + l[1] + "</a>";
    }).join(""); // join all links into one string
    var h = document.createElement("header"); // create the <header> element
    h.className = "site-header";              // give it the header styling
    h.innerHTML =                             // fill it with the logo, navigation and cart button
      '<div class="wrap bar">' +
      '<a class="logo" href="index.html" aria-label="' + esc(CFG.bakery.name) + ' – home"><span class="logo__sun" aria-hidden="true"></span><span class="logo__name">' + esc(CFG.bakery.name) + "</span></a>" +
      '<nav id="primary-nav" class="nav" aria-label="Primary">' + nav + "</nav>" +
      '<div class="bar__actions"><a class="btn btn--secondary btn--sm" href="cart.html"><span>Cart (<span data-cart-count>0</span>)</span></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button></div></div>';
    var skip = document.createElement("a");   // create the "Skip to content" link for keyboard users
    skip.className = "skip"; skip.href = "#main"; skip.textContent = "Skip to content"; // style it, point it at <main>, set its text
    document.body.insertBefore(h, document.body.firstChild);    // put the header first in the page
    document.body.insertBefore(skip, document.body.firstChild); // put the skip link before the header
    var btn = h.querySelector(".menu-btn"), navEl = h.querySelector(".nav"); // find the mobile Menu button and the nav list
    btn.addEventListener("click", function () { // when the Menu button is pressed...
      var open = navEl.classList.toggle("is-open");                // ...show or hide the menu
      btn.setAttribute("aria-expanded", open ? "true" : "false");  // ...and tell screen readers whether it is open
    });
    document.addEventListener("keydown", function (e) { // listen for key presses anywhere on the page
      if (e.key === "Escape" && navEl.classList.contains("is-open")) { // Escape closes an open menu
        navEl.classList.remove("is-open");              // hide the menu
        btn.setAttribute("aria-expanded", "false");     // update the screen-reader state
        btn.focus();                                    // return keyboard focus to the Menu button
      }
    });
  }

  // Create the footer (brand text, links, contact details) and add it to the end of the page
  function buildFooter() {
    var b = CFG.bakery; // shortcut to the business details
    // build a list item for a contact detail, or nothing if there is nothing to show
    function li(v, label) { var t = val(v, label); return t ? "<li>" + esc(t) + "</li>" : ""; }
    var f = document.createElement("footer"); // create the <footer> element
    f.className = "site-footer";              // give it the footer styling
    f.innerHTML =                             // fill it with four columns
      '<div class="wrap site-footer__grid">' +
      '<div class="site-footer__brand"><span class="logo__name">' + esc(b.name) + "</span>" +
      "<p>Scones, muffins and cakes, baked fresh and ordered online. Collection details are confirmed at checkout.</p></div>" +
      '<div><h2>Shop</h2><ul><li><a href="scones.html">Scones</a></li><li><a href="muffins.html">Muffins</a></li><li><a href="cakes.html">Cakes</a></li></ul></div>' +
      '<div><h2>Info</h2><ul><li><a href="contact.html#ordering">Ordering &amp; lead times</a></li><li><a href="contact.html#collection">Collection &amp; delivery</a></li>' +
      '<li><a href="contact.html#policies">Privacy notice</a></li><li><a href="contact.html#policies">Refunds &amp; cancellations</a></li></ul></div>' +
      '<div><h2>Contact</h2><ul>' + li(b.phone, "Phone number") + li(b.email, "Email") + li(b.hours, "Opening hours") + "</ul></div></div>";
    document.body.appendChild(f); // add the footer to the end of the page
  }

  // Refresh the item count shown on the Cart button
  function updateCount() {
    var n = cart.count();                                        // how many items are in the cart
    var els = document.querySelectorAll("[data-cart-count]");    // every place that shows the count
    for (var i = 0; i < els.length; i++) els[i].textContent = n; // write the number into each
  }

  buildHeader();   // draw the header now
  buildFooter();   // draw the footer now
  updateCount();   // show the current cart count
  window.addEventListener("sbs:cart", updateCount); // update the count whenever the cart changes on this page
  window.addEventListener("storage", updateCount);  // update it when the cart changes in another browser tab

  // Share the helpers and the cart with the page-specific scripts through one global object
  window.SBS = { cfg: CFG, products: PRODUCTS, fmt: fmt, esc: esc, val: val, byId: byId, fromPrice: fromPrice, leadText: leadText, photo: photo, cart: cart, toast: toast };
})(); // end of the self-running wrapper
