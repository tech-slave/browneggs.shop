import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// const calculateDeliveryFee = (items: any[]): number => {
//   return items.some((item: any) => item.isPromo || item.is_promo) ? 20 : 0;
// };

const resendapi = "re_XtnQr9r1_Dg6MRJGm28pXmpyZ5JeL86S3";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getEmailContentByStatus = (order: any, items: any[], totalAmount: number, deliveryFee: number, finalTotal: number) => {
  const baseStyles = `
    body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            margin-bottom: 20px;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th, .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .total {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
            color: #FF8C00;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
        .status-pending {
            color: #FF8C00;
            font-weight: bold;
        }
        .status-fulfilled {
            color: #10B981;
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #FF8C00;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
  `;

  const getStatusSpecificContent = (status: string) => {
    switch (status) {
      case 'Processing':
        return {
          subject: `Order Confirmation #${order.id.slice(0, 8)} - browneggs.shop`,
          title: 'Order Confirmation',
          message: 'Thank you for your order!',
          statusColor: 'text-yellow-600',
          icon: '⏳'
        };
      case 'Delivered':
        return {
          subject: `Order Delivered #${order.id.slice(0, 8)} - browneggs.shop`,
          title: 'Order Delivered',
          message: 'Your order has been delivered!',
          statusColor: 'text-green-600',
          icon: '✅'
        };
      case 'Cancelled':
        return {
          subject: `Order Cancelled #${order.id.slice(0, 8)} - browneggs.shop`,
          title: 'Order Cancelled',
          message: 'Your order has been cancelled.',
          statusColor: 'text-red-600',
          icon: '❌'
        };
      default:
        return {
          subject: `Order Update #${order.id.slice(0, 8)} - browneggs.shop`,
          title: 'Order Update',
          message: 'Your order status has been updated.',
          statusColor: 'text-gray-600',
          icon: 'ℹ️'
        };
    }
  };
  const statusContent = getStatusSpecificContent(order.status);
  return {
    subject: statusContent.subject,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusContent.title} - browneggs.shop</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://browneggs.shop/assets/bes-BD7yFRVI.png" alt="browneggs.shop Logo" width="120" class="logo">
          <h1>${statusContent.icon} ${statusContent.title}</h1>
          <p>Hi ${order.user_full_name},</p>
          <p>${statusContent.message}</p>
        </div>

        <div class="order-info">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
          <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>Status:</strong> 
            <span class="status-${order.status.toLowerCase()}">
              ${order.status}
            </span>
          </p>
          <p><em>${order.order_notes}</em></p>
        </div>
        <h3>Order Items</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map((item: any) => `
                    <tr>
                        <td>${item.product_name || item.title}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.price}</td>
                        <td>₹${item.price * item.quantity}</td>
                    </tr>
                `).join('')}
                <tr>
                    <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                    <td>₹${totalAmount}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right;"><strong>Delivery Fee:</strong></td>
                    <td>₹${deliveryFee}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
                    <td>₹${finalTotal}</td>
                </tr>
            </tbody>
        </table>

        <div class="total">
            Total Amount: ₹${finalTotal}
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://browneggs.shop/#/orders" class="button">View Order Details</a>
        </div>

        <div class="footer">
            <p>Need help? Contact us:</p>
            <p>WhatsApp: <a href="https://wa.me/+919493543214">+91 9493543214</a></p>
            <p>Email: <a href="mailto:contact@browneggs.shop">contact@browneggs.shop</a></p>
            <p>Available Monday to Saturday, 9 AM to 6 PM IST</p>
        </div>
    </div>
</body>
</html>`
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === "POST") {
    try {
      const { order, email, items } = await req.json();
      
      if (!order || !email || !items) {
        return new Response("Missing required data", { status: 400 });
      }
      // Add debug logging
      console.log('Order confirmation data:', {
        items,
        order,
        itemsWithNames: items.map(item => ({
          id: item.id,
          name: item.product_name || item.title,
          quantity: item.quantity
        }))
      });

      const totalAmount = items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      // Use the delivery fee passed from checkout
      const deliveryFee = order.delivery_fee || 0;
      const finalTotal = order.final_total || totalAmount + deliveryFee;

      const emailContent = getEmailContentByStatus(order, items, totalAmount, deliveryFee, finalTotal);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendapi}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "browneggs.shop <contact@browneggs.shop>",
          to: [email, 'contact@browneggs.shop'],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending email:", errorText);
        return new Response("Error sending email", { 
          status: 500,
          headers: corsHeaders 
        });
      }

      return new Response("Email sent successfully", { 
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response("Internal server error", { 
        status: 500,
        headers: corsHeaders
      });
    }
  }

  return new Response("Method not allowed", { 
    status: 405,
    headers: corsHeaders
  });
};

serve(handler);