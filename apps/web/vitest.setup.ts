import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView which is not available in jsdom
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}
