// Jest setup file for family letter tests
import 'jest-dom/extend-expect';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock location
delete window.location;
window.location = {
  href: '',
  assign: jest.fn(),
  reload: jest.fn()
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

// Setup DOM
beforeEach(() => {
  document.body.innerHTML = '';
  sessionStorage.clear();
  window.location.href = '';
});