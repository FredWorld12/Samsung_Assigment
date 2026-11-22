/* ==========================================================================
   Sunrise Bakery – draws the product grids on the Scones, Muffins and Cakes pages
   and the "Today's favourites" list on the Home page.
   ========================================================================== */

// Run immediately inside a wrapper so variables stay private
(function () {
  "use strict"; // strict mode catches common mistakes
  var S = window.SBS; // shortcut to the shared helpers and cart from site.js

  // Build the HTML for one product card
  function cardHTML(p) {
    var href = "product.html?id=" + encodeURIComponent(p.id);   // link to this product's detail page
    var hasOpts = p.options && p.options.length;                // true if the product has sizes/options
    var price = (hasOpts ? "From " : "") + S.fmt(S.fromPrice(p)); // "From R 320.00" for sized products, otherwise "R 28.00"
    var action; // the button or label shown at the bottom right of the card
    if (!p.available) action = '<span class="tag">Currently unavailable</span>'; // unavailable: show a label instead of a button
    else if (hasOpts) action = '<a class="btn btn--sm" href="' + href + '">Choose ' + S.esc((p.optionLabel || "option").toLowerCase()) + "</a>"; // sized: send to the detail page to pick a size
    else action = '<button class="btn btn--sm" type="button" data-add="' + S.esc(p.id) + '" aria-label="Add ' + S.esc(p.name) + ' to cart">Add to cart</button>'; // simple product: add straight to the cart
    // assemble the card: picture, name (link), description, price and action
    return '<article class="card' + (p.available ? "" : " card--off") + '">' +
      '<a class="card__photo" href="' + href + '" tabindex="-1" aria-hidden="true">' + S.photo(p) + "</a>" + // picture link (skipped by keyboard because the name link does the same job)
      '<div class="card__body"><h3 class="card__name"><a href="' + href + '">' + S.esc(p.name) + "</a></h3>" + // product name
      '<p class="card__desc">' + S.esc(p.description) + "</p>" +                                              // short description
      '<div class="card__row"><span class="price">' + price + "</span>" + action + "</div></div></article>";  // price and action
  }

  // Build the dark "Custom cakes" card shown at the end of the Cakes grid
  function customCakeTile() {
    return '<article class="card card--cta"><h3>Custom cakes</h3>' +
      "<p>Birthdays, weddings or something special. Share your idea and we’ll confirm design, price and lead time before you pay.</p>" +
      '<a class="btn" href="contact.html#custom-cakes">Enquire now</a></article>';
  }

  var grid = document.querySelector("[data-grid]"); // the empty grid on a category page (null on other pages)
  if (grid) { // only run on category pages
    var cat = document.body.getAttribute("data-category"); // which category this page shows
    var list = S.products.filter(function (p) { return p.category === cat; }); // keep only products in this category
    var html = list.map(cardHTML).join(""); // build all the cards
    if (cat === "cakes") html += customCakeTile(); // the Cakes page also gets the custom cake card
    grid.innerHTML = html || '<p class="muted">No products are available in this category yet.</p>'; // show the cards, or a message if there are none
  }

  var feat = document.querySelector("[data-featured]"); // the favourites grid on the Home page (null elsewhere)
  if (feat) { // only run on the Home page
    // show up to four products marked featured that are in stock
    feat.innerHTML = S.products.filter(function (p) { return p.featured && p.available; }).slice(0, 4).map(cardHTML).join("");
  }

  var lead = document.querySelectorAll("[data-lead]"); // lead-time notices that include the collection sentence
  for (var i = 0; i < lead.length; i++) lead[i].textContent = S.leadText() + " Collection or delivery is confirmed at checkout."; // fill each one

  var leadOnly = document.querySelectorAll("[data-lead-only]"); // lead-time notices that show only the lead time
  for (var j = 0; j < leadOnly.length; j++) leadOnly[j].textContent = S.leadText(); // fill each one

  // One click listener for every "Add to cart" button on the page (event delegation)
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); // did the click land on (or inside) an Add to cart button?
    if (!b) return;                          // no: ignore the click
    var p = S.byId(b.getAttribute("data-add")); // find the product for that button
    if (p && S.cart.add(p.id, "", 1, "")) S.toast(p.name + " added to cart.", true); // add one and confirm with a pop-up
  });
})(); // end of the wrapper
