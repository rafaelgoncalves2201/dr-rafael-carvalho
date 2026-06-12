/**
 * Utility functions extracted from script.js for testability.
 * Works both in the browser (global SiteUtils) and Node.js (module.exports).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SiteUtils = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Determine whether the header should have the 'scrolled' class.
   * @param {number} scrollY - current vertical scroll position
   * @param {number} [threshold=60] - pixel threshold
   * @returns {boolean}
   */
  function shouldHeaderBeScrolled(scrollY, threshold) {
    if (threshold === undefined) threshold = 60;
    return scrollY > threshold;
  }

  /**
   * Apply the scrolled state to a header element.
   * @param {Element} header
   * @param {number} scrollY
   * @param {number} [threshold]
   */
  function applyHeaderScroll(header, scrollY, threshold) {
    if (!header) return;
    header.classList.toggle('scrolled', shouldHeaderBeScrolled(scrollY, threshold));
  }

  /**
   * Open the mobile menu by setting display and adding the 'open' class.
   * @param {HTMLElement} menu
   */
  function openMobileMenu(menu) {
    if (!menu) return;
    menu.style.display = 'flex';
  }

  /**
   * Close the mobile menu by removing 'open' and hiding after a delay.
   * @param {HTMLElement} menu
   * @param {number} [delay=300]
   */
  function closeMobileMenu(menu, delay) {
    if (!menu) return;
    if (delay === undefined) delay = 300;
    menu.classList.remove('open');
    setTimeout(function () {
      menu.style.display = 'none';
    }, delay);
  }

  /**
   * Handle an IntersectionObserver entry for scroll-reveal elements.
   * Adds 'visible' class if the entry is intersecting.
   * @param {IntersectionObserverEntry} entry
   * @param {{ unobserve: function }} observer
   * @returns {boolean} whether the element became visible
   */
  function handleRevealEntry(entry, observer) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (observer && typeof observer.unobserve === 'function') {
        observer.unobserve(entry.target);
      }
      return true;
    }
    return false;
  }

  /**
   * Toggle an FAQ item open/closed. Closes all other items first.
   * @param {Element} clickedQuestion - the .faq-question element that was clicked
   * @returns {boolean} whether the item is now open
   */
  function toggleFaqItem(clickedQuestion) {
    if (!clickedQuestion) return false;
    var item = clickedQuestion.parentElement;
    if (!item) return false;
    var isOpen = item.classList.contains('open');
    var root = item.parentElement || item.ownerDocument;
    var allItems = root.querySelectorAll ? root.querySelectorAll('.faq-item') : [];
    for (var i = 0; i < allItems.length; i++) {
      allItems[i].classList.remove('open');
    }
    if (!isOpen) {
      item.classList.add('open');
      return true;
    }
    return false;
  }

  /**
   * Parse counter text like "+1500+" or "12 anos" into components.
   * @param {string} text
   * @returns {{ prefix: string, target: number, suffix: string } | null}
   */
  function parseCounterText(text) {
    if (!text || typeof text !== 'string') return null;
    var match = text.match(/(\+?)(\d+)(\D*)/);
    if (!match) return null;
    return {
      prefix: match[1],
      target: parseInt(match[2], 10),
      suffix: match[3]
    };
  }

  /**
   * Format counter value with prefix and suffix.
   * @param {string} prefix
   * @param {number} value
   * @param {string} suffix
   * @returns {string}
   */
  function formatCounterValue(prefix, value, suffix) {
    return prefix + Math.floor(value) + suffix;
  }

  /**
   * Compute the next counter value for a single animation step.
   * @param {number} current
   * @param {number} step
   * @param {number} target
   * @returns {number}
   */
  function nextCounterValue(current, step, target) {
    return Math.min(current + step, target);
  }

  /**
   * Resolve the target element for a smooth-scroll anchor link.
   * @param {Element} anchor - an <a> with href starting with "#"
   * @param {Document} [doc]
   * @returns {Element|null}
   */
  function resolveSmoothScrollTarget(anchor, doc) {
    if (!anchor) return null;
    var d = doc || (anchor.ownerDocument || document);
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return null;
    try {
      return d.querySelector(href);
    } catch (e) {
      return null;
    }
  }

  return {
    shouldHeaderBeScrolled: shouldHeaderBeScrolled,
    applyHeaderScroll: applyHeaderScroll,
    openMobileMenu: openMobileMenu,
    closeMobileMenu: closeMobileMenu,
    handleRevealEntry: handleRevealEntry,
    toggleFaqItem: toggleFaqItem,
    parseCounterText: parseCounterText,
    formatCounterValue: formatCounterValue,
    nextCounterValue: nextCounterValue,
    resolveSmoothScrollTarget: resolveSmoothScrollTarget
  };
});
