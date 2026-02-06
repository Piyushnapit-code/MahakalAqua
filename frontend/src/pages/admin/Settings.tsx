import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Truck,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Lock,
  Calendar
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  logo: string;
  description: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

interface NotificationSettings {
  emailNotifications: {
    newOrders: boolean;
    lowStock: boolean;
    customerMessages: boolean;
    systemUpdates: boolean;
  };
  smsNotifications: {
    urgentAlerts: boolean;
    orderUpdates: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    orderAlerts: boolean;
    systemAlerts: boolean;
  };
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  loginAttempts: number;
  ipWhitelist: string[];
}

interface PaymentSettings {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paytmEnabled: boolean;
  paytmMerchantId: string;
  paytmMerchantKey: string;
  codEnabled: boolean;
  codCharges: number;
  minimumOrderAmount: number;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  deliveryAreas: string[];
  estimatedDeliveryDays: {
    standard: number;
    express: number;
  };
}

interface DataRetentionSettings {
  customerDataRetention: number; // days
  orderDataRetention: number; // days
  logDataRetention: number; // days
  automaticCleanup: boolean;
  backupBeforeCleanup: boolean;
  gdprCompliance: boolean;
}

interface PrivacyPolicySettings {
  lastUpdated: string;
  version: string;
  content: string;
  cookiePolicy: string;
  dataProcessingPurpose: string;
  thirdPartySharing: boolean;
  userRights: string[];
}

interface TermsOfServiceSettings {
  lastUpdated: string;
  version: string;
  content: string;
  acceptanceRequired: boolean;
  minimumAge: number;
  governingLaw: string;
  disputeResolution: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [showPasswords, setShowPasswords] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Mock data - replace with actual API calls
  const { data: companySettings } = useQuery({
    queryKey: ['settings', 'company'],
    queryFn: async (): Promise<CompanySettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        name: 'Mahakal Aqua',
        email: 'info@mahakalaqua.com',
        phone: '+91 98765 43210',
        address: '123 Water Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        website: 'https://mahakalaqua.com',
        logo: '/logo.png',
        description: 'Leading water purification solutions provider',
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '14:00', closed: false }
        }
      };
    }
  });

  const { data: notificationSettings } = useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: async (): Promise<NotificationSettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        emailNotifications: {
          newOrders: true,
          lowStock: true,
          customerMessages: true,
          systemUpdates: false
        },
        smsNotifications: {
          urgentAlerts: true,
          orderUpdates: false
        },
        pushNotifications: {
          enabled: true,
          orderAlerts: true,
          systemAlerts: true
        }
      };
    }
  });

  const { data: securitySettings } = useQuery({
    queryKey: ['settings', 'security'],
    queryFn: async (): Promise<SecuritySettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false
        },
        loginAttempts: 5,
        ipWhitelist: []
      };
    }
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['settings', 'payment'],
    queryFn: async (): Promise<PaymentSettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        razorpayEnabled: true,
        razorpayKeyId: 'rzp_test_xxxxxxxxxx',
        razorpayKeySecret: '••••••••••••••••',
        paytmEnabled: false,
        paytmMerchantId: '',
        paytmMerchantKey: '',
        codEnabled: true,
        codCharges: 50,
        minimumOrderAmount: 500
      };
    }
  });

  const { data: shippingSettings } = useQuery({
    queryKey: ['settings', 'shipping'],
    queryFn: async (): Promise<ShippingSettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        freeShippingThreshold: 2000,
        standardShippingRate: 100,
        expressShippingRate: 200,
        deliveryAreas: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'],
        estimatedDeliveryDays: {
          standard: 5,
          express: 2
        }
      };
    }
  });

  const { data: dataRetentionSettings } = useQuery({
    queryKey: ['settings', 'data-retention'],
    queryFn: async (): Promise<DataRetentionSettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        customerDataRetention: 2555, // 7 years
        orderDataRetention: 1825, // 5 years
        logDataRetention: 365, // 1 year
        automaticCleanup: true,
        backupBeforeCleanup: true,
        gdprCompliance: true
      };
    }
  });

  const { data: privacyPolicySettings } = useQuery({
    queryKey: ['settings', 'privacy-policy'],
    queryFn: async (): Promise<PrivacyPolicySettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        lastUpdated: '2024-01-15',
        version: '2.1',
        content: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information...',
        cookiePolicy: 'We use cookies to enhance your experience and analyze site usage...',
        dataProcessingPurpose: 'We process your data to provide services, improve user experience, and comply with legal obligations.',
        thirdPartySharing: false,
        userRights: ['Access', 'Rectification', 'Erasure', 'Portability', 'Objection']
      };
    }
  });

  const { data: termsOfServiceSettings } = useQuery({
    queryKey: ['settings', 'terms-of-service'],
    queryFn: async (): Promise<TermsOfServiceSettings> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        lastUpdated: '2024-01-15',
        version: '1.5',
        content: 'By using our services, you agree to these terms and conditions...',
        acceptanceRequired: true,
        minimumAge: 18,
        governingLaw: 'Laws of India',
        disputeResolution: 'Arbitration in Mumbai, India'
      };
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      await api.put(`/settings/${section}`, data);
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.section} settings updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['settings', variables.section] });
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const handleSaveSettings = (section: string, data: any) => {
    updateSettingsMutation.mutate({ section, data });
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'data-retention', label: 'Data Retention', icon: Calendar },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms-of-service', label: 'Terms of Service', icon: FileText },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Database }
  ];

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              defaultValue={companySettings?.name}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={companySettings?.email}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              defaultValue={companySettings?.phone}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              defaultValue={companySettings?.website}
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              defaultValue={companySettings?.address}
              rows={3}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              defaultValue={companySettings?.city}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              defaultValue={companySettings?.state}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode
            </label>
            <input
              type="text"
              defaultValue={companySettings?.pincode}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
        <div className="space-y-4">
          {companySettings && Object.entries(companySettings.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {day}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-500">Open</span>
              </div>
              {!hours.closed && (
                <>
                  <input
                    type="time"
                    defaultValue={hours.open}
                    className="input w-32"
                  />
                  <span className="text-sm text-gray-500">to</span>
                  <input
                    type="time"
                    defaultValue={hours.close}
                    className="input w-32"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('company', companySettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {notificationSettings && Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked={value}
                className="rounded border-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          {notificationSettings && Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked={value}
                className="rounded border-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {notificationSettings && Object.entries(notificationSettings.pushNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked={value}
                className="rounded border-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('notifications', notificationSettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={securitySettings?.twoFactorAuth}
              className="rounded border-gray-300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              defaultValue={securitySettings?.sessionTimeout}
              className="input w-32"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              defaultValue={securitySettings?.loginAttempts}
              className="input w-32"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              defaultValue={securitySettings?.passwordPolicy.minLength}
              className="input w-32"
            />
          </div>
          
          {securitySettings && Object.entries(securitySettings.passwordPolicy)
            .filter(([key]) => key !== 'minLength')
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  defaultChecked={value as boolean}
                  className="rounded border-gray-300"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('security', securitySettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Gateways</h3>
        
        <div className="space-y-6">
          {/* Razorpay */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="/razorpay-logo.png" alt="Razorpay" className="h-8 w-auto mr-3" />
                <span className="text-sm font-medium text-gray-700">Razorpay</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={paymentSettings?.razorpayEnabled}
                className="rounded border-gray-300"
              />
            </div>
            
            {paymentSettings?.razorpayEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key ID
                  </label>
                  <input
                    type="text"
                    defaultValue={paymentSettings.razorpayKeyId}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      defaultValue={paymentSettings.razorpayKeySecret}
                      className="input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cash on Delivery */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Cash on Delivery</span>
              <input
                type="checkbox"
                defaultChecked={paymentSettings?.codEnabled}
                className="rounded border-gray-300"
              />
            </div>
            
            {paymentSettings?.codEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    COD Charges (₹)
                  </label>
                  <input
                    type="number"
                    defaultValue={paymentSettings.codCharges}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    defaultValue={paymentSettings.minimumOrderAmount}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('payment', paymentSettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              defaultValue={shippingSettings?.freeShippingThreshold}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Shipping Rate (₹)
            </label>
            <input
              type="number"
              defaultValue={shippingSettings?.standardShippingRate}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Express Shipping Rate (₹)
            </label>
            <input
              type="number"
              defaultValue={shippingSettings?.expressShippingRate}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Estimates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Delivery (days)
            </label>
            <input
              type="number"
              defaultValue={shippingSettings?.estimatedDeliveryDays.standard}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Express Delivery (days)
            </label>
            <input
              type="number"
              defaultValue={shippingSettings?.estimatedDeliveryDays.express}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Areas</h3>
        <div className="space-y-2">
          {shippingSettings?.deliveryAreas.map((area, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                defaultValue={area}
                className="input flex-1"
              />
              <button className="btn-secondary">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button className="btn-secondary">
            Add Area
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('shipping', shippingSettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderDataRetentionSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Retention Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Data Retention (days)
            </label>
            <input
              type="number"
              defaultValue={dataRetentionSettings?.customerDataRetention}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 2555 days (7 years)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Data Retention (days)
            </label>
            <input
              type="number"
              defaultValue={dataRetentionSettings?.orderDataRetention}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1825 days (5 years)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Data Retention (days)
            </label>
            <input
              type="number"
              defaultValue={dataRetentionSettings?.logDataRetention}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 365 days (1 year)</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cleanup Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Automatic Cleanup</span>
              <p className="text-sm text-gray-500">Automatically delete data after retention period</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={dataRetentionSettings?.automaticCleanup}
              className="rounded border-gray-300"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Backup Before Cleanup</span>
              <p className="text-sm text-gray-500">Create backup before deleting data</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={dataRetentionSettings?.backupBeforeCleanup}
              className="rounded border-gray-300"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">GDPR Compliance</span>
              <p className="text-sm text-gray-500">Enable GDPR compliance features</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={dataRetentionSettings?.gdprCompliance}
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('data-retention', dataRetentionSettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderPrivacyPolicySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              defaultValue={privacyPolicySettings?.version}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Updated
            </label>
            <input
              type="date"
              defaultValue={privacyPolicySettings?.lastUpdated}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Policy Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Content
            </label>
            <textarea
              defaultValue={privacyPolicySettings?.content}
              rows={6}
              className="input"
              placeholder="Enter your privacy policy content..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cookie Policy
            </label>
            <textarea
              defaultValue={privacyPolicySettings?.cookiePolicy}
              rows={3}
              className="input"
              placeholder="Enter your cookie policy..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Processing Purpose
            </label>
            <textarea
              defaultValue={privacyPolicySettings?.dataProcessingPurpose}
              rows={3}
              className="input"
              placeholder="Explain why you process user data..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Rights</h3>
        <div className="space-y-2">
          {privacyPolicySettings?.userRights.map((right, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                defaultValue={right}
                className="input flex-1"
              />
              <button className="btn-secondary">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button className="btn-secondary">
            Add User Right
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">Third Party Data Sharing</span>
          <p className="text-sm text-gray-500">Allow sharing data with third parties</p>
        </div>
        <input
          type="checkbox"
          defaultChecked={privacyPolicySettings?.thirdPartySharing}
          className="rounded border-gray-300"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('privacy-policy', privacyPolicySettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderTermsOfServiceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Terms Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              defaultValue={termsOfServiceSettings?.version}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Updated
            </label>
            <input
              type="date"
              defaultValue={termsOfServiceSettings?.lastUpdated}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Age
            </label>
            <input
              type="number"
              defaultValue={termsOfServiceSettings?.minimumAge}
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Terms Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms of Service
            </label>
            <textarea
              defaultValue={termsOfServiceSettings?.content}
              rows={8}
              className="input"
              placeholder="Enter your terms of service content..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Governing Law
            </label>
            <input
              type="text"
              defaultValue={termsOfServiceSettings?.governingLaw}
              className="input"
              placeholder="e.g., Laws of India"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispute Resolution
            </label>
            <input
              type="text"
              defaultValue={termsOfServiceSettings?.disputeResolution}
              className="input"
              placeholder="e.g., Arbitration in Mumbai, India"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">Acceptance Required</span>
          <p className="text-sm text-gray-500">Require users to accept terms before using service</p>
        </div>
        <input
          type="checkbox"
          defaultChecked={termsOfServiceSettings?.acceptanceRequired}
          className="rounded border-gray-300"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings('terms-of-service', termsOfServiceSettings)}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 border-2 rounded-lg ${
                theme === 'light' ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              <div className="w-16 h-12 bg-white border border-gray-200 rounded mb-2"></div>
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 border-2 rounded-lg ${
                theme === 'dark' ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              <div className="w-16 h-12 bg-gray-800 border border-gray-600 rounded mb-2"></div>
              <span className="text-sm font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 border-2 rounded-lg ${
                theme === 'system' ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              <div className="w-16 h-12 bg-gradient-to-r from-white to-gray-800 border border-gray-400 rounded mb-2"></div>
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database</h3>
        <div className="space-y-4">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Backup Database
          </button>
          <button className="btn-secondary">
            <Upload className="h-4 w-4 mr-2" />
            Restore Database
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cache</h3>
        <div className="space-y-4">
          <button className="btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Cache
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Reset Application</h4>
              <p className="text-sm text-red-700 mt-1">
                This will reset all settings to default values. This action cannot be undone.
              </p>
              <button className="mt-3 btn-danger">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Settings - Admin Dashboard</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your application configuration and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card">
              <div className="card-content">
                {activeTab === 'company' && renderCompanySettings()}
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'security' && renderSecuritySettings()}
                {activeTab === 'payment' && renderPaymentSettings()}
                {activeTab === 'shipping' && renderShippingSettings()}
                {activeTab === 'data-retention' && renderDataRetentionSettings()}
                {activeTab === 'privacy-policy' && renderPrivacyPolicySettings()}
                {activeTab === 'terms-of-service' && renderTermsOfServiceSettings()}
                {activeTab === 'appearance' && renderAppearanceSettings()}
                {activeTab === 'system' && renderSystemSettings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}