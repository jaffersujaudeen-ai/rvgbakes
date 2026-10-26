
/* =====================================================
   RVG BAKES — FINAL WEBSITE JAVASCRIPT
   Luxury Website | 30 Cakes | Multi-Category Gallery
   WhatsApp Enquiries | Lightbox | Responsive Navigation
===================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. CONFIGURATION ---------- */

  const WHATSAPP_NUMBER = "919025032285";
  const CAKE_FOLDER = "";
  const TOTAL_CAKES = 30;

  /*
    A cake can belong to multiple categories.
    Change the numbers to match your real cake photos.
  */
  const cakeCategories = {
    birthday: [1, 3, 4, 6, 7, 9, 11, 12, 13, 15, 16, 17, 20, 24, 25, 27, 28, 29, 30],
    wedding:  [2, 8, 10, 14, 19, 23, 26],
    children: [3, 4, 6, 7, 11, 12, 15, 16, 17, 20, 25, 28, 29],
    custom:   [1, 2, 5, 12, 13, 15, 18, 21, 22, 26, 30]
  };

  const categoryLabels = {
    birthday: "Birthday Cake",
    wedding: "Wedding Cake",
    children: "Children's Cake",
    custom: "Custom Cake"
  };

  const occasionToCategory = {
    "Birthday": "birthday",
    "Wedding": "wedding",
    "Engagement": "wedding",
    "Anniversary": "birthday",
    "Children's Celebration": "children",
    "Baby Shower": "children",
    "Graduation": "custom",
    "Corporate Event": "custom",
    "Festival": "custom",
    "Other": "custom"
  };

  /* ---------- 2. SHARED HELPERS ---------- */

  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getCategories(number) {
    return Object.entries(cakeCategories)
      .filter(([, numbers]) => numbers.includes(number))
      .map(([category]) => category);
  }

  function getImageCandidates(number) {
    const filename = `cake-${String(number).padStart(2, "0")}`;

    return [
      `${CAKE_FOLDER}${filename}.jpg`,
      `${CAKE_FOLDER}${filename}.jpeg`,
      `${CAKE_FOLDER}${filename}.png`,
      `${CAKE_FOLDER}${filename}.JPG`,
      `${CAKE_FOLDER}${filename}.JPEG`,
      `${CAKE_FOLDER}${filename}.PNG`
    ];
  }

  /* ---------- 3. FOOTER YEAR ---------- */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* ---------- 4. MOBILE NAVIGATION ---------- */

  const menuToggle = document.getElementById("menuToggle");
  const mainNavigation = document.getElementById("mainNavigation");

  function closeMenu() {
    if (!menuToggle || !mainNavigation) return;

    mainNavigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    if (!menuToggle || !mainNavigation) return;

    mainNavigation.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
  }

  if (menuToggle && mainNavigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (isOpen) closeMenu();
      else openMenu();
    });

    mainNavigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      if (
        isOpen &&
        !mainNavigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* ---------- 5. ACTIVE NAVIGATION ---------- */

  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(
    "main section[id], footer[id]"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-20% 0px -65% 0px"
    });

    sections.forEach(section => observer.observe(section));
  }

  /* ---------- 6. DATE VALIDATION ---------- */

  const deliveryDate = document.getElementById("deliveryDate");

  if (deliveryDate) {
    deliveryDate.min = getLocalDateString();

    deliveryDate.addEventListener("change", () => {
      const invalid =
        deliveryDate.value &&
        deliveryDate.value < getLocalDateString();

      deliveryDate.setCustomValidity(
        invalid ? "Please select today or a future date." : ""
      );
    });
  }

  /* ---------- 7. GALLERY ELEMENTS ---------- */

  const cakeGallery = document.getElementById("cakeGallery");
  const galleryResultCount =
    document.getElementById("galleryResultCount");
  const galleryEmpty = document.getElementById("galleryEmpty");

  let galleryRenderId = 0;
  let activeFilter = "all";

  function updateGalleryStatus(token, loaded, pending, failed) {
    if (token !== galleryRenderId) return;

    if (galleryResultCount) {
      if (pending > 0) {
        galleryResultCount.textContent =
          `Loading cake images… ${loaded} loaded`;
      } else {
        galleryResultCount.textContent =
          `${loaded} ${loaded === 1 ? "cake" : "cakes"} shown`;
      }
    }

    if (galleryEmpty) {
      galleryEmpty.hidden = loaded > 0 || pending > 0;
    }

    if (loaded === 0 && pending === 0 && galleryResultCount) {
      galleryResultCount.textContent = failed > 0
        ? "No cake images could be loaded. Check your image filenames."
        : "No cakes found in this category.";
    }
  }

  /* ---------- 8. CREATE CAKE CARD ---------- */

  function createCakeCard(number, token, reportResult) {
    const categories = getCategories(number);
    const primaryCategory = categories[0] || "custom";

    const card = document.createElement("article");
    card.className = "cake-card";
    card.dataset.category = categories.join(" ");
    card.dataset.cakeNumber = String(number);

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "cake-image-wrapper";

    const image = document.createElement("img");
    image.className = "cake-image";
    image.alt =
      `${categories.map(category => categoryLabels[category]).join(", ") || "Custom"} cake design ${number}`;
    image.loading = "lazy";
    image.decoding = "async";

    const numberLabel = document.createElement("span");
    numberLabel.className = "cake-number";
    numberLabel.textContent = String(number).padStart(2, "0");

    imageWrapper.append(image, numberLabel);

    const content = document.createElement("div");
    content.className = "cake-card-content";

    const details = document.createElement("div");

    const categoryLabel = document.createElement("span");
    categoryLabel.className = "cake-category";
    categoryLabel.textContent =
      (categories.length ? categories : ["custom"])
        .map(category => categoryLabels[category])
        .join(" • ")
        .toUpperCase();

    const title = document.createElement("h3");
    title.textContent =
      `Cake Design ${String(number).padStart(2, "0")}`;

    const description = document.createElement("p");
    description.textContent =
      "Ask us about this design and customisation.";

    const orderLink = document.createElement("a");
    orderLink.className = "text-link";
    orderLink.href = "#order";
    orderLink.textContent = "Enquire about this cake ↗";

    orderLink.addEventListener("click", () => {
      const cakeType = document.getElementById("cakeType");
      const cakeMessage = document.getElementById("cakeMessage");

      if (cakeType) {
        const categoryToOccasion = {
          birthday: "Birthday",
          wedding: "Wedding",
          children: "Children's Celebration",
          custom: "Other"
        };

        cakeType.value = categoryToOccasion[primaryCategory] || "Other";
      }

      if (cakeMessage) {
        cakeMessage.value =
          `I'm interested in Cake Design ${String(number).padStart(2, "0")} (Image ${number}).`;
      }
    });

    details.append(categoryLabel, title, description, orderLink);
    content.append(details);
    card.append(imageWrapper, content);

    const candidates = getImageCandidates(number);
    let candidateIndex = 0;
    let settled = false;

    function finish(success) {
      if (settled) return;
      settled = true;

      if (token !== galleryRenderId) return;

      reportResult(success, card);
    }

    image.addEventListener("load", () => finish(true));

    image.addEventListener("error", () => {
      candidateIndex++;

      if (candidateIndex < candidates.length) {
        image.src = candidates[candidateIndex];
      } else {
        finish(false);
        card.remove();

        console.warn(
          "RVG Bakes: Missing image for cake-" +
          String(number).padStart(2, "0") +
          ". Check its filename and extension."
        );
      }
    });

    image.src = candidates[0];

    return card;
  }

  /* ---------- 9. RENDER GALLERY ---------- */

  function renderCakeGallery(filter = "all") {
    if (!cakeGallery) {
      console.error("Missing #cakeGallery in index.html.");
      return;
    }

    activeFilter = filter;
    galleryRenderId++;

    const token = galleryRenderId;
    let loaded = 0;
    let pending = 0;
    let failed = 0;

    cakeGallery.replaceChildren();

    if (galleryResultCount) {
      galleryResultCount.textContent = "Loading cake images…";
    }

    if (galleryEmpty) galleryEmpty.hidden = true;

    const matchingNumbers = [];

    for (let number = 1; number <= TOTAL_CAKES; number++) {
      const categories = getCategories(number);

      if (filter === "all" || categories.includes(filter)) {
        matchingNumbers.push(number);
      }
    }

    if (matchingNumbers.length === 0) {
      updateGalleryStatus(token, 0, 0, 0);
      return;
    }

    pending = matchingNumbers.length;

    updateGalleryStatus(token, loaded, pending, failed);

    function reportResult(success, card) {
      if (token !== galleryRenderId) return;

      pending--;

      if (success) {
        loaded++;
      } else {
        failed++;
      }

      updateGalleryStatus(token, loaded, pending, failed);
    }

    matchingNumbers.forEach(number => {
      const card = createCakeCard(number, token, reportResult);
      cakeGallery.appendChild(card);
    });
  }

  /* ---------- 10. CATEGORY FILTERS ---------- */

  function setActiveFilter(filter) {
    document.querySelectorAll(".filter-button").forEach(button => {
      const active = button.dataset.filter === filter;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  document.querySelectorAll(".filter-button[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      setActiveFilter(filter);
      renderCakeGallery(filter);
    });
  });

  document.querySelectorAll(".category-card[data-filter]").forEach(card => {
    card.addEventListener("click", () => {
      const filter = card.dataset.filter || "all";

      setActiveFilter(filter);
      renderCakeGallery(filter);

      document.getElementById("gallery")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  renderCakeGallery();

  /* ---------- 11. IMAGE LIGHTBOX ---------- */

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.id = "imageLightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const lightboxClose = document.createElement("button");
  lightboxClose.className = "lightbox-close";
  lightboxClose.type = "button";
  lightboxClose.textContent = "×";
  lightboxClose.setAttribute("aria-label", "Close image preview");

  const lightboxImage = document.createElement("img");
  lightboxImage.alt = "Cake image preview";

  lightbox.append(lightboxClose, lightboxImage);
  document.body.appendChild(lightbox);

  let lastFocusedElement = null;

  function openLightbox(image) {
    lastFocusedElement = document.activeElement;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Cake image preview";

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");

    if (lastFocusedElement?.focus) {
      lastFocusedElement.focus();
    }
  }

  if (cakeGallery) {
    cakeGallery.addEventListener("click", event => {
      const image = event.target.closest(".cake-image");

      if (image) openLightbox(image);
    });
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (
      event.key === "Escape" &&
      lightbox.classList.contains("is-open")
    ) {
      closeLightbox();
    }
  });

  /* ---------- 12. WHATSAPP ENQUIRY FORM ---------- */

  const cakeOrderForm = document.getElementById("cakeOrderForm");
  const formStatus = document.getElementById("formStatus");

  function makeOrderReference() {
    const date = new Date();
    const datePart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("");

    const randomPart = Math.floor(100000 + Math.random() * 900000);

    return `RVG-${datePart}-${randomPart}`;
  }

  if (cakeOrderForm) {
    cakeOrderForm.addEventListener("submit", event => {
      event.preventDefault();

      if (!cakeOrderForm.reportValidity()) return;

      const data = new FormData(cakeOrderForm);

      const getValue = name =>
        String(data.get(name) || "").trim();

      const customerName = getValue("customerName");
      const customerPhone = getValue("customerPhone");
      const occasion = getValue("cakeType");
      const requiredDate = getValue("deliveryDate");
      const cakeShape = getValue("cakeShape");
      const cakeWeight = getValue("cakeWeight");
      const cakeFlavour = getValue("cakeFlavour");
      const cakeMessageText = getValue("cakeMessageText");
      const colorPalette = getValue("colorPalette");
      const customColours = getValue("customColours");
      const cakeBudget = getValue("cakeBudget");
      const deliveryPreference = getValue("deliveryPreference");
      const additionalRequests = getValue("cakeMessage");

      const phoneDigits = customerPhone.replace(/\D/g, "");

      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        const phoneInput = document.getElementById("customerPhone");

        if (phoneInput) {
          phoneInput.setCustomValidity(
            "Please enter a valid phone number."
          );
          phoneInput.reportValidity();
          phoneInput.addEventListener("input", () => {
            phoneInput.setCustomValidity("");
          }, { once: true });
        }

        return;
      }

      if (requiredDate < getLocalDateString()) {
        deliveryDate.setCustomValidity(
          "Please select today or a future date."
        );
        deliveryDate.reportValidity();
        return;
      }

      const reference = makeOrderReference();
      const none = "Not specified";

      const message = [
        "🎂 *NEW CAKE ENQUIRY — RVG BAKES*",
        "",
        `*Order Reference:* ${reference}`,
        "━━━━━━━━━━━━━━━━━━",
        "*CUSTOMER DETAILS*",
        `Name: ${customerName}`,
        `Phone: ${customerPhone}`,
        "━━━━━━━━━━━━━━━━━━",
        "*CELEBRATION DETAILS*",
        `Occasion: ${occasion}`,
        `Required Date: ${requiredDate}`,
        "━━━━━━━━━━━━━━━━━━",
        "*CAKE DESIGN*",
        `Shape: ${cakeShape}`,
        `Size: ${cakeWeight}`,
        `Flavour: ${cakeFlavour}`,
        `Name/message on cake: ${cakeMessageText || none}`,
        `Colour Palette: ${colorPalette || none}`,
        `Custom Colours: ${customColours || none}`,
        "━━━━━━━━━━━━━━━━━━",
        "*BUDGET & DELIVERY*",
        `Budget: ${cakeBudget || "Need a quotation"}`,
        `Delivery Preference: ${deliveryPreference}`,
        "",
        "*ADDITIONAL DESIGN REQUESTS*",
        additionalRequests || "None provided",
        "",
        "Please confirm availability, ingredients, final pricing and delivery arrangements.",
        "",
        "Thank you for choosing RVG Bakes! ❤️",
        "*Crafted for your celebrations.*"
      ].join("\n");

      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      if (formStatus) {
        formStatus.textContent =
          `Your enquiry ${reference} is ready to open in WhatsApp.`;
      }

      const whatsappWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

      if (!whatsappWindow) {
        window.location.href = whatsappURL;
      }
    });
  }

  /* ---------- 13. CLEAR DATE ERRORS ---------- */

  if (deliveryDate) {
    deliveryDate.addEventListener("input", () => {
      deliveryDate.setCustomValidity("");
    });
  }

  /* ---------- 14. READY ---------- */

  console.info("RVG Bakes website initialized.");
  console.info(`Cake gallery configured for ${TOTAL_CAKES} image slots.`);
  console.info("WhatsApp enquiries configured for RVG Bakes.");

});
