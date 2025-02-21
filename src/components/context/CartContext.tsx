import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

// Load cart from localStorage
const loadCart = (): CartState => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
};

// First, let's define proper action types
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

  function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
      case 'SET_ITEMS':
        return {
          ...state,
          items: action.payload,
          // Fix: Calculate total based on price * quantity for each item
          total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
  
      case 'ADD_ITEM': {
        const existingItem = state.items.find(item => item.id === action.payload.id);
        
        if (existingItem) {
          const updatedItems = state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          
          return {
            ...state,
            items: updatedItems,
            // Fix: Add price of one item
            total: state.total + action.payload.price
          };
        }
  
        // Fix: Add price of one new item
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
          total: state.total + action.payload.price
        };
      }
  
      case 'REMOVE_ITEM': {
        const itemToRemove = state.items.find(item => item.id === action.payload);
        if (!itemToRemove) return state;
  
        // Fix: Remove total price of all quantities of this item
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
          total: state.total - (itemToRemove.price * itemToRemove.quantity)
        };
      }
  
      case 'UPDATE_QUANTITY': {
        const item = state.items.find(item => item.id === action.payload.id);
        if (!item) return state;
        
        if (action.payload.quantity <= 0) {
          return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id });
        }
  
        // Fix: Calculate price difference based on quantity change
        const quantityDiff = action.payload.quantity - item.quantity;
        const priceDiff = item.price * quantityDiff;
  
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
          total: state.total + priceDiff
        };
      }
  
      case 'CLEAR_CART':
        return { items: [], total: 0 };
  
      default:
        return state;
    }
  }

// Update the context creation to use the proper action type
export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: { items: [], total: 0 },
  dispatch: () => null
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 }, loadCart);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);