import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import GallerySection from '../components/sections/GallerySection';
import TestimonialsSlider from '../components/sections/TestimonialsSlider';
import ImageShowcase from '../components/ImageShowcase';
import { 
  Droplets, 
  Shield, 
  Clock, 
  Award, 
  Users, 
  ArrowRight,
  CheckCircle,
  Phone,
  Wrench,
  Settings
} from 'lucide-react';
import config from '../config/env';
import { toTelHref } from '../lib/phone';

const features = [
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'ISO certified products with 2-year warranty on all installations.',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock customer support and emergency repair services.',
  },
  {
    icon: Award,
    title: 'Expert Team',
    description: 'Certified technicians with 10+ years of experience in water purification.',
  },
  {
    icon: Users,
    title: '10K+ Happy Customers',
    description: 'Trusted by thousands of families across the region for pure water solutions.',
  },
];

const services = [
  {
    icon: Wrench,
    title: 'RO Installation',
    description: 'Professional installation of RO systems with proper setup and testing.',
    href: '/services#installation',
  },
  {
    icon: Settings,
    title: 'Maintenance & Repair',
    description: 'Regular maintenance and quick repair services to keep your RO running smoothly.',
    href: '/services#maintenance',
  },
  {
    icon: Droplets,
    title: 'Water Testing',
    description: 'Comprehensive water quality testing to ensure optimal purification.',
    href: '/services#testing',
  },
];

export default function Home() {
  const telHref = toTelHref(config.company.phone) || '#';
  return (
    <>
      <Helmet>
        <title>{config.company.name} - Premium Water Purification Solutions</title>
        <meta 
          name="description" 
          content="Leading provider of RO water purification systems, installation, maintenance, and repair services. Trusted by 10,000+ customers for pure, safe drinking water." 
        />
        <meta 
          name="keywords" 
          content="RO water purifier, water purification, RO installation, water filter, RO maintenance, water testing" 
        />
      </Helmet>

      <div>
        {/* Hero Section */}
        <section className="relative bg-gradient-mesh overflow-hidden">
          <div className="absolute inset-0 hero-aqua-bg"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white/60 to-secondary-50/80"></div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                className="floating-element floating-water-bubble"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -120, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.3, 1.2, 0.3],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`droplet-${i}`}
                className="floating-element floating-water-droplet"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, 100, 0],
                  opacity: [0, 0.7, 0],
                  rotate: [0, 360, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`shimmer-${i}`}
                className="floating-element floating-water-shimmer"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scaleY: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container section-padding relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="heading-1 mb-6">
                  Pure Water,
                  <span className="text-gradient-primary"> Pure Life</span>
                </h1>
                <p className="text-body-lg mb-8">
                  Experience the finest water purification solutions with our premium RO systems. 
                  Trusted by over 10,000 families for safe, clean, and healthy drinking water.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link to="/enquiry" className="btn-primary btn-lg">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link to="/services" className="btn-outline btn-lg">
                    Our Services
                  </Link>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Free Installation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>1 Year Warranty</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative card-gradient shadow-glow-lg p-8 animate-float">
                  <div className="absolute -top-4 -right-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    #1 Choice
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse-slow">
                      <Droplets className="h-10 w-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Premium RO Systems</h3>
                    <p className="text-gray-600 mb-6">
                      Advanced multi-stage filtration technology for the purest water quality.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">99.9%</div>
                        <div className="text-sm text-gray-600">Purification</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary-600">10L/hr</div>
                        <div className="text-sm text-gray-600">Capacity</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding relative overflow-hidden">
          <div className="absolute inset-0 features-water-bg"></div>
          <div className="container relative">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">Why Choose Mahakal Aqua?</h2>
              <p className="text-body-lg max-w-3xl mx-auto">
                We are committed to providing the highest quality water purification solutions 
                with unmatched service and support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300 shadow-lg group-hover:shadow-glow group-hover:scale-110">
                      <Icon className="h-8 w-8 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-body">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <GallerySection />

        {/* Services Section */}
        <section className="section-padding bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 services-stream-bg"></div>
          <div className="container relative">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">Our Services</h2>
              <p className="text-body-lg max-w-3xl mx-auto">
                Comprehensive water purification services from installation to maintenance, 
                ensuring your family always has access to pure, safe drinking water.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="card-content">
                      <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300 shadow-lg group-hover:shadow-glow group-hover:scale-110">
                        <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                      <p className="text-body mb-6">{service.description}</p>
                      <Link
                        to={service.href}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link to="/services" className="btn-primary btn-lg">
                View All Services
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSlider />

        {/* Image Showcase */}
        <ImageShowcase />

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 cta-aqua-gradient-bg"></div>
          <div className="container relative">
            <div className="text-center">
              <h2 className="heading-2 mb-4 text-white">
                Ready for Pure, Safe Water?
              </h2>
              <p className="text-body-lg mb-8 text-primary-100 max-w-3xl mx-auto">
                Get a free consultation and quote for your water purification needs. 
                Our experts will help you choose the perfect solution for your home.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/enquiry" className="btn-secondary btn-lg">
                  Get Free Quote
                </Link>
                <a 
                  href={telHref}
                  className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
