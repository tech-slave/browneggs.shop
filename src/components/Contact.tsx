import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (can be integrated with a backend service)
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about our products? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                Contact Information
              </h2>
              
              <div className="space-y-6">
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
            </div>
          </div>

          <div className="animate-fade-in delay-200">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                Send us a Message
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}