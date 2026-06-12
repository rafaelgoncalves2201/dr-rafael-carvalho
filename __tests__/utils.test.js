/**
 * @jest-environment jsdom
 */

const SiteUtils = require('../utils');

// ─── shouldHeaderBeScrolled ─────────────────────────────────────────
describe('shouldHeaderBeScrolled', () => {
  test('returns false when scrollY is 0', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(0)).toBe(false);
  });

  test('returns false when scrollY equals the default threshold', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(60)).toBe(false);
  });

  test('returns true when scrollY exceeds the default threshold', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(61)).toBe(true);
  });

  test('returns true for large scrollY values', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(5000)).toBe(true);
  });

  test('respects a custom threshold', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(100, 100)).toBe(false);
    expect(SiteUtils.shouldHeaderBeScrolled(101, 100)).toBe(true);
  });

  test('threshold of 0 returns true for any positive scrollY', () => {
    expect(SiteUtils.shouldHeaderBeScrolled(1, 0)).toBe(true);
    expect(SiteUtils.shouldHeaderBeScrolled(0, 0)).toBe(false);
  });
});

// ─── applyHeaderScroll ──────────────────────────────────────────────
describe('applyHeaderScroll', () => {
  let header;

  beforeEach(() => {
    header = document.createElement('header');
  });

  test('adds "scrolled" class when scrollY > 60', () => {
    SiteUtils.applyHeaderScroll(header, 100);
    expect(header.classList.contains('scrolled')).toBe(true);
  });

  test('removes "scrolled" class when scrollY <= 60', () => {
    header.classList.add('scrolled');
    SiteUtils.applyHeaderScroll(header, 30);
    expect(header.classList.contains('scrolled')).toBe(false);
  });

  test('does nothing when header is null', () => {
    expect(() => SiteUtils.applyHeaderScroll(null, 100)).not.toThrow();
  });

  test('toggles correctly at the boundary', () => {
    SiteUtils.applyHeaderScroll(header, 60);
    expect(header.classList.contains('scrolled')).toBe(false);

    SiteUtils.applyHeaderScroll(header, 61);
    expect(header.classList.contains('scrolled')).toBe(true);
  });

  test('works with custom threshold', () => {
    SiteUtils.applyHeaderScroll(header, 200, 200);
    expect(header.classList.contains('scrolled')).toBe(false);

    SiteUtils.applyHeaderScroll(header, 201, 200);
    expect(header.classList.contains('scrolled')).toBe(true);
  });
});

// ─── openMobileMenu ─────────────────────────────────────────────────
describe('openMobileMenu', () => {
  let menu;

  beforeEach(() => {
    menu = document.createElement('div');
    menu.style.display = 'none';
  });

  test('sets display to "flex"', () => {
    SiteUtils.openMobileMenu(menu);
    expect(menu.style.display).toBe('flex');
  });

  test('does nothing when menu is null', () => {
    expect(() => SiteUtils.openMobileMenu(null)).not.toThrow();
  });

  test('overwrites any existing display value', () => {
    menu.style.display = 'block';
    SiteUtils.openMobileMenu(menu);
    expect(menu.style.display).toBe('flex');
  });
});

// ─── closeMobileMenu ────────────────────────────────────────────────
describe('closeMobileMenu', () => {
  let menu;

  beforeEach(() => {
    jest.useFakeTimers();
    menu = document.createElement('div');
    menu.classList.add('open');
    menu.style.display = 'flex';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('removes "open" class immediately', () => {
    SiteUtils.closeMobileMenu(menu);
    expect(menu.classList.contains('open')).toBe(false);
  });

  test('sets display to "none" after 300ms', () => {
    SiteUtils.closeMobileMenu(menu);
    expect(menu.style.display).toBe('flex'); // not yet hidden

    jest.advanceTimersByTime(300);
    expect(menu.style.display).toBe('none');
  });

  test('respects custom delay', () => {
    SiteUtils.closeMobileMenu(menu, 500);
    jest.advanceTimersByTime(300);
    expect(menu.style.display).toBe('flex'); // still visible

    jest.advanceTimersByTime(200);
    expect(menu.style.display).toBe('none');
  });

  test('does nothing when menu is null', () => {
    expect(() => SiteUtils.closeMobileMenu(null)).not.toThrow();
  });

  test('works when menu has no "open" class', () => {
    menu.classList.remove('open');
    SiteUtils.closeMobileMenu(menu);
    expect(menu.classList.contains('open')).toBe(false);
    jest.advanceTimersByTime(300);
    expect(menu.style.display).toBe('none');
  });
});

// ─── handleRevealEntry ──────────────────────────────────────────────
describe('handleRevealEntry', () => {
  let element;
  let mockObserver;

  beforeEach(() => {
    element = document.createElement('div');
    mockObserver = { unobserve: jest.fn() };
  });

  test('adds "visible" class when entry is intersecting', () => {
    const entry = { isIntersecting: true, target: element };
    const result = SiteUtils.handleRevealEntry(entry, mockObserver);

    expect(element.classList.contains('visible')).toBe(true);
    expect(result).toBe(true);
  });

  test('calls observer.unobserve on the target', () => {
    const entry = { isIntersecting: true, target: element };
    SiteUtils.handleRevealEntry(entry, mockObserver);

    expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
  });

  test('does not add "visible" when not intersecting', () => {
    const entry = { isIntersecting: false, target: element };
    const result = SiteUtils.handleRevealEntry(entry, mockObserver);

    expect(element.classList.contains('visible')).toBe(false);
    expect(result).toBe(false);
  });

  test('does not call unobserve when not intersecting', () => {
    const entry = { isIntersecting: false, target: element };
    SiteUtils.handleRevealEntry(entry, mockObserver);

    expect(mockObserver.unobserve).not.toHaveBeenCalled();
  });

  test('works without an observer (null)', () => {
    const entry = { isIntersecting: true, target: element };
    expect(() => SiteUtils.handleRevealEntry(entry, null)).not.toThrow();
    expect(element.classList.contains('visible')).toBe(true);
  });

  test('works when observer lacks unobserve method', () => {
    const entry = { isIntersecting: true, target: element };
    expect(() => SiteUtils.handleRevealEntry(entry, {})).not.toThrow();
    expect(element.classList.contains('visible')).toBe(true);
  });
});

// ─── toggleFaqItem ──────────────────────────────────────────────────
describe('toggleFaqItem', () => {
  let container;

  function createFaqItem(isOpen) {
    const item = document.createElement('div');
    item.classList.add('faq-item');
    if (isOpen) item.classList.add('open');
    const question = document.createElement('div');
    question.classList.add('faq-question');
    item.appendChild(question);
    return { item, question };
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.innerHTML = '';
    document.body.appendChild(container);
  });

  test('opens a closed item', () => {
    const { item, question } = createFaqItem(false);
    container.appendChild(item);

    const result = SiteUtils.toggleFaqItem(question);
    expect(item.classList.contains('open')).toBe(true);
    expect(result).toBe(true);
  });

  test('closes an open item', () => {
    const { item, question } = createFaqItem(true);
    container.appendChild(item);

    const result = SiteUtils.toggleFaqItem(question);
    expect(item.classList.contains('open')).toBe(false);
    expect(result).toBe(false);
  });

  test('closes other open items when opening one', () => {
    const faq1 = createFaqItem(true);
    const faq2 = createFaqItem(false);
    container.appendChild(faq1.item);
    container.appendChild(faq2.item);

    SiteUtils.toggleFaqItem(faq2.question);
    expect(faq1.item.classList.contains('open')).toBe(false);
    expect(faq2.item.classList.contains('open')).toBe(true);
  });

  test('only one item is open at a time', () => {
    const items = [];
    for (let i = 0; i < 5; i++) {
      const faq = createFaqItem(false);
      container.appendChild(faq.item);
      items.push(faq);
    }

    SiteUtils.toggleFaqItem(items[2].question);
    const openItems = container.querySelectorAll('.faq-item.open');
    expect(openItems.length).toBe(1);
    expect(items[2].item.classList.contains('open')).toBe(true);
  });

  test('returns false when clickedQuestion is null', () => {
    expect(SiteUtils.toggleFaqItem(null)).toBe(false);
  });

  test('returns false when clickedQuestion has no parentElement', () => {
    const orphan = document.createElement('div');
    Object.defineProperty(orphan, 'parentElement', { value: null });
    expect(SiteUtils.toggleFaqItem(orphan)).toBe(false);
  });
});

// ─── parseCounterText ───────────────────────────────────────────────
describe('parseCounterText', () => {
  test('parses "+1500+" correctly', () => {
    const result = SiteUtils.parseCounterText('+1500+');
    expect(result).toEqual({ prefix: '+', target: 1500, suffix: '+' });
  });

  test('parses "12 anos" correctly', () => {
    const result = SiteUtils.parseCounterText('12 anos');
    expect(result).toEqual({ prefix: '', target: 12, suffix: ' anos' });
  });

  test('parses plain number "42"', () => {
    const result = SiteUtils.parseCounterText('42');
    expect(result).toEqual({ prefix: '', target: 42, suffix: '' });
  });

  test('parses "+500" with leading plus', () => {
    const result = SiteUtils.parseCounterText('+500');
    expect(result).toEqual({ prefix: '+', target: 500, suffix: '' });
  });

  test('parses "100%" with percent suffix', () => {
    const result = SiteUtils.parseCounterText('100%');
    expect(result).toEqual({ prefix: '', target: 100, suffix: '%' });
  });

  test('returns null for empty string', () => {
    expect(SiteUtils.parseCounterText('')).toBe(null);
  });

  test('returns null for null input', () => {
    expect(SiteUtils.parseCounterText(null)).toBe(null);
  });

  test('returns null for undefined input', () => {
    expect(SiteUtils.parseCounterText(undefined)).toBe(null);
  });

  test('returns null for non-string input', () => {
    expect(SiteUtils.parseCounterText(123)).toBe(null);
  });

  test('returns null for text without digits', () => {
    expect(SiteUtils.parseCounterText('abc')).toBe(null);
  });

  test('parses large numbers', () => {
    const result = SiteUtils.parseCounterText('+99999+');
    expect(result).toEqual({ prefix: '+', target: 99999, suffix: '+' });
  });

  test('parses "0" as zero', () => {
    const result = SiteUtils.parseCounterText('0');
    expect(result).toEqual({ prefix: '', target: 0, suffix: '' });
  });
});

// ─── formatCounterValue ─────────────────────────────────────────────
describe('formatCounterValue', () => {
  test('formats with prefix and suffix', () => {
    expect(SiteUtils.formatCounterValue('+', 750, '+')).toBe('+750+');
  });

  test('formats without prefix', () => {
    expect(SiteUtils.formatCounterValue('', 12, ' anos')).toBe('12 anos');
  });

  test('floors decimal values', () => {
    expect(SiteUtils.formatCounterValue('+', 749.9, '+')).toBe('+749+');
  });

  test('floors down, not round', () => {
    expect(SiteUtils.formatCounterValue('', 99.99, '%')).toBe('99%');
  });

  test('handles zero', () => {
    expect(SiteUtils.formatCounterValue('+', 0, '+')).toBe('+0+');
  });

  test('handles empty prefix and suffix', () => {
    expect(SiteUtils.formatCounterValue('', 42, '')).toBe('42');
  });
});

// ─── nextCounterValue ───────────────────────────────────────────────
describe('nextCounterValue', () => {
  test('increments by step', () => {
    expect(SiteUtils.nextCounterValue(0, 25, 1500)).toBe(25);
  });

  test('clamps to target when step would overshoot', () => {
    expect(SiteUtils.nextCounterValue(1490, 25, 1500)).toBe(1500);
  });

  test('stays at target when already at target', () => {
    expect(SiteUtils.nextCounterValue(1500, 25, 1500)).toBe(1500);
  });

  test('works with fractional steps', () => {
    const result = SiteUtils.nextCounterValue(0, 0.2, 12);
    expect(result).toBeCloseTo(0.2);
  });

  test('handles step larger than target', () => {
    expect(SiteUtils.nextCounterValue(0, 100, 50)).toBe(50);
  });

  test('handles zero step', () => {
    expect(SiteUtils.nextCounterValue(10, 0, 100)).toBe(10);
  });
});

// ─── resolveSmoothScrollTarget ──────────────────────────────────────
describe('resolveSmoothScrollTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('resolves an existing section by id', () => {
    const section = document.createElement('section');
    section.id = 'about';
    document.body.appendChild(section);

    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#about');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(section);
  });

  test('returns null for non-existent target', () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#nonexistent');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(null);
  });

  test('returns null when href does not start with #', () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', 'https://example.com');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(null);
  });

  test('returns null when anchor is null', () => {
    expect(SiteUtils.resolveSmoothScrollTarget(null)).toBe(null);
  });

  test('returns null when href is empty', () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', '');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(null);
  });

  test('returns null when anchor has no href', () => {
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(null);
  });

  test('returns null when href is an invalid selector', () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#[invalid');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor)).toBe(null);
  });

  test('uses provided document context', () => {
    const section = document.createElement('section');
    section.id = 'contact';
    document.body.appendChild(section);

    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#contact');
    document.body.appendChild(anchor);

    expect(SiteUtils.resolveSmoothScrollTarget(anchor, document)).toBe(section);
  });
});

// ─── Integration: full counter animation flow ───────────────────────
describe('counter animation flow (integration)', () => {
  test('simulates a full counter from 0 to target', () => {
    const parsed = SiteUtils.parseCounterText('+1500+');
    const { prefix, target, suffix } = parsed;
    const step = target / 60;
    let current = 0;
    const values = [];

    while (current < target) {
      current = SiteUtils.nextCounterValue(current, step, target);
      values.push(SiteUtils.formatCounterValue(prefix, current, suffix));
    }

    expect(values[values.length - 1]).toBe('+1500+');
    expect(values.length).toBeLessThanOrEqual(60);
    expect(values.length).toBeGreaterThan(0);
  });

  test('counter reaches exact target', () => {
    const parsed = SiteUtils.parseCounterText('12 anos');
    const { prefix, target, suffix } = parsed;
    const step = target / 60;
    let current = 0;

    for (let i = 0; i < 200; i++) {
      current = SiteUtils.nextCounterValue(current, step, target);
      if (current >= target) break;
    }

    expect(current).toBe(target);
    expect(SiteUtils.formatCounterValue(prefix, current, suffix)).toBe('12 anos');
  });
});

// ─── Integration: header + mobile menu lifecycle ────────────────────
describe('header and mobile menu lifecycle (integration)', () => {
  let header;
  let menu;

  beforeEach(() => {
    jest.useFakeTimers();
    header = document.createElement('header');
    menu = document.createElement('nav');
    menu.style.display = 'none';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('scroll past threshold then open/close mobile menu', () => {
    // Scroll down
    SiteUtils.applyHeaderScroll(header, 100);
    expect(header.classList.contains('scrolled')).toBe(true);

    // Open menu
    SiteUtils.openMobileMenu(menu);
    expect(menu.style.display).toBe('flex');

    // Close menu
    SiteUtils.closeMobileMenu(menu);
    expect(menu.classList.contains('open')).toBe(false);
    jest.advanceTimersByTime(300);
    expect(menu.style.display).toBe('none');

    // Scroll back up
    SiteUtils.applyHeaderScroll(header, 0);
    expect(header.classList.contains('scrolled')).toBe(false);
  });
});

// ─── Integration: FAQ accordion multi-toggle ────────────────────────
describe('FAQ accordion multi-toggle (integration)', () => {
  let container;

  function makeFaq(count) {
    const faqs = [];
    for (let i = 0; i < count; i++) {
      const item = document.createElement('div');
      item.classList.add('faq-item');
      const question = document.createElement('div');
      question.classList.add('faq-question');
      question.textContent = 'Q' + (i + 1);
      item.appendChild(question);
      container.appendChild(item);
      faqs.push({ item, question });
    }
    return faqs;
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  test('cycling through multiple FAQ items keeps only one open', () => {
    const faqs = makeFaq(4);

    SiteUtils.toggleFaqItem(faqs[0].question);
    expect(faqs[0].item.classList.contains('open')).toBe(true);

    SiteUtils.toggleFaqItem(faqs[1].question);
    expect(faqs[0].item.classList.contains('open')).toBe(false);
    expect(faqs[1].item.classList.contains('open')).toBe(true);

    SiteUtils.toggleFaqItem(faqs[3].question);
    expect(faqs[1].item.classList.contains('open')).toBe(false);
    expect(faqs[3].item.classList.contains('open')).toBe(true);

    // Close the last open item
    SiteUtils.toggleFaqItem(faqs[3].question);
    const openCount = container.querySelectorAll('.faq-item.open').length;
    expect(openCount).toBe(0);
  });
});
