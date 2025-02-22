import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function usePromoOrders() {
    const { user } = useAuth();
    const [purchasedPromoItems, setPurchasedPromoItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchPromoOrders() {
  
        if (!user) {
          setLoading(false);
          return;
        }
  
        try {
          // Get completed orders with promo products
          const { data: orderItems, error } = await supabase
            .from('order_items')
            .select(`
              product_id,
              order:orders!inner(
                user_id,
                status
              ),
              product:products!inner(
                id,
                is_promo
              )
            `)
            .eq('order.user_id', user.id)
            .eq('product.is_promo', true)
            .neq('order.status', 'cancelled');

          if (error) throw error;

          if (orderItems) {
            const promoIds = [...new Set(orderItems.map(item => item.product_id))];
            setPurchasedPromoItems(promoIds);
          }

        } catch (error) {
          console.error('Error fetching promo orders:', error);
          setPurchasedPromoItems([]);
        } finally {
          setLoading(false);
        }
      }
  
      fetchPromoOrders();
    }, [user]);
  
    return { purchasedPromoItems, loading };
}