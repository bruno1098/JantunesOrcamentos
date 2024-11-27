export const getCartIconPosition = () => {
  const cartIcon = document.querySelector('[data-cart-icon]');
  if (!cartIcon) return { x: 0, y: 0 };

  const rect = cartIcon.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}; 