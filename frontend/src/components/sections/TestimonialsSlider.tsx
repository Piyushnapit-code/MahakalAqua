import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Generate SVG avatar based on name
const generateAvatar = (name: string, _gender: 'male' | 'female') => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const colorIndex = name.length % colors.length;
  const bgColor = colors[colorIndex];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="75" fill="${bgColor}"/>
      <text x="75" y="85" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
    </svg>
  `)}`;
};

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    location: 'Mumbai',
    rating: 5,
    comment: 'Excellent service! The team installed our RO system professionally and the water quality is amazing. Highly recommend Mahakal Aqua for their expertise and reliability.',
    avatar: generateAvatar('Rajesh Kumar', 'male'),
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    comment: 'Very reliable service. They maintain our RO system regularly and are always available for support. The water quality has improved significantly since installation.',
    avatar: generateAvatar('Priya Sharma', 'female'),
  },
  {
    id: 3,
    name: 'Amit Patel',
    location: 'Pune',
    rating: 5,
    comment: 'Best water purification service in the city. Highly recommend Mahakal Aqua for quality and service. Their technicians are professional and knowledgeable.',
    avatar: generateAvatar('Amit Patel', 'male'),
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    location: 'Bangalore',
    rating: 5,
    comment: 'Outstanding customer service and excellent water quality. The installation was quick and the team was very professional. Our family is very satisfied.',
    avatar: generateAvatar('Sneha Reddy', 'female'),
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Chandigarh',
    rating: 5,
    comment: 'Great experience with Mahakal Aqua. The RO system works perfectly and the maintenance service is top-notch. Worth every penny spent.',
    avatar: generateAvatar('Vikram Singh', 'male'),
  },
  {
    id: 6,
    name: 'Kavita Joshi',
    location: 'Ahmedabad',
    rating: 5,
    comment: 'Professional service from start to finish. The water quality is excellent and the customer support is always helpful. Highly recommended!',
    avatar: generateAvatar('Kavita Joshi', 'female'),
  },
];

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="section-padding bg-gradient-to-br from-white to-primary-50/30 relative overflow-hidden">
      {/* Water-Themed Background */}
      <div className="absolute inset-0 testimonials-bubbles-bg"></div>
      <div className="absolute inset-0">
        {/* Water-themed floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-element floating-water-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`droplet-${i}`}
            className="floating-element floating-water-droplet"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 80, 0],
              opacity: [0, 0.5, 0],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 1.5,
            }}
          />
        ))}
      </div>

      <div className="container relative">
        <div className="text-center mb-16">
          <motion.h2 
            className="heading-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p 
            className="text-body-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Don't just take our word for it. Here's what our satisfied customers 
            have to say about our services.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Display */}
          <div className="relative h-96 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="card-gradient p-8 md:p-12 text-center max-w-2xl mx-auto shadow-glow-lg">
                  {/* Quote Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block mb-6"
                  >
                    <Quote className="h-12 w-12 text-primary-500 mx-auto" />
                  </motion.div>

                  {/* Rating */}
                  <motion.div 
                    className="flex items-center justify-center mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current mx-1" />
                    ))}
                  </motion.div>

                  {/* Comment */}
                  <motion.blockquote 
                    className="text-lg md:text-xl text-gray-700 mb-8 italic leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    "{testimonials[currentIndex].comment}"
                  </motion.blockquote>

                  {/* Customer Info */}
                  <motion.div 
                    className="flex items-center justify-center space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary-200 shadow-lg">
                      <img
                        src={testimonials[currentIndex].avatar}
                        alt={testimonials[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg text-gray-800">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonials[currentIndex].location}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <motion.button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-6 w-6 text-primary-600" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-primary-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={goToNext}
              className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-6 w-6 text-primary-600" />
            </motion.button>
          </div>

          {/* Auto-play Toggle */}
          <div className="text-center mt-6">
            <motion.button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              {isAutoPlaying ? 'Pause' : 'Play'} Auto-slide
            </motion.button>
          </div>
        </div>

        {/* Additional Testimonials Grid (for larger screens) */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mt-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover-lift p-6"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4 italic line-clamp-3">
                "{testimonial.comment}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
