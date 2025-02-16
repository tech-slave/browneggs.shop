import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";


// ...rest of the code remains the same


const supabaseUrl = "https://qwhyqudqnbslipoqgloj.supabase.co";
const supabaseAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aHlxdWRxbmJzbGlwb3FnbG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MDQ5OTksImV4cCI6MjA1NTA4MDk5OX0.QmZD3e6plOqy7XUHD1jROytzg03V3IQ_MxBg0JljUKw";

const supabase = createClient(supabaseUrl, supabaseAnon);

const resendapi = "re_XtnQr9r1_Dg6MRJGm28pXmpyZ5JeL86S3";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "POST") {
    try {
      // Get user data from the request
      const { record } = await req.json();
      const email = record.email;
      const fullName = record.full_name || "Customer";

      // Prepare email content
      const emailContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Welcome to BrownEggs.shop!</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f8f8f8;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h2 {
                    color: #333;
                }
                p {
                    color: #555;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 24px;
                    background-color: #f4a261;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 5px;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to BrownEggs.shop! 🥚</h2>
                <p>We are <strong>egg-cited</strong> to have you join us! Your account has been successfully created, and you're now part of a community that loves fresh, high-quality eggs delivered straight to your door.</p>
                
                <p>Ready to explore? Click below to start shopping:</p>
                
                <a href="https://browneggs.shop/products" class="button">Start Shopping</a>

                <p class="footer">If you have any questions, feel free to reach out to us at <a href="mailto:contact@browneggs.shop">contact@browneggs.shop</a>.</p>
            </div>
        </body>
        </html>`;

      // Send the email using Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendapi}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "contact@browneggs.shop",
          to: email,
          subject: "Welcome to BrownEggs.shop! 🥚",
          html: emailContent,
        }),
      });

      if (response.ok) {
        return new Response("Email sent", { status: 200 });
      } else {
        const errorText = await response.text();
        console.error("Error sending email:", errorText);
        return new Response("Error sending email", { status: 500 });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Error sending email", { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
};

serve(handler);