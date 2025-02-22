# QA Testing Document - Brown Eggs Shop Cart Component

## 1. Cart Layout & Visibility Testing

### Desktop Testing
- [ ] Verify cart slides in from right side smoothly
- [ ] Confirm cart overlay dims the background
- [ ] Check if cart closes on clicking outside
- [ ] Verify scroll behavior when cart has many items
- [ ] Ensure checkout button remains visible at all times
- [ ] Test dark/light mode transitions

### Mobile Testing
- [ ] Test cart responsiveness on different screen sizes
- [ ] Verify cart takes full width on mobile
- [ ] Check touch gestures for closing cart
- [ ] **Critical**: Ensure checkout button is always visible
- [ ] Test scrolling behavior doesn't hide important elements

## 2. Cart Functionality Testing

### Item Management
- [ ] Add items to cart
- [ ] Remove items from cart
- [ ] Update item quantities
- [ ] Verify price calculations
- [ ] Check empty cart state
- [ ] Test maximum quantity limits

### Price Calculations
- [ ] Verify individual item total calculations
- [ ] Check subtotal accuracy
- [ ] Confirm delivery fee calculations
- [ ] Test promo item delivery charges (₹20)
- [ ] Verify price format (₹ symbol and 2 decimal places)

### Checkout Process
- [ ] Test checkout button functionality
- [ ] Verify loading state during checkout
- [ ] Check transition to checkout page
- [ ] Test checkout cancellation
- [ ] Verify scroll lock during checkout

## 3. Performance Testing

- [ ] Test cart opening/closing animation smoothness
- [ ] Check loading performance with many items
- [ ] Verify scroll performance
- [ ] Test memory usage
- [ ] Monitor network requests

## 4. Bug Fixes Required

### Critical Issues
1. Checkout Button Visibility
```jsx
// Suggested fix for the cart layout
// filepath: /src/components/cart/Cart.tsx

// Replace the current footer div with:
<div className="flex-none p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
  {/* ... existing footer content ... */}
</div>
```

### Additional Recommendations
1. Add scroll-to-bottom functionality:
```jsx
// Add this function to Cart component
const scrollToCheckout = () => {
  const checkoutElement = document.getElementById('cart-checkout');
  checkoutElement?.scrollIntoView({ behavior: 'smooth' });
};
```

## 5. Cross-browser Testing

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari
- [ ] Mobile Chrome

## 6. Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus management
- [ ] ARIA labels

## 7. Edge Cases

- [ ] Test with slow internet connection
- [ ] Test with cart session timeout
- [ ] Verify behavior when switching between pages
- [ ] Test with maximum item limit
- [ ] Check behavior during payment processing

## Testing Environment Requirements

- Multiple mobile devices (iOS/Android)
- Desktop browsers (latest versions)
- Different screen sizes (320px to 1920px width)
- Network throttling tools
- Device orientation testing