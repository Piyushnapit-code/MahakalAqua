import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';

// Import assets images
import img1 from '../../assets/1.jpg';
import img2 from '../../assets/2.jpg';
import img3 from '../../assets/3.jpg';
import img4 from '../../assets/4.jpg';
import img5 from '../../assets/5.jpg';
import img6 from '../../assets/6.jpg';

const galleryItems = [
  {
    id: 1,
    title: 'RO Installation',
    description: 'Professional installation of premium RO systems',
    image: img1,
    category: 'Installation'
  },
  {
    id: 2,
    title: 'Water Testing',
    description: 'Comprehensive water quality analysis and testing',
    image: img2,
    category: 'Testing'
  },
  {
    id: 3,
    title: 'Maintenance Service',
    description: 'Regular maintenance and cleaning services',
    image: img3,
    category: 'Maintenance'
  },
  {
    id: 4,
    title: 'RO Parts & Accessories',
    description: 'Genuine spare parts and accessories',
    image: img4,
    category: 'Parts'
  },
  {
    id: 5,
    title: 'Customer Satisfaction',
    description: 'Happy customers with clean, pure water',
    image: img5,
    category: 'Customers'
  },
  {
    id: 6,
    title: 'Expert Team',
    description: 'Certified technicians at work',
    image: img6,
    category: 'Team'
  }
];

export default function GallerySection() {
  return (
    <section className="section-padding bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 gallery-ripples-bg"></div>
      
      {/* Water-Themed Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-element floating-water-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 10 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`glow-${i}`}
            className="floating-element floating-aqua-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="heading-2 mb-4">Our Work Gallery</h2>
          <p className="text-body-lg max-w-3xl mx-auto">
            Take a look at our professional installations, maintenance work, and the quality 
            of service we provide to our valued customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card hover-lift overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium">{item.description}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="card-content">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link 
            to="/gallery" 
            className="btn-primary btn-lg inline-flex items-center"
          >
            <Camera className="mr-2 h-5 w-5" />
            View Full Gallery
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: '500+', label: 'Installations' },
            { number: '1000+', label: 'Happy Customers' },
            { number: '50+', label: 'RO Models' },
            { number: '24/7', label: 'Support' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary-600 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
