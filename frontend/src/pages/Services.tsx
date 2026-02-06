import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import config from '../config/env';
import { toTelHref } from '../lib/phone';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Settings, 
  Droplets, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Phone,
  Calendar,
  Award,
  Users,
  Zap,
  Filter,
  Gauge,
  RefreshCw
} from 'lucide-react';

const services = [
  {
    id: 'installation',
    icon: Wrench,
    title: 'RO Installation',
    description: 'Professional installation of RO water purification systems with complete setup and testing.',
    features: [
      'Free site survey and consultation',
      'Professional installation by certified technicians',
      'Complete system testing and commissioning',
      'User training and documentation',
      '2-year comprehensive warranty',
      'Free first service after 3 months'
    ],
    pricing: 'Starting from ₹8,999',
    duration: '2-3 hours',
    warranty: '2 years',
  },
  {
    id: 'maintenance',
    icon: Settings,
    title: 'Maintenance & Repair',
    description: 'Regular maintenance and quick repair services to ensure optimal performance of your RO system.',
    features: [
      'Scheduled preventive maintenance',
      'Filter replacement and cleaning',
      'System performance optimization',
      'Emergency repair services',
      'Genuine spare parts only',
      '24/7 customer support'
    ],
    pricing: 'Starting from ₹499',
    duration: '1-2 hours',
    warranty: '6 months on repairs',
  },
  {
    id: 'testing',
    icon: Droplets,
    title: 'Water Testing',
    description: 'Comprehensive water quality testing to ensure your RO system is delivering pure, safe water.',
    features: [
      'TDS (Total Dissolved Solids) testing',
      'pH level measurement',
      'Bacterial contamination check',
      'Heavy metals detection',
      'Detailed water quality report',
      'Recommendations for improvement'
    ],
    pricing: 'Starting from ₹299',
    duration: '30-45 minutes',
    warranty: 'Certified results',
  },
];

const additionalServices = [
  {
    icon: Filter,
    title: 'Filter Replacement',
    description: 'Regular replacement of RO filters to maintain water quality.',
    price: '₹299 - ₹899',
  },
  {
    icon: Gauge,
    title: 'System Upgrade',
    description: 'Upgrade your existing RO system with latest technology.',
    price: '₹2,999 - ₹8,999',
  },
  {
    icon: RefreshCw,
    title: 'Annual Maintenance',
    description: 'Comprehensive annual maintenance package.',
    price: '₹1,999 - ₹3,999',
  },
  {
    icon: Zap,
    title: 'Emergency Service',
    description: '24/7 emergency repair and support services.',
    price: '₹599 - ₹1,499',
  },
];

const whyChooseUs = [
  {
    icon: Award,
    title: 'Certified Technicians',
    description: 'All our technicians are certified and have 10+ years of experience.',
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'We use only genuine parts and provide comprehensive warranties.',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Same-day service availability and 24/7 emergency support.',
  },
  {
    icon: Users,
    title: 'Customer Satisfaction',
    description: '99% customer satisfaction rate with 10,000+ happy customers.',
  },
];

const serviceProcess = [
  {
    step: '01',
    title: 'Contact Us',
    description: 'Call us or fill out our online form to schedule a service.',
  },
  {
    step: '02',
    title: 'Site Survey',
    description: 'Our expert visits your location for assessment and consultation.',
  },
  {
    step: '03',
    title: 'Service Execution',
    description: 'Professional service delivery with quality assurance.',
  },
  {
    step: '04',
    title: 'Follow-up',
    description: 'Post-service support and regular maintenance reminders.',
  },
];

export default function Services() {
  const telHref = toTelHref(config.company.phone) || '#';
  return (
    <>
      <Helmet>
        <title>Water Purification Services - RO Installation, Maintenance & Repair | Mahakal Aqua</title>
        <meta 
          name="description" 
          content="Professional RO installation, maintenance, and repair services. Water testing, filter replacement, and 24/7 support. Certified technicians with 2-year warranty." 
        />
        <meta 
          name="keywords" 
          content="RO installation, RO maintenance, RO repair, water testing, filter replacement, water purifier service" 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        {/* Animated background accents */}
        <motion.div
          className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary-200 blur-3xl opacity-50"
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.6, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-80px] top-10 h-72 w-72 rounded-full bg-secondary-200 blur-3xl opacity-40"
          animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute left-1/2 bottom-[-120px] h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200 blur-3xl opacity-30"
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <div className="container relative">
          <div className="text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="heading-1 mb-6"
            >
              Professional Water Purification
              <span className="text-primary-600"> Services</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-body-lg max-w-3xl mx-auto mb-8"
            >
              From installation to maintenance, we provide comprehensive water purification services 
              to ensure your family always has access to pure, safe drinking water.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/enquiry" className="btn-primary btn-lg">
                Get Free Quote
              </Link>
              <a 
                href={telHref}
                className="btn-outline btn-lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="section-padding relative overflow-hidden">
        {/* Background animation */}
        <motion.div
          className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary-100 blur-3xl opacity-50"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.6, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-60px] top-32 h-64 w-64 rounded-full bg-secondary-100 blur-3xl opacity-45"
          animate={{ scale: [1.1, 0.93, 1.1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        <motion.div
          className="absolute left-1/2 bottom-[-120px] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100 blur-3xl opacity-35"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.3, 0.48, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />

        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Our Core Services</h2>
            <p className="text-body-lg max-w-3xl mx-auto">
              We offer a complete range of water purification services with professional expertise 
              and guaranteed satisfaction.
            </p>
          </div>

          <div className="space-y-16 relative z-10">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  id={service.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="heading-3 mb-4">{service.title}</h3>
                    <p className="text-body-lg mb-6">{service.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{service.pricing}</div>
                        <div className="text-sm text-gray-600">Starting Price</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{service.duration}</div>
                        <div className="text-sm text-gray-600">Service Time</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{service.warranty}</div>
                        <div className="text-sm text-gray-600">Warranty</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/enquiry" className="btn-primary">
                        Book Service
                      </Link>
                      <a 
                        href={telHref}
                        className="btn-outline"
                      >
                        Call for Details
                      </a>
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className="card">
                      <div className="card-content">
                        <h4 className="text-xl font-semibold mb-4">Service Features</h4>
                        <ul className="space-y-3">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-body">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Additional Services</h2>
            <p className="text-body-lg max-w-3xl mx-auto">
              We also offer specialized services to meet all your water purification needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center group hover:shadow-lg transition-shadow"
                >
                  <div className="card-content">
                    <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                      <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-body mb-4">{service.description}</p>
                    <div className="text-primary-600 font-semibold">{service.price}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Why Choose Our Services?</h2>
            <p className="text-body-lg max-w-3xl mx-auto">
              We are committed to providing the highest quality services with professional expertise 
              and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-body">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4 text-white">Our Service Process</h2>
            <p className="text-body-lg max-w-3xl mx-auto text-primary-100">
              We follow a systematic approach to ensure quality service delivery and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceProcess.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="bg-white text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-primary-100">{step.description}</p>
                
                {index < serviceProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-primary-300 mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-12 text-center text-white">
            <h2 className="heading-2 mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-body-lg mb-8 text-primary-100 max-w-3xl mx-auto">
              Contact us today for a free consultation and quote. Our experts are ready to help you 
              choose the perfect water purification solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enquiry" className="btn-secondary btn-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Service
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
    </>
  );
}