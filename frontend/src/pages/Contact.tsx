import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import config from '../config/env';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  MessageSquare,
  User,
  Building,
  Calendar,
  Star
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import type { ContactFormData } from '../types';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Our Office',
    details: [
      'Shop No. 15, Ground Floor',
      'Mahakal Complex, Main Road',
      'Andheri West, Mumbai - 400058',
      'Maharashtra, India'
    ],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: [
      `${config.company.phone}`,
      '+91 98765 43210',
      'Toll Free: 1800-123-4567'
    ],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: [
      'info@mahakalaqua.com',
      'support@mahakalaqua.com',
      'sales@mahakalaqua.com'
    ],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: [
      'Monday - Saturday: 9:00 AM - 7:00 PM',
      'Sunday: 10:00 AM - 5:00 PM',
      'Emergency Service: 24/7'
    ],
  },
];

const serviceAreas = [
  'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Thane', 
  'Navi Mumbai', 'Kalyan', 'Vasai', 'Bhiwandi'
];

const faqs = [
  {
    question: 'What is your response time for service calls?',
    answer: 'We typically respond within 2-4 hours for regular service calls and within 1 hour for emergency repairs.',
  },
  {
    question: 'Do you provide installation services?',
    answer: 'Yes, we provide complete installation services with free site survey, professional installation, and system testing.',
  },
  {
    question: 'What warranty do you offer?',
    answer: 'We offer 2 years comprehensive warranty on all new installations and 6 months warranty on repair services.',
  },
  {
    question: 'Do you service all brands of RO systems?',
    answer: 'Yes, our certified technicians can service and repair all major brands of RO water purification systems.',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: 'general',
    preferredDate: '',
    preferredTime: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const contactMutation = useMutation({
    mutationFn: (data: ContactFormData) => api.post('/contact', data),
    onSuccess: () => {
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        serviceType: 'general',
        preferredDate: '',
        preferredTime: '',
      });
      setErrors({});
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      contactMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Get in Touch for Water Purification Services | Mahakal Aqua</title>
        <meta 
          name="description" 
          content="Contact Mahakal Aqua for RO installation, maintenance, and repair services. Call us, visit our office, or send a message. 24/7 emergency support available." 
        />
        <meta 
          name="keywords" 
          content="contact mahakal aqua, RO service contact, water purifier support, Mumbai RO service" 
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="heading-1 mb-6"
            >
              Get in
              <span className="text-primary-600"> Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-body-lg max-w-3xl mx-auto mb-8"
            >
              Have questions about our water purification services? Need a quote or want to schedule 
              a service? We're here to help! Contact us through any of the methods below.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center space-x-6 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>24/7 Emergency Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Quick Response</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
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
                  <h3 className="text-xl font-semibold mb-4">{info.title}</h3>
                  <div className="space-y-2">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-body">
                        {info.icon === Phone && detailIndex === 0 ? (
                          <a href={`tel:${detail}`} className="hover:text-primary-600">
                            {detail}
                          </a>
                        ) : info.icon === Mail ? (
                          <a href={`mailto:${detail}`} className="hover:text-primary-600">
                            {detail}
                          </a>
                        ) : (
                          detail
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Send us a Message</h2>
                      <p className="text-gray-600">We'll get back to you within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="Enter your email"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleInputChange}
                            className="input pl-10"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="installation">RO Installation</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair Service</option>
                            <option value="testing">Water Testing</option>
                            <option value="emergency">Emergency Service</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`input ${errors.subject ? 'border-red-500' : ''}`}
                        placeholder="Enter message subject"
                      />
                      {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            className="input pl-10"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <select
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleInputChange}
                            className="input pl-10"
                          >
                            <option value="">Select time</option>
                            <option value="morning">Morning (9 AM - 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                            <option value="evening">Evening (4 PM - 7 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        className={`input ${errors.message ? 'border-red-500' : ''}`}
                        placeholder="Tell us about your requirements..."
                      />
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="btn-primary w-full"
                    >
                      {contactMutation.isPending ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Map */}
              <div className="card">
                <div className="card-content p-0">
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Map</p>
                      <p className="text-sm text-gray-500">
                        Mahakal Complex, Andheri West, Mumbai
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="card">
                <div className="card-content">
                  <h3 className="text-xl font-semibold mb-4">Service Areas</h3>
                  <p className="text-body mb-4">
                    We provide our services across Maharashtra with focus on:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="card bg-primary-600 text-white">
                <div className="card-content">
                  <h3 className="text-xl font-semibold mb-4">Need Immediate Help?</h3>
                  <p className="mb-6 text-primary-100">
                    For urgent service requests or emergencies, call us directly.
                  </p>
                  <div className="space-y-3">
                    <a
                      href={`tel:${config.company.phone}`}
                      className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>{config.company.phone}</span>
                    </a>
                    <a
                      href="mailto:emergency@mahakalaqua.com"
                      className="flex items-center space-x-3 p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span>emergency@mahakalaqua.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
            <p className="text-body-lg max-w-3xl mx-auto">
              Find answers to common questions about our services and support.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="card-content">
                  <h3 className="text-lg font-semibold mb-3 flex items-start space-x-3">
                    <Star className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-body ml-8">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}