import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import config from '../config/env';
import { toTelHref } from '../lib/phone';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  CheckCircle, 
  Phone, 
  Mail,
  MapPin,
  Home,
  Building,
  Factory,
  Droplets,
  Shield,
  Clock,
  Award,
  Send,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import type { EnquiryFormData } from '../types';

const serviceTypes = [
  {
    id: 'installation',
    title: 'RO Installation',
    description: 'New RO system installation with complete setup',
    icon: Droplets,
    price: 'Starting from ₹8,999',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Service',
    description: 'Regular maintenance and filter replacement',
    icon: Shield,
    price: 'Starting from ₹499',
  },
  {
    id: 'repair',
    title: 'Repair Service',
    description: 'Quick repair and troubleshooting',
    icon: Clock,
    price: 'Starting from ₹299',
  },
  {
    id: 'upgrade',
    title: 'System Upgrade',
    description: 'Upgrade existing system with latest technology',
    icon: Award,
    price: 'Starting from ₹2,999',
  },
];

const propertyTypes = [
  { id: 'residential', label: 'Residential', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Building },
  { id: 'industrial', label: 'Industrial', icon: Factory },
];

const familySizes = [
  { id: '1-2', label: '1-2 Members' },
  { id: '3-4', label: '3-4 Members' },
  { id: '5-6', label: '5-6 Members' },
  { id: '7+', label: '7+ Members' },
];

const waterSources = [
  { id: 'municipal', label: 'Municipal Water' },
  { id: 'borewell', label: 'Borewell' },
  { id: 'tanker', label: 'Water Tanker' },
  { id: 'other', label: 'Other' },
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Free Site Survey',
    description: 'Complimentary assessment of your water needs',
  },
  {
    icon: CheckCircle,
    title: 'Instant Quote',
    description: 'Get pricing within 24 hours of enquiry',
  },
  {
    icon: CheckCircle,
    title: 'Expert Consultation',
    description: 'Professional advice from certified technicians',
  },
  {
    icon: CheckCircle,
    title: 'No Hidden Costs',
    description: 'Transparent pricing with no surprise charges',
  },
];

export default function Enquiry() {
  const telHref = toTelHref(config.company.phone) || '#';
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    serviceType: '',
    location: '',
    propertyType: '',
    familySize: '',
    waterSource: '',
    currentSystem: '',
    issues: '',
    preferredDate: '',
    preferredTime: '',
    budget: '',
    additionalRequirements: '',
  });

  const [errors, setErrors] = useState<Partial<EnquiryFormData>>({});
  const [selectedService, setSelectedService] = useState<string>('');

  const enquiryMutation = useMutation({
    mutationFn: async (data: EnquiryFormData) => {
      // Align payload with backend expectations
      const submissionData = {
        ...data,
        // Ensure description is provided via message fallback
        message: (data.message?.trim() || data.issues?.trim() || data.additionalRequirements?.trim() || ''),
      };
      return api.post('/enquiry', submissionData);
    },
    onSuccess: (response: any) => {
      const serverMsg = response?.data?.message || 'Enquiry submitted successfully! We will contact you soon.';
      toast.success(serverMsg);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        serviceType: '',
        location: '',
        propertyType: '',
        familySize: '',
        waterSource: '',
        currentSystem: '',
        issues: '',
        preferredDate: '',
        preferredTime: '',
        budget: '',
        additionalRequirements: '',
        message: '',
      });
      setSelectedService('');
      setErrors({});
    },
    onError: (error: any) => {
      const serverErr = error?.response?.data?.message || error?.message || 'Failed to submit enquiry. Please try again.';
      toast.error(serverErr);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<EnquiryFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(digits)) {
        newErrors.phone = 'Enter valid 10-digit Indian mobile (starts 6-9)';
      }
    }
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode && !/^[1-9]\d{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode (cannot start with 0)';
    }
    // Service type optional: default to 'other' at submit time
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';

    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      const firstKey = Object.keys(newErrors)[0] as keyof EnquiryFormData;
      const targetSelector = firstKey === 'serviceType' ? '#service-selection' : `[name="${firstKey}"]`;
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus?.();
      }
      toast.error(newErrors[firstKey] || 'Please fix the highlighted fields');
    }
    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload: EnquiryFormData = {
        ...formData,
        // Default service type when not selected
        serviceType: formData.serviceType || 'other',
        message: formData.message?.trim() || formData.issues?.trim() || formData.additionalRequirements?.trim() || '',
      };
      enquiryMutation.mutate(payload);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof EnquiryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setFormData(prev => ({ ...prev, serviceType: serviceId }));
    if (errors.serviceType) {
      setErrors(prev => ({ ...prev, serviceType: undefined }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Free Quote - RO Installation & Service Enquiry | Mahakal Aqua</title>
        <meta 
          name="description" 
          content="Get a free quote for RO installation, maintenance, and repair services. Fill out our enquiry form for personalized water purification solutions." 
        />
        <meta 
          name="keywords" 
          content="RO quote, water purifier price, RO installation cost, free estimate, water purification enquiry" 
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
              Get Your Free
              <span className="text-primary-600"> Quote</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-body-lg max-w-3xl mx-auto mb-8"
            >
              Tell us about your water purification needs and get a personalized quote within 24 hours. 
              Our experts will help you choose the perfect solution for your home or business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center space-x-6 text-sm text-gray-600"
            >
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary-600" />
                <span>Free Quote</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>No Obligation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <span>24hr Response</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Selection */}
      <section id="service-selection" className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Select Your Service</h2>
            <p className="text-body-lg max-w-3xl mx-auto">
              Choose the service you need to get started with your personalized quote.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {serviceTypes.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`card cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'ring-2 ring-primary-600 bg-primary-50'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <div className="card-content text-center">
                    <input
                      type="radio"
                      name="serviceType"
                      value={service.id}
                      checked={formData.serviceType === service.id}
                      onChange={() => handleServiceSelect(service.id)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                      selectedService === service.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <p className="text-primary-600 font-semibold">{service.price}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Hidden input to participate in validation focus/scroll */}
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={() => {}}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />

          {errors.serviceType && (
            <p className="text-red-500 text-sm mt-[-8px] mb-8">{errors.serviceType}</p>
          )}
        </div>
      </section>

      {/* Enquiry Form */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="card-content">
                <div className="text-center mb-8">
                  <h2 className="heading-2 mb-4">Tell Us About Your Requirements</h2>
                  <p className="text-body-lg">
                    Fill out the form below and our experts will contact you with a personalized quote.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`input ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`input ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                      Address Information
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complete Address *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className={`input ${errors.address ? 'border-red-500' : ''}`}
                          placeholder="Enter your complete address"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`input ${errors.city ? 'border-red-500' : ''}`}
                            placeholder="Enter your city"
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className={`input ${errors.pincode ? 'border-red-500' : ''}`}
                            placeholder="Enter pincode"
                          />
                          {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-primary-600" />
                      Service Details
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Type *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {propertyTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <label
                                key={type.id}
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                  formData.propertyType === type.id
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="propertyType"
                                  value={type.id}
                                  checked={formData.propertyType === type.id}
                                  onChange={handleInputChange}
                                  className="sr-only"
                                />
                                <Icon className="h-5 w-5 mr-3 text-primary-600" />
                                <span>{type.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Family Size
                          </label>
                          <select
                            name="familySize"
                            value={formData.familySize}
                            onChange={handleInputChange}
                            className="input"
                          >
                            <option value="">Select family size</option>
                            {familySizes.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Water Source
                          </label>
                          <select
                            name="waterSource"
                            value={formData.waterSource}
                            onChange={handleInputChange}
                            className="input"
                          >
                            <option value="">Select water source</option>
                            {waterSources.map((source) => (
                              <option key={source.id} value={source.id}>
                                {source.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Water System (if any)
                        </label>
                        <input
                          type="text"
                          name="currentSystem"
                          value={formData.currentSystem}
                          onChange={handleInputChange}
                          className="input"
                          placeholder="e.g., Old RO system, Water filter, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Water Issues
                        </label>
                        <textarea
                          name="issues"
                          value={formData.issues}
                          onChange={handleInputChange}
                          rows={3}
                          className="input"
                          placeholder="Describe any water quality issues you're facing..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scheduling and Budget */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                      Scheduling & Budget
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date for Site Visit
                        </label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          className="input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time
                        </label>
                        <select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="">Select time</option>
                          <option value="morning">Morning (9 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                          <option value="evening">Evening (4 PM - 7 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Range
                        </label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="">Select budget range</option>
                          <option value="under-10k">Under ₹10,000</option>
                          <option value="10k-20k">₹10,000 - ₹20,000</option>
                          <option value="20k-30k">₹20,000 - ₹30,000</option>
                          <option value="30k-50k">₹30,000 - ₹50,000</option>
                          <option value="above-50k">Above ₹50,000</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary-600" />
                      Additional Requirements
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Any specific requirements or questions?
                      </label>
                      <textarea
                        name="additionalRequirements"
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        rows={4}
                        className="input"
                        placeholder="Tell us about any specific requirements, questions, or concerns..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={enquiryMutation.isPending}
                      className="btn-primary btn-lg"
                    >
                      {enquiryMutation.isPending ? (
                        'Submitting...'
                      ) : (
                        <>
                          Submit Enquiry
                          <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-600 mt-4">
                      By submitting this form, you agree to our terms and conditions. 
                      We will contact you within 24 hours.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container">
          <div className="text-center">
            <h2 className="heading-2 mb-4 text-white">
              Need Immediate Assistance?
            </h2>
            <p className="text-body-lg mb-8 text-primary-100 max-w-3xl mx-auto">
              If you have urgent requirements or need immediate assistance, 
              feel free to call us directly or send an email.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={telHref}
                className="btn-secondary btn-lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
              <a 
                href="mailto:info@mahakalaqua.com"
                className="btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
              >
                <Mail className="mr-2 h-5 w-5" />
                Send Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}