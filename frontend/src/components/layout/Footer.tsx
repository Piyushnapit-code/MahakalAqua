import { Link } from 'react-router-dom';
import { 
  Droplets, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Clock,
  Shield,
  Award,
  Users
} from 'lucide-react';
import AnimatedWave from '../common/AnimatedWave';
import config from '../../config/env';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'RO Parts', href: '/ro-parts' },
];

const services = [
  { name: 'RO Installation', href: '/services#installation' },
  { name: 'Maintenance', href: '/services#maintenance' },
  { name: 'Repair Services', href: '/services#repair' },
  { name: 'Water Testing', href: '/services#testing' },
];

const features = [
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'ISO certified products'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round the clock service'
  },
  {
    icon: Award,
    title: 'Expert Team',
    description: 'Certified technicians'
  },
  {
    icon: Users,
    title: '10K+ Customers',
    description: 'Trusted by thousands'
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Animated Wave before Footer */}
      <AnimatedWave 
        className="bg-gradient-to-br from-white to-primary-50/30" 
        color="#3b82f6" 
        height={120} 
      />
      
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10"></div>
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="container section-padding relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6 group">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-lg shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading">{config.company.name}</h2>
                <p className="text-gray-400 text-sm">Premium Water Solutions</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner for premium water purification solutions. 
              We provide top-quality RO systems, maintenance services, and 
              genuine spare parts to ensure pure, safe drinking water for your family.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href={config.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110 hover:shadow-glow"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={config.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110 hover:shadow-glow"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={config.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110 hover:shadow-glow"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={config.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110 hover:shadow-glow"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/enquiry"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Get Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {config.company.address}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a
                  href={`tel:${config.company.phone}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {config.company.phone}
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <a
                  href={`mailto:${config.company.email}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {config.company.email}
                </a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Business Hours</h4>
              <div className="text-gray-400 text-sm space-y-1">
                <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                <p>Sunday: 10:00 AM - 5:00 PM</p>
                <p className="text-primary-400 font-medium">Emergency: 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} {config.company.name}. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/sitemap"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}