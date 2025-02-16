import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendapi = "re_XtnQr9r1_Dg6MRJGm28pXmpyZ5JeL86S3";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST") {
    try {
      // Get user data from the request
      const body = await req.json();
      console.log("Request Body:", body);

      const { record } = body; 
      const email = record?.email; 

      if (!email) {
        console.error("Email not found in the request body");
        return new Response("Email missing in request body", { status: 400 });
      }
      // Prepare email content
      const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BrownEggs.shop!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #f4a261, #2a9d8f);
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h2 {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        p {
            color: #333; /* Changed to dark gray for better contrast */
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color:#FF8C00;
            color: #fff; /* White text for better visibility */
            text-decoration: none;
            font-size: 18px;
            border-radius: 8px;
            font-weight: bold;
            text-transform: uppercase;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #e07b00; /* Darker amber on hover */
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #555; /* Improved contrast */
        }
        .footer a {
            color: #f4a261;
            text-decoration: none;
        }
        .logo {
            margin-bottom: 30px;
        }
        .congrats {
            font-size: 24px;
            color: #2a9d8f;
            font-weight: bold;
            text-align: center;
            margin-top: 30px;
        }
        .confetti {
            background-image: url('https://example.com/confetti.gif');
            background-repeat: no-repeat;
            background-position: center top;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container confetti">
        <div class="logo">
            <img src="https://browneggs.shop/assets/bes-BD7yFRVI.png" alt="browneggs.shop Logo" width="120px">
        </div>
        <h2>Welcome to browneggs.shop! 🥚</h2>
        <p>We are so <strong>egg-cited</strong> as you are now one step closer to a healthy lifestyle!</p>
        <p>Your account has been successfully created, and you're now part of a community that loves fresh, high-quality eggs delivered straight to your door.</p>
        <p class="congrats">Congratulations on your new egg-mazing journey! 🎉</p>
        <p>Ready to explore? Click below to start shopping:</p>
        <a href="https://browneggs.shop/#/products" class="button">Order Now</a>
        <p class="footer">If you have any questions, feel free to reach out to us at <a href="mailto:contact@browneggs.shop">contact@browneggs.shop</a>.</p>
    </div>
</body>
</html>
`;

      // Send the email using Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendapi}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: 'browneggs.shop <contact@browneggs.shop>',
          to: email,
          subject: "Welcome to browneggs.shop! 🥚",
          html: emailContent,
        }),
      });

      if (response.ok) {
        return new Response("Email sent", { status: 200 });
      } else {
        const errorText = await response.text();
        console.error("Error sending email:", errorText);
        return new Response("Error sending email-resend", { status: 500 });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Error sending email-edge", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
};

serve(handler);