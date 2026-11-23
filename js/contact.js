/* ==========================================================================
   Sunrise Bakery – Contact page: fills in the details and enquiry links
   from the settings in config.js.
   ========================================================================== */

// Run immediately inside a wrapper so variables stay private
(function () {
  "use strict"; // strict mode catches common mistakes
  var S = window.SBS, b = S.cfg.bakery; // shared helpers and the bakery's contact details

  // Put text into the first element that matches a selector (if it exists)
  function set(sel, text) { var el = document.querySelector(sel); if (el) el.textContent = text; }

  set("[data-c-phone]", S.val(b.phone, "Phone number"));            // show the phone number or a placeholder
  set("[data-c-email]", S.val(b.email, "Email address"));           // show the email address or a placeholder
  set("[data-c-whatsapp]", b.whatsapp ? "Message us on WhatsApp" : S.val("", "WhatsApp link")); // WhatsApp text or placeholder
  set("[data-c-hours]", S.val(b.hours, "Operating hours"));         // show opening hours or a placeholder
  set("[data-c-collection]", S.val(b.collectionAddress, "Collection address")); // show the collection address or a placeholder
  set("[data-c-delivery]", S.val(b.deliveryInfo, "Delivery areas and fees"));    // show delivery info or a placeholder
  set("[data-c-lead]", S.leadText()); // show the lead-time sentence

  // The starting text for a custom cake enquiry message
  var cakeMsg = "Hi, I'd like to enquire about a custom cake. Occasion: \nSize / servings: \nFlavour: \nDate needed: ";

  // Turn a button into a working link, or disable it if there is no link yet
  function link(sel, href) {
    var el = document.querySelector(sel); // find the button
    if (!el) return;                      // not on this page: stop
    if (href) { el.setAttribute("href", href); el.removeAttribute("aria-disabled"); } // working link: set it and make sure it is enabled
    else { el.removeAttribute("href"); el.setAttribute("aria-disabled", "true"); }    // no link yet: remove it and mark the button disabled
  }
  link("[data-l-email]", b.email ? "mailto:" + b.email + "?subject=" + encodeURIComponent("Enquiry") + "&body=" + encodeURIComponent(cakeMsg) : ""); // email button opens a pre-filled email
  link("[data-l-phone]", b.phone ? "tel:" + b.phone.replace(/[^\d+]/g, "") : "");                                                                // call button dials the number
  link("[data-l-whatsapp]", b.whatsapp ? "https://wa.me/" + b.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(cakeMsg) : "");        // WhatsApp button opens a pre-filled chat

  var hint = document.querySelector("[data-enquiry-hint]"); // the small hint under the buttons
  if (hint && !(b.email || b.phone || b.whatsapp)) { // only show it when no contact method is configured yet
    hint.hidden = false; // reveal the hint
    hint.textContent = "Contact options will be switched on once the bakery’s details are added."; // explain why the buttons are disabled
  }
})(); // end of the wrapper
