/**
 * Biogi Portfolio - Core Interactive Features
 * Animations, Mobile Navigation, ScrollSpy, Testimonial Slider, Modals & Popups
 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // 1. MOBILE MENU TOGGLE
  const menuToggle = document.getElementById("menu-toggle");
  const hamburger = document.getElementById("hamburger-1");
  const sideMenu = document.querySelector(".side-menu");
  const navLinks = document.querySelectorAll(".menu-list-main ul li a");
  const scrollContainer = document.querySelector(".main-containe");

  if (menuToggle && hamburger && sideMenu) {
    function setMenuOpen(open) {
      hamburger.classList.toggle("is-active", open);
      sideMenu.classList.toggle("show", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }

    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenuOpen(!sideMenu.classList.contains("show"));
    });

    // Close menu when clicking outside on mobile
    document.addEventListener("click", function (e) {
      if (
        window.innerWidth < 1200 &&
        sideMenu.classList.contains("show") &&
        !sideMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    });

    // Close menu when clicking any nav item on mobile
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < 1200) {
          setMenuOpen(false);
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sideMenu.classList.contains("show")) {
        setMenuOpen(false);
        menuToggle.focus();
      }
    });
  }

  // 2. SCROLL ENTRANCE ANIMATIONS (IntersectionObserver)
  const animSelectors = [
    ".fade_up",
    ".fade_down",
    ".fade_left",
    ".fade_right",
    ".zoom_in",
    ".zoom_out",
    ".flip_up",
    ".flip_down",
    ".flip_left",
    ".flip_right"
  ].join(",");

  const revealSelectors = [
    ".Marquee-main",
    ".about-detail-main",
    ".education-experience .education",
    ".skills-section .skills-heading",
    ".skills-section .skills-subtitle",
    ".skills-section .skills-ring-box",
    ".skills-section .skills-pill",
    "#contactForm > .wrapper",
    ".section-one .worked-box",
    ".service-card-item",
    ".portfolio-filter-bar .portfolio-filter-btn",
    ".portfolio-card",
    ".testimonials-section .slick-slide:not(.slick-cloned)",
    ".contact-section .form",
    ".contact-section .map-iframe",
    ".contact-section .footer"
  ].join(",");
  const staggerSelectors = [
    ".about-detail-main",
    ".education-experience .education",
    ".skills-section .skills-ring-box",
    ".skills-section .skills-pill",
    ".service-card-item",
    ".portfolio-filter-bar .portfolio-filter-btn",
    ".portfolio-card",
    ".testimonials-section .slick-slide:not(.slick-cloned)",
    ".contact-section .form",
    ".side-menu .menu-list-main ul li a"
  ].join(",");
  const staggerIndexes = new Map();
  const observedElements = new WeakSet();
  const revealElements = new Set();
  let revealObserver;
  let viewportObserver;

  function setRevealState(el, visible) {
    if (el.classList.contains("scroll-reveal")) {
      el.classList.toggle("is-visible", visible);
    } else {
      el.classList.toggle("show", visible);
    }
  }

  function isInScrollViewport(el) {
    const viewport = scrollContainer
      ? scrollContainer.getBoundingClientRect()
      : { top: 0, right: window.innerWidth, bottom: window.innerHeight, left: 0 };
    const rect = el.getBoundingClientRect();
    return rect.bottom > viewport.top &&
      rect.top < viewport.bottom &&
      rect.right > viewport.left &&
      rect.left < viewport.right;
  }

  function isInBrowserViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;
  }

  function observeRevealTree(root) {
    const selectors = animSelectors + "," + revealSelectors;
    const candidates = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(selectors)) {
      candidates.push(root);
    }
    if (root.querySelectorAll) {
      candidates.push(...root.querySelectorAll(selectors));
    }

    candidates.forEach(function (el) {
      if (observedElements.has(el)) return;
      observedElements.add(el);
      if (!el.matches(animSelectors)) {
        el.classList.add("scroll-reveal");
        revealElements.add(el);
      }

      if (el.matches(staggerSelectors)) {
        const parent = el.parentElement;
        const index = staggerIndexes.get(parent) || 0;
        el.style.setProperty("--scroll-reveal-delay", Math.min(index, 4) * 60 + "ms");
        staggerIndexes.set(parent, index + 1);
      }

      if (scrollContainer && !scrollContainer.contains(el)) {
        setRevealState(el, isInBrowserViewport(el));
        if (viewportObserver) viewportObserver.observe(el);
      } else {
        setRevealState(el, isInScrollViewport(el));
        if (revealObserver) revealObserver.observe(el);
      }
    });
  }

  function initializeScrollAnimations() {
    const allRevealElements = document.querySelectorAll(animSelectors + "," + revealSelectors);
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      allRevealElements.forEach(function (el) {
        el.classList.remove("scroll-reveal");
        el.classList.add("show", "is-visible");
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => setRevealState(entry.target, entry.isIntersecting));
      },
      {
        root: scrollContainer,
        threshold: 0.01,
        rootMargin: "0px 0px -8% 0px"
      }
    );
    viewportObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(entry => setRevealState(entry.target, entry.isIntersecting));
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
    );
    observeRevealTree(document);
    document.body.classList.add("motion-ready");

    if (scrollContainer) {
      const additionsObserver = new MutationObserver(function (records) {
        records.forEach(record => record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) observeRevealTree(node);
        }));
      });
      additionsObserver.observe(scrollContainer, { childList: true, subtree: true });
    }

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
      if (!event.matches) return;
      document.body.classList.remove("motion-ready");
      revealObserver.disconnect();
      viewportObserver.disconnect();
      revealElements.forEach(function (el) {
        el.classList.remove("scroll-reveal");
        el.classList.add("is-visible");
      });
      document.querySelectorAll(animSelectors).forEach(el => el.classList.add("show"));
    });
  }

  initializeScrollAnimations();

  // A local spotlight follows the pointer on cards without replacing the native cursor.
  if (window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    document.addEventListener("pointermove", function (event) {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest(".service-card-item, .portfolio-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--cursor-x", event.clientX - rect.left + "px");
      card.style.setProperty("--cursor-y", event.clientY - rect.top + "px");
    }, { passive: true });
  }

  // 3. SCROLLSPY (Highlight active nav link)
  const sections = document.querySelectorAll("section[id]");
  let activeSectionId = null;
  let scrollSpyFrame = 0;

  function updateActiveNav() {
    let currentId = "";
    const scrollPos = (scrollContainer ? scrollContainer.scrollTop : window.scrollY) + 160;

    sections.forEach(function (sec) {
      const top = scrollContainer
        ? sec.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop
        : sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute("id");
      }
    });

    if (!currentId && sections.length > 0) {
      currentId = sections[0].getAttribute("id");
    }

    if (currentId === activeSectionId) return;
    activeSectionId = currentId;

    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === "#" + currentId) {
        link.classList.add("active");
        link.parentElement.classList.add("active-menu-action");
        link.setAttribute("aria-current", "location");
      } else {
        link.classList.remove("active");
        link.parentElement.classList.remove("active-menu-action");
        link.removeAttribute("aria-current");
      }
    });
  }

  (scrollContainer || window).addEventListener("scroll", function () {
    if (scrollSpyFrame) return;
    scrollSpyFrame = window.requestAnimationFrame(function () {
      scrollSpyFrame = 0;
      updateActiveNav();
    });
  }, { passive: true });
  updateActiveNav();

  // Scroll to hash on page load if present
  if (window.location.hash) {
    const hashEl = document.getElementById(window.location.hash.slice(1));
    const mainContain = document.querySelector(".main-containe");
    if (hashEl) {
      setTimeout(function () {
        if (mainContain) {
          mainContain.scrollTop =
            hashEl.getBoundingClientRect().top -
            mainContain.getBoundingClientRect().top +
            mainContain.scrollTop;
          mainContain.scrollLeft = 0;
        } else {
          hashEl.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, 150);
    }
  }

  // 4. TESTIMONIALS SLIDER
  const slider = document.querySelector(".Testimonials");
  if (slider) {
    const track = slider.querySelector(".slick-track");
    const dots = slider.querySelectorAll(".slick-dots li");
    const slides = slider.querySelectorAll(".slick-slide:not(.slick-cloned)");

    let currentIndex = 0;
    const totalSlides = slides.length || 4;
    let autoPlayTimer = null;

    function getSlideWidth() {
      const sliderWidth = slider.querySelector(".slick-list").offsetWidth;
      // Show 2 slides if container width >= 800px, else 1 slide
      return sliderWidth >= 800 ? sliderWidth / 2 : sliderWidth;
    }

    function updateSlider(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      const slideWidth = getSlideWidth();
      const offset = -(currentIndex * slideWidth);

      if (track) {
        track.style.transform = `translate3d(${offset}px, 0px, 0px)`;
      }

      dots.forEach(function (dot, i) {
        if (i === currentIndex) {
          dot.classList.add("slick-active");
        } else {
          dot.classList.remove("slick-active");
        }
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        clearInterval(autoPlayTimer);
        updateSlider(i);
        startAutoPlay();
      });
    });

    function startAutoPlay() {
      autoPlayTimer = setInterval(function () {
        updateSlider(currentIndex + 1);
      }, 4500);
    }

    window.addEventListener("resize", function () {
      updateSlider(currentIndex);
    });

    updateSlider(0);
    startAutoPlay();
  }

  // 5. POPUP MODALS
  // A. Services Popup
  const servicesPopup = document.getElementById("services-popup");
  const serviceTriggers = document.querySelectorAll('.services-column a, a[href="#services-popup"], a[href="/#services-popup"]');
  
  serviceTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (servicesPopup) {
        servicesPopup.style.display = "flex";
      }
    });
  });

  if (servicesPopup) {
    const closeBtn = servicesPopup.querySelector(".close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        servicesPopup.style.display = "none";
      });
    }
    servicesPopup.addEventListener("click", function (e) {
      if (e.target === servicesPopup) {
        servicesPopup.style.display = "none";
      }
    });
  }

  // B. Corporate Branding Popup (.popup-wrap)
  const popupWrap = document.querySelector(".popup-wrap");
  const popupBtns = document.querySelectorAll(".popup-btn");
  const popupClose = document.querySelector(".popup-close");

  popupBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (popupWrap) {
        popupWrap.classList.add("visible");
        popupWrap.style.display = "block";
      }
    });
  });

  if (popupClose && popupWrap) {
    popupClose.addEventListener("click", function (e) {
      e.preventDefault();
      popupWrap.classList.remove("visible");
      popupWrap.style.display = "none";
    });

    popupWrap.addEventListener("click", function (e) {
      if (e.target === popupWrap) {
        popupWrap.classList.remove("visible");
        popupWrap.style.display = "none";
      }
    });
  }

  // C. Gallery Popup (#popup2)
  const popup2 = document.getElementById("popup2");
  const galleryTriggers = document.querySelectorAll('a[href="#popup2"]');

  galleryTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (popup2) {
        popup2.style.display = "flex";
      }
    });
  });

  if (popup2) {
    const closeGallery = popup2.querySelector(".close");
    if (closeGallery) {
      closeGallery.addEventListener("click", function (e) {
        e.preventDefault();
        popup2.style.display = "none";
      });
    }
    popup2.addEventListener("click", function (e) {
      if (e.target === popup2) {
        popup2.style.display = "none";
      }
    });
  }

  // D. Blog Popup (#blog-popup)
  const blogTriggers = document.querySelectorAll('a[href="#blog-popup"]');
  blogTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (servicesPopup) {
        servicesPopup.style.display = "flex";
      }
    });
  });

  // ESC key closes any open modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (servicesPopup) servicesPopup.style.display = "none";
      if (popup2) popup2.style.display = "none";
      if (popupWrap) {
        popupWrap.classList.remove("visible");
        popupWrap.style.display = "none";
      }
    }
  });

  // 6. CONTACT FORM SUBMISSION
  const submitBtn = document.querySelector(".contact-section .wrapper.blog-btn a");
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");

      if (nameInput && !nameInput.value.trim()) {
        alert("Please enter your name.");
        nameInput.focus();
        return;
      }
      if (emailInput && !emailInput.value.trim()) {
        alert("Please enter your email.");
        emailInput.focus();
        return;
      }

      alert("Thank you! Your message has been sent successfully.");
      if (nameInput) nameInput.value = "";
      if (emailInput) emailInput.value = "";
      const subjectInput = document.getElementById("subject");
      if (subjectInput) subjectInput.value = "";
      if (messageInput) messageInput.value = "";
    });
  }

  console.log("Biogi Portfolio initialized successfully.");

  // 6. PORTFOLIO FILTERING & MODAL
  const portfolioFilterBtns = document.querySelectorAll(".portfolio-filter-btn");
  const portfolioCards = document.querySelectorAll(".portfolio-card");
  const portfolioModal = document.getElementById("portfolio-detail-modal");
  const modalTitle = document.getElementById("modal-project-title");
  const modalCategory = document.getElementById("modal-project-category");
  const modalDesc = document.getElementById("modal-project-desc");
  const modalTech = document.getElementById("modal-project-tech");
  const modalLive = document.getElementById("modal-project-live");
  const portfolioModalClose = document.querySelector(".portfolio-modal-close");

  const portfolioData = [{"id":1,"title":"Arcturustech","category":"Corporate Website","desc":"Corporate website developed using WordPress and Elementor.","tags":["WordPress","Elementor","PHP","JavaScript"],"filter":"wordpress php"},{"id":2,"title":"Predicta Digital","category":"WordPress / Business Website","desc":"WordPress business website project.","tags":["WordPress","Elementor","PHP","JavaScript"],"filter":"wordpress php"},{"id":3,"title":"Predicta Analytics","category":"WordPress / Business / Analytics","desc":"WordPress business and analytics website project.","tags":["WordPress","Elementor","PHP","JavaScript"],"filter":"wordpress php"},{"id":4,"title":"Heenan Brown Immigration","category":"WordPress / Business","desc":"WordPress business website project.","tags":["WordPress","Elementor","PHP"],"filter":"wordpress php"},{"id":5,"title":"ShareWorld Solutions","category":"WordPress / Business","desc":"WordPress business website project.","tags":["WordPress","Elementor","JavaScript"],"filter":"wordpress"},{"id":6,"title":"FCDHCI","category":"WordPress / Organization","desc":"WordPress organization website project.","tags":["WordPress","Elementor","PHP"],"filter":"wordpress php"},{"id":7,"title":"Strat Finance Sahil","category":"WordPress / Finance","desc":"WordPress finance-focused website project.","tags":["WordPress","Elementor","PHP"],"filter":"wordpress php"},{"id":8,"title":"Sparkwise Academy","category":"LMS / WordPress / Education","desc":"WordPress learning and education project.","tags":["WordPress","LMS","Elementor"],"filter":"wordpress lms"},{"id":9,"title":"iSellHub","category":"LMS / eCommerce","desc":"LMS and eCommerce project.","tags":["WordPress","LMS","eCommerce"],"filter":"wordpress lms ecommerce"},{"id":10,"title":"ResellHub","category":"eCommerce / MLM","desc":"eCommerce and MLM project.","tags":["eCommerce","MLM","PHP"],"filter":"ecommerce mlm php"},{"id":11,"title":"Shop To Success","category":"eCommerce / MLM","desc":"eCommerce and MLM project.","tags":["eCommerce","MLM","PHP"],"filter":"ecommerce mlm php"},{"id":12,"title":"SDR Kart","category":"eCommerce / MLM","desc":"eCommerce and MLM project.","tags":["eCommerce","MLM","PHP"],"filter":"ecommerce mlm php"},{"id":13,"title":"Liviyoung","category":"eCommerce / Laravel / MLM","desc":"eCommerce and MLM project built with Laravel.","tags":["eCommerce","Laravel","MLM","PHP"],"filter":"ecommerce laravel mlm php"}];

  if (portfolioFilterBtns.length && portfolioCards.length) {
    portfolioFilterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        portfolioFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");

        portfolioCards.forEach(function (card) {
          const category = card.getAttribute("data-category") || "";
          if (filterValue === "all" || category.includes(filterValue)) {
            card.classList.remove("is-hidden");
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });
  }

  // Portfolio Details Modal Popup
  const detailBtns = document.querySelectorAll(".portfolio-details-btn");
  detailBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const pIndex = parseInt(btn.getAttribute("data-project"), 10);
      const proj = portfolioData[pIndex];
      if (proj && portfolioModal) {
        if (modalTitle) modalTitle.textContent = proj.title;
        if (modalCategory) modalCategory.textContent = proj.category;
        if (modalDesc) modalDesc.textContent = proj.desc;
        if (modalTech) modalTech.textContent = proj.tags.join(", ");
        if (modalLive) modalLive.setAttribute("href", "#portfolio");
        portfolioModal.style.display = "flex";
      }
    });
  });

  if (portfolioModalClose && portfolioModal) {
    portfolioModalClose.addEventListener("click", function (e) {
      e.preventDefault();
      portfolioModal.style.display = "none";
    });
  }

  if (portfolioModal) {
    portfolioModal.addEventListener("click", function (e) {
      if (e.target === portfolioModal) {
        portfolioModal.style.display = "none";
      }
    });
  }

});
