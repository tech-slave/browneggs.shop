import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface CartItem {
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

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((total, item) => total + item.price * item.quantity, 0),
      };
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price
      };
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (item ? item.price * item.quantity : 0)
      };
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      
      const quantityDiff = action.payload.quantity - item.quantity;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff)
      };
    }
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
};

const saveCartItems = async (user: any, items: CartItem[]) => {
  if (!user) return;

  try {
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', user.id);

    const existingItemMap = new Map(
      existingItems?.map(item => [item.product_id, item.quantity]) || []
    );

    for (const item of items) {
      if (!existingItemMap.has(item.id)) {
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: item.id,
            quantity: item.quantity,
          });
      } else if (existingItemMap.get(item.id) !== item.quantity) {
        await supabase
          .from('cart_items')
          .update({ quantity: item.quantity })
          .eq('user_id', user.id)
          .eq('product_id', item.id);
      }
      existingItemMap.delete(item.id);
    }

    if (existingItemMap.size > 0) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .in('product_id', Array.from(existingItemMap.keys()));
    }
  } catch (error) {
    console.error('Error saving cart items:', error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !isInitialized) {
      const initializeCart = async () => {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              quantity,
              products (
                id,
                title,
                price,
                image
              )
            `)
            .eq('user_id', user.id);

          if (error) throw error;

          if (data) {
            const cartItems = data.map((item: any) => ({
              id: item.products.id,
              title: item.products.title,
              price: item.products.price,
              image: item.products.image,
              quantity: item.quantity,
            }));

            dispatch({ type: 'SET_ITEMS', payload: cartItems });
          }
          setIsInitialized(true);
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      };

      initializeCart();
    } else if (!user) {
      setIsInitialized(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const { product_id, quantity } = payload.new;
            supabase
              .from('products')
              .select('id, title, price, image')
              .eq('id', product_id)
              .single()
              .then(({ data }) => {
                if (data) {
                  dispatch({
                    type: 'ADD_ITEM',
                    payload: { ...data, quantity }
                  });
                }
              });
          } else if (payload.eventType === 'DELETE') {
            dispatch({
              type: 'REMOVE_ITEM',
              payload: payload.old.product_id
            });
          } else if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'UPDATE_QUANTITY',
              payload: {
                id: payload.new.product_id,
                quantity: payload.new.quantity
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (user && isInitialized) {
      saveCartItems(user, state.items);
    }
  }, [state.items, user, isInitialized]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};