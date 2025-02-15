import React, { useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "Naga Bhushan",
    rating: 5,
    comment: "The freshest eggs I've ever had! The delivery was quick and the packaging was excellent.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQESt877MgH7jA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1698340368866?e=1744848000&v=beta&t=5FbakzLtmKzP2j-2gZYt1EmilGL4Bt938mPrJFXmJz0"
  },
  {
    name: "Rahul Verma",
    rating: 4,
    comment: "Premium quality eggs at reasonable prices. The subscription service is very convenient.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
  },
  {
    name: "Ajay Kumar",
    rating: 4,
    comment: "Excellent customer service and consistently high-quality products. Highly recommended!",
    image: "https://media.licdn.com/dms/image/v2/D5603AQE_ib1NIHaK1g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712209489182?e=1744848000&v=beta&t=mA_lC_55_8JVierhIDMMggiM2ppUFbhcSIaU72sQ_k0"
  },
  {
    name: "Uma Mahesh",
    rating: 5,
    comment: "The organic feed really makes a difference. These eggs taste amazing!",
    image: "https://media.licdn.com/dms/image/v2/D5603AQFZlDZGd22WNw/profile-displayphoto-shrink_400_400/B56ZSwh7RzGsAg-/0/1738128472800?e=1744848000&v=beta&t=ofIgaUZhV8TlaG74YKH0Npwa-ctxyF42bpoPQ49gjHA"
  }
];

export default function Reviews() {
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const reviewElements = reviewsRef.current?.querySelectorAll('.review-card');
    reviewElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div ref={reviewsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="review-card opacity-0 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700/50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{ 
                animationDelay: `${index * 200}ms`,
                transform: `translateY(${index % 2 ? '20px' : '0'})` 
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold dark:text-white">{review.name}</h3>
                  <div className="flex text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}