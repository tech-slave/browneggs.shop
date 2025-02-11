import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <p>Privacy Policy</p>
      <p>Last updated: 02/11/2025</p>
      <p>Thank you for choosing to be part of our community at browneggs.shop.</p>
      <h1 className="text-2xl font-bold mb-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Privacy Policy for browneggs.shop</h1>
      <p className="mb-4"><strong>Effective Date:</strong> [02/11/2025]</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Introduction</h2>
      <p className="mb-4">Welcome to browneggs.shop. We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website and make purchases.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">1. Information We Collect</h2>
      <p className="mb-4"><strong>Personal Information:</strong> When you register or make a purchase, we collect details such as:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Name</li>
        <li>Email address</li>
        <li>Shipping address</li>
        <li>Payment information (e.g., credit card details)</li>
      </ul>

      <p className="mb-4"><strong>Usage Data:</strong> We gather information on how you interact with our website, including:</p>
      <ul className="list-disc list-inside mb-4">
        <li>IP address</li>
        <li>Browser type</li>
        <li>Device information</li>
        <li>Pages visited</li>
      </ul>

      <p className="mb-4"><strong>Cookies:</strong> We use cookies to enhance your browsing experience. You can manage cookie settings through your browser.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">2. Purpose of Data Collection</h2>
      <p className="mb-4">We use your information to:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Process and fulfill orders</li>
        <li>Provide customer support</li>
        <li>Improve website functionality</li>
        <li>Send promotional communications (with your consent)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">3. Data Security</h2>
      <p className="mb-4">We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure. By using our website, you acknowledge and accept these risks.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">4. Data Sharing</h2>
      <p className="mb-4">We do not sell your personal information. We may share your data with:</p>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Service Providers:</strong> Third parties assisting in operations like payment processing and shipping.</li>
        <li><strong>Legal Compliance:</strong> Authorities, if required by law.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">5. Data Retention</h2>
      <p className="mb-4">We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">6. Your Rights</h2>
      <p className="mb-4">Under Indian law, you have the right to:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Access and correct your personal information</li>
        <li>Request deletion of your data</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      <p className="mb-4">To exercise these rights, contact us at <strong>[Your Contact Email]</strong>.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">7. Changes to This Policy</h2>
      <p className="mb-4">We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated effective date.</p>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">8. Contact Us</h2>
      <p className="mb-4">For questions or concerns about this Privacy Policy, please reach out to us at:</p>
      <ul className="list-disc list-inside mb-4">
        <li><strong></strong><div className="space-y-6">
                {[
                  {
                    icon: <Phone className="w-6 h-6" />,
                    title: "Phone",
                    content: "+91 94935 43214"
                  },
                  {
                    icon: <Mail className="w-6 h-6" />,
                    title: "Email",
                    content: "contact@browneggs.shop"
                  },
                  {
                    icon: <MapPin className="w-6 h-6" />,
                    title: "Address",
                    content: "6-3-630/B, 3rd floor, Sri sai Nilayam, Anand Nagar colony, Khairatabad signals, Hyderabad, Telangana - 500004"
                  },
                  {
                    icon: <Clock className="w-6 h-6" />,
                    title: "Business Hours",
                    content: "Mon - Sat: 8:00 AM - 6:00 PM"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900 dark:to-amber-800 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 break-words max-w-xs">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 text-2xl font-bold bg-gradient-to-r from-amber-400 via-blue-500 to-amber-600 bg-clip-text text-transparent animate-gradient">Important Notes:</h2>
      <ul className="list-disc list-inside mb-4">
        <li><strong>Payment Information:</strong> We do not store sensitive payment details directly. Payments are processed through secure third-party services.</li>
        <li><strong>Cookies:</strong> By using our website, you consent to our use of cookies. You can manage cookie preferences through your browser settings.</li>
      </ul>
    </div>
  );
};

export default Privacy;