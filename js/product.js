/* ==========================================================================
   Sunrise Bakery – product detail page: shows one product with its options,
   quantity stepper and "Add to cart" button.
   ========================================================================== */

// Run immediately inside a wrapper so variables stay private
(function () {
  "use strict"; // strict mode catches common mistakes
  var S = window.SBS;                                           // shared helpers and cart from site.js
  var root = document.getElementById("product");                // the container this page fills in
  var id = new URLSearchParams(window.location.search).get("id"); // the product id from the address, e.g. product.html?id=carrot-cake
  var p = S.byId(id);                                           // find that product (null if the id is unknown)

  if (!p) { // unknown product: show a friendly message (FR-WEB-006)
    document.title = "Product not found | Sunrise Bakery"; // update the browser tab title
    root.innerHTML = '<div class="empty"><h1>We couldn’t find that product</h1>' + // explain what went wrong
      '<p class="muted">It may have been removed or the link is out of date.</p>' +
      '<div class="btn-row"><a class="btn" href="scones.html">Browse scones</a><a class="btn btn--secondary" href="cakes.html">Browse cakes</a></div></div>'; // offer next steps
    return; // stop here: nothing else to set up
  }

  document.title = p.name + " | Sunrise Bakery";                     // put the product name in the browser tab title
  var meta = document.querySelector('meta[name="description"]');      // the page's search-engine description tag
  if (meta) meta.setAttribute("content", p.name + " – " + p.description); // describe this specific product
  var catTitle = S.esc((window.SBS_CATEGORIES[p.category] || {}).title || "Shop"); // category name for the breadcrumb
  var hasOpts = p.options && p.options.length; // true if this product has sizes/options
  var isCake = p.category === "cakes";         // cakes get a "message on cake" box

  var opts = ""; // HTML for the option chips (stays empty for products without options)
  if (hasOpts) {
    // a group of radio buttons styled as chips, one per option; the first is pre-selected
    opts = '<fieldset><legend>' + S.esc(p.optionLabel || "Option") + '</legend><div class="chips">' +
      p.options.map(function (o, i) {
        return '<label class="chip"><input type="radio" name="opt" value="' + S.esc(o.id) + '"' + (i === 0 ? " checked" : "") + "><span>" +
          S.esc(o.label) + " · " + S.fmt(o.price) + "</span></label>"; // label shows the option name and its price
      }).join("") + "</div></fieldset>";
  }

  // The optional message box, shown only for cakes
  var note = isCake
    ? '<div class="field"><label for="note">Message on cake (optional)</label><input id="note" type="text" maxlength="60" placeholder="e.g. Happy Birthday Thandi" autocomplete="off"></div>'
    : "";

  // The buying controls: quantity stepper and button, or an "unavailable" message
  var buy = p.available
    ? '<div class="detail__buy"><div class="stepper" role="group" aria-label="Quantity">' +
      '<button type="button" data-dec aria-label="Decrease quantity">–</button><output id="qty" aria-live="polite">1</output>' +
      '<button type="button" data-inc aria-label="Increase quantity">+</button></div>' +
      '<button class="btn" type="button" id="add">Add to cart</button></div>'
    : '<p><span class="tag">Currently unavailable</span></p><p class="muted">This product can’t be ordered right now. Please check back soon or <a href="contact.html">contact us</a>.</p>';

  // Draw the whole product page: photo on one side, details on the other
  root.innerHTML =
    '<div class="detail">' + S.photo(p) +
    '<div class="detail__info"><p class="crumbs"><a href="index.html">Home</a> / <a href="' + S.esc(p.category) + '.html">' + catTitle + "</a> / " + S.esc(p.name) + "</p>" + // breadcrumb trail
    "<h1>" + S.esc(p.name) + '</h1><p class="price" id="price"></p><p class="lead">' + S.esc(p.description) + "</p>" + // name, price (filled in below) and description
    opts + note + buy +                  // options, cake message and buying controls
    '<p class="notice" data-lead></p>' + // lead-time notice (text filled in below)
    (isCake ? '<p class="small muted">Custom designs need bakery confirmation before they are final. <a href="contact.html#custom-cakes">Enquire about a custom cake</a>.</p>' : "") + // extra note for cakes
    '<p class="small muted">Ingredients &amp; allergens: ' + S.esc(S.val("", "Ingredients and allergen information")) + "</p>" + // allergen placeholder
    "</div></div>";

  // Fill the lead-time notice with the current lead-time text
  root.querySelector("[data-lead]").textContent = S.leadText() + " Custom designs need bakery confirmation before they are final.";

  var qty = 1;                                      // current quantity chosen
  var qtyEl = document.getElementById("qty");       // the element showing the quantity (null if unavailable)
  var priceEl = document.getElementById("price");   // the element showing the price

  // Return the currently selected option (or null if the product has no options)
  function selected() {
    if (!hasOpts) return null; // nothing to select
    var r = root.querySelector('input[name="opt"]:checked'); // the ticked radio button
    var id = r ? r.value : p.options[0].id;                  // its value, or the first option as a fallback
    return p.options.filter(function (o) { return o.id === id; })[0]; // the matching option object
  }

  // Show the price of the selected option (or the product price)
  function renderPrice() {
    var o = selected(); // current option
    priceEl.textContent = hasOpts ? S.fmt(o.price) : S.fmt(p.price); // write the price as text
  }
  renderPrice(); // show the price right away
  root.addEventListener("change", function (e) { if (e.target.name === "opt") renderPrice(); }); // update the price when another size is picked

  if (p.available) { // only wire up the buying controls for orderable products
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-inc]")) { qty = Math.min(99, qty + 1); qtyEl.textContent = qty; } // "+" raises quantity (max 99)
      if (e.target.closest("[data-dec]")) { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; }  // "–" lowers quantity (min 1)
    });
    document.getElementById("add").addEventListener("click", function () { // when "Add to cart" is pressed...
      var o = selected();                          // ...get the chosen option
      var noteEl = document.getElementById("note"); // ...and the cake message box (null for non-cakes)
      if (S.cart.add(p.id, o ? o.id : "", qty, noteEl ? noteEl.value.trim() : "")) { // ...add to the cart with the message
        S.toast(qty + " × " + p.name + " added to cart.", true); // ...and confirm with a pop-up
      }
    });
  }
})(); // end of the wrapper
