/* ==========================================================================
   Sunrise Bakery – product catalogue (FR-PROD-009)
   This is the ONE file the bakery edits to change what is sold.
   Every page (catalogue grids, product detail, cart) reads from this list.
   Names, prices and descriptions are SAMPLE content until the bakery confirms them.
   Prices are in South African rand (ZAR).

   Fields for each product:
     id          unique, lowercase-with-dashes; also used as the image file name
     category    "scones" | "muffins" | "cakes"  (decides which page it appears on)
     name        product name shown to customers
     description one short sentence shown on cards and the detail page
     price       number in rand (used when the product has no options)
     options     optional list of { id, label, price } for sizes / pack sizes
     optionLabel heading shown above the options, e.g. "Size"
     available   true = can be ordered, false = shows "Currently unavailable"
     image       path to the product photo inside the assets folder
     featured    true = also shown in "Today's favourites" on the Home page
   ========================================================================== */

// Put the product list on the global window object so every other script can read it
window.SBS_PRODUCTS = [

  /* ---------- Scones ---------- */

  // Classic Plain Scone: single price, orderable, shown on the Home page
  { id: "plain-scone", category: "scones", name: "Classic Plain Scone", description: "Buttery, golden and baked fresh each morning.", price: 28, available: true, featured: true, image: "assets/plain-scone.jpg" },
  // Cheese & Chive Scone: savoury scone, also featured on Home
  { id: "cheese-chive-scone", category: "scones", name: "Cheese & Chive Scone", description: "Savoury, flaky and perfect warm with butter.", price: 32, available: true, featured: true, image: "assets/cheese-chive-scone.jpg" },
  // Cinnamon Raisin Scone: orderable, not featured
  { id: "cinnamon-raisin-scone", category: "scones", name: "Cinnamon Raisin Scone", description: "Warmly spiced with plump raisins.", price: 30, available: true, image: "assets/cinnamon-raisin-scone.jpg" },
  // Scone Pack (6): a pack of six sold at one price
  { id: "scone-pack-6", category: "scones", name: "Scone Pack (6)", description: "Six classic scones, ready to share.", price: 150, available: true, image: "assets/scone-pack-6.jpg" },
  // Jam & Cream Box: a boxed set of four scones with jam and cream
  { id: "jam-cream-box", category: "scones", name: "Jam & Cream Box", description: "Four scones with jam and fresh cream.", price: 95, available: true, image: "assets/jam-cream-box.jpg" },
  // Sweet Potato Scone: orderable, not featured
  { id: "sweet-potato-scone", category: "scones", name: "Sweet Potato Scone", description: "Soft, lightly sweet and wholesome.", price: 32, available: true, image: "assets/sweet-potato-scone.jpg" },
  // Date & Pecan Scone: orderable, not featured
  { id: "date-pecan-scone", category: "scones", name: "Date & Pecan Scone", description: "Rich dates and crunchy pecans.", price: 34, available: true, image: "assets/date-pecan-scone.jpg" },
  // Bran Scone: available:false, so it shows "Currently unavailable" and cannot be added to the cart
  { id: "bran-scone", category: "scones", name: "Bran Scone", description: "Hearty and fibre-rich.", price: 30, available: false, image: "assets/bran-scone.jpg" },

  /* ---------- Muffins ---------- */

  // Blueberry Muffin: featured on the Home page
  { id: "blueberry-muffin", category: "muffins", name: "Blueberry Muffin", description: "Bursting with blueberries and a sugar-crisp top.", price: 32, available: true, featured: true, image: "assets/blueberry-muffin.jpg" },
  // Double Chocolate Muffin: orderable
  { id: "double-chocolate-muffin", category: "muffins", name: "Double Chocolate Muffin", description: "Cocoa batter with melting chocolate chunks.", price: 34, available: true, image: "assets/double-chocolate-muffin.jpg" },
  // Banana & Walnut Muffin: orderable
  { id: "banana-walnut-muffin", category: "muffins", name: "Banana & Walnut Muffin", description: "Ripe banana with toasted walnuts.", price: 32, available: true, image: "assets/banana-walnut-muffin.jpg" },
  // Lemon Poppy Seed Muffin: orderable
  { id: "lemon-poppy-muffin", category: "muffins", name: "Lemon Poppy Seed Muffin", description: "Zesty, bright and light.", price: 30, available: true, image: "assets/lemon-poppy-muffin.jpg" },
  // Carrot & Cream Cheese Muffin: orderable
  { id: "carrot-cream-cheese-muffin", category: "muffins", name: "Carrot & Cream Cheese Muffin", description: "Spiced carrot with a creamy centre.", price: 36, available: true, image: "assets/carrot-cream-cheese-muffin.jpg" },
  // Cinnamon Apple Muffin: orderable
  { id: "cinnamon-apple-muffin", category: "muffins", name: "Cinnamon Apple Muffin", description: "Warm apple pieces and cinnamon.", price: 32, available: true, image: "assets/cinnamon-apple-muffin.jpg" },
  // Muffin Box (6): a mixed box of six muffins
  { id: "muffin-box-6", category: "muffins", name: "Muffin Box (6)", description: "A mixed box of six, baked fresh.", price: 180, available: true, image: "assets/muffin-box-6.jpg" },
  // Red Velvet Muffin: unavailable, so ordering is disabled
  { id: "red-velvet-muffin", category: "muffins", name: "Red Velvet Muffin", description: "Cocoa-kissed with a cream cheese swirl.", price: 36, available: false, image: "assets/red-velvet-muffin.jpg" },

  /* ---------- Cakes ---------- */

  // Chocolate Fudge Cake: has three sizes (options), so the customer picks a size on the product page
  { id: "chocolate-fudge-cake", category: "cakes", name: "Chocolate Fudge Cake", description: "Rich, moist layers with silky fudge icing.", price: 320, optionLabel: "Size",
    options: [
      { id: "s", label: "Small · serves 6", price: 320 },    // small size price
      { id: "m", label: "Medium · serves 10", price: 420 },  // medium size price
      { id: "l", label: "Large · serves 16", price: 540 }    // large size price
    ], available: true, featured: true, image: "assets/chocolate-fudge-cake.jpg" },
  // Red Velvet Cake: three sizes
  { id: "red-velvet-cake", category: "cakes", name: "Red Velvet Cake", description: "Classic crimson sponge with cream cheese frosting.", price: 350, optionLabel: "Size",
    options: [
      { id: "s", label: "Small · serves 6", price: 350 },
      { id: "m", label: "Medium · serves 10", price: 450 },
      { id: "l", label: "Large · serves 16", price: 580 }
    ], available: true, image: "assets/red-velvet-cake.jpg" },
  // Carrot Cake: single price
  { id: "carrot-cake", category: "cakes", name: "Carrot Cake", description: "Spiced, moist and topped with cream cheese icing.", price: 300, available: true, image: "assets/carrot-cake.jpg" },
  // Lemon Drizzle Loaf: single price
  { id: "lemon-drizzle-loaf", category: "cakes", name: "Lemon Drizzle Loaf", description: "Tangy lemon syrup over a tender crumb.", price: 160, available: true, image: "assets/lemon-drizzle-loaf.jpg" },
  // Vanilla Celebration Cake: three sizes
  { id: "vanilla-celebration-cake", category: "cakes", name: "Vanilla Celebration Cake", description: "Light vanilla sponge with a message of your choice.", price: 380, optionLabel: "Size",
    options: [
      { id: "s", label: "Small · serves 6", price: 380 },
      { id: "m", label: "Medium · serves 10", price: 480 },
      { id: "l", label: "Large · serves 16", price: 620 }
    ], available: true, image: "assets/vanilla-celebration-cake.jpg" },
  // Black Forest Cake: single price
  { id: "black-forest-cake", category: "cakes", name: "Black Forest Cake", description: "Chocolate, cherries and whipped cream.", price: 360, available: true, image: "assets/black-forest-cake.jpg" },
  // Baked Cheesecake: unavailable
  { id: "baked-cheesecake", category: "cakes", name: "Baked Cheesecake", description: "Creamy vanilla cheesecake on a biscuit base.", price: 340, available: false, image: "assets/baked-cheesecake.jpg" }
]; // end of the product list

// Page titles and intro sentences for each category page
window.SBS_CATEGORIES = {
  scones: { title: "Scones", intro: "Freshly baked every morning. Choose singles or packs." },            // Scones page text
  muffins: { title: "Muffins", intro: "Generous, tender muffins in sweet and hearty flavours." },          // Muffins page text
  cakes: { title: "Cakes", intro: "From everyday bakes to celebration centrepieces." }                     // Cakes page text
};
