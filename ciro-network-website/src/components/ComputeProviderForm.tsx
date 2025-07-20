'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle, Plus, Minus } from 'lucide-react';

interface ComputeProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  title: string;
  computeType: string[];
  totalCapacity: string;
  availableCapacity: string;
  location: string;
  dataCenterTier: string;
  networkBandwidth: string;
  uptimeSla: string;
  securityCertifications: string[];
  complianceStandards: string[];
  yearsInOperation: string;
  previousClients: string;
  pricingModel: string;
  pricingRange: string;
  minimumCommitment: string;
  apiCapabilities: string[];
  containerSupport: boolean;
  kubernetesSupport: boolean;
  dockerSupport: boolean;
  customImageSupport: boolean;
  monitoringTools: string[];
  managementInterface: string;
  supportLevel: string;
  insuranceCoverage: string;
  liabilityLimits: string;
  contractFlexibility: string;
  paymentTerms: string;
  hardwareSpecs: string;
}

const ComputeProviderForm: React.FC<ComputeProviderFormProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    title: '',
    computeType: [],
    totalCapacity: '',
    availableCapacity: '',
    location: '',
    dataCenterTier: '',
    networkBandwidth: '',
    uptimeSla: '',
    securityCertifications: [],
    complianceStandards: [],
    yearsInOperation: '',
    previousClients: '',
    pricingModel: '',
    pricingRange: '',
    minimumCommitment: '',
    apiCapabilities: [],
    containerSupport: false,
    kubernetesSupport: false,
    dockerSupport: false,
    customImageSupport: false,
    monitoringTools: [],
    managementInterface: '',
    supportLevel: '',
    insuranceCoverage: '',
    liabilityLimits: '',
    contractFlexibility: '',
    paymentTerms: '',
    hardwareSpecs: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const computeTypeOptions = ['gpu', 'cpu', 'tpu', 'edge'];
  const securityCertOptions = ['SOC2', 'ISO27001', 'FedRAMP', 'PCI-DSS', 'CSA-STAR'];
  const complianceOptions = ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'CCPA'];
  const apiCapabilityOptions = ['REST API', 'GraphQL', 'gRPC', 'WebSocket', 'Webhook'];
  const monitoringToolOptions = ['Prometheus', 'Grafana', 'DataDog', 'New Relic', 'Custom'];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (formData.computeType.length === 0) newErrors.computeType = 'At least one compute type is required';
    if (!formData.totalCapacity.trim()) newErrors.totalCapacity = 'Total capacity is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const analytics = {
        country: '',
        referrer: document.referrer,
        userAgent: navigator.userAgent
      };

      // Parse hardware specs as JSON if provided
      let hardwareSpecs = null;
      if (formData.hardwareSpecs.trim()) {
        try {
          hardwareSpecs = JSON.parse(formData.hardwareSpecs);
        } catch {
          // If not valid JSON, store as text description
          hardwareSpecs = { description: formData.hardwareSpecs };
        }
      }

      const submissionData = {
        ...formData,
        uptimeSla: formData.uptimeSla ? parseFloat(formData.uptimeSla) : undefined,
        yearsInOperation: formData.yearsInOperation ? parseInt(formData.yearsInOperation) : undefined,
        hardwareSpecs,
        analytics
      };

      const response = await fetch('/api/compute-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
          // Reset form
          setFormData({
            name: '',
            email: '',
            company: '',
            title: '',
            computeType: [],
            totalCapacity: '',
            availableCapacity: '',
            location: '',
            dataCenterTier: '',
            networkBandwidth: '',
            uptimeSla: '',
            securityCertifications: [],
            complianceStandards: [],
            yearsInOperation: '',
            previousClients: '',
            pricingModel: '',
            pricingRange: '',
            minimumCommitment: '',
            apiCapabilities: [],
            containerSupport: false,
            kubernetesSupport: false,
            dockerSupport: false,
            customImageSupport: false,
            monitoringTools: [],
            managementInterface: '',
            supportLevel: '',
            insuranceCoverage: '',
            liabilityLimits: '',
            contractFlexibility: '',
            paymentTerms: '',
            hardwareSpecs: ''
          });
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting compute provider application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelect = (name: keyof FormData, value: string) => {
    const currentValues = formData[name] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setFormData(prev => ({ ...prev, [name]: newValues }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-green-500/30 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-green-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Compute Provider Application</h2>
              <p className="text-gray-400 mt-1">Join the CIRO Network as a compute provider</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your.email@company.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your company name"
                />
                {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your job title"
                />
              </div>
            </div>
          </div>

          {/* Technical Capabilities */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Technical Capabilities</h3>
            
            {/* Compute Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Compute Types * <span className="text-gray-500">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {computeTypeOptions.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleMultiSelect('computeType', type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.computeType.includes(type)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
              {errors.computeType && <p className="text-red-400 text-sm mt-1">{errors.computeType}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Capacity *</label>
                <input
                  type="text"
                  name="totalCapacity"
                  value={formData.totalCapacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 100 H100 GPUs, 50 CPU nodes"
                />
                {errors.totalCapacity && <p className="text-red-400 text-sm mt-1">{errors.totalCapacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Capacity</label>
                <input
                  type="text"
                  name="availableCapacity"
                  value={formData.availableCapacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Current available capacity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA, USA"
                />
                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Data Center Tier</label>
                <select
                  name="dataCenterTier"
                  value={formData.dataCenterTier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select tier</option>
                  <option value="tier-1">Tier 1</option>
                  <option value="tier-2">Tier 2</option>
                  <option value="tier-3">Tier 3</option>
                  <option value="tier-4">Tier 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network Bandwidth</label>
                <input
                  type="text"
                  name="networkBandwidth"
                  value={formData.networkBandwidth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 10 Gbps, 100 Gbps"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Uptime SLA (%)</label>
                <input
                  type="number"
                  name="uptimeSla"
                  value={formData.uptimeSla}
                  onChange={handleChange}
                  step="0.001"
                  min="90"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 99.95"
                />
              </div>
            </div>

            {/* Hardware Specifications */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hardware Specifications <span className="text-gray-500">(JSON format or description)</span>
              </label>
              <textarea
                name="hardwareSpecs"
                value={formData.hardwareSpecs}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder='{"gpu": {"model": "H100", "memory": "80GB", "count": 8}, "cpu": {"cores": 128, "memory": "1TB"}}'
              />
            </div>
          </div>

          {/* Security & Compliance */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Security & Compliance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Security Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {securityCertOptions.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleMultiSelect('securityCertifications', cert)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.securityCertifications.includes(cert)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Compliance Standards</label>
                <div className="flex flex-wrap gap-2">
                  {complianceOptions.map(standard => (
                    <button
                      key={standard}
                      type="button"
                      onClick={() => handleMultiSelect('complianceStandards', standard)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.complianceStandards.includes(standard)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {standard}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Years in Operation</label>
                <input
                  type="number"
                  name="yearsInOperation"
                  value={formData.yearsInOperation}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Support Level</label>
                <select
                  name="supportLevel"
                  value={formData.supportLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select support level</option>
                  <option value="basic">Basic</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="24x7">24x7</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Model</label>
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select pricing model</option>
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="spot">Spot</option>
                  <option value="reserved">Reserved</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Range</label>
                <input
                  type="text"
                  name="pricingRange"
                  value={formData.pricingRange}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., $2-5/hour, $500-2000/month"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Previous Clients</label>
                <textarea
                  name="previousClients"
                  value={formData.previousClients}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Brief description of notable clients or use cases (optional)"
                />
              </div>
            </div>
          </div>

          {/* Technical Integration */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Technical Integration</h3>
            
            {/* Support Checkboxes */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="containerSupport"
                  checked={formData.containerSupport}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-300">Container Support</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="kubernetesSupport"
                  checked={formData.kubernetesSupport}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-300">Kubernetes Support</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="dockerSupport"
                  checked={formData.dockerSupport}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-300">Docker Support</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="customImageSupport"
                  checked={formData.customImageSupport}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-300">Custom Image Support</span>
              </label>
            </div>

            {/* API Capabilities */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">API Capabilities</label>
              <div className="flex flex-wrap gap-2">
                {apiCapabilityOptions.map(api => (
                  <button
                    key={api}
                    type="button"
                    onClick={() => handleMultiSelect('apiCapabilities', api)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.apiCapabilities.includes(api)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {api}
                  </button>
                ))}
              </div>
            </div>

            {/* Monitoring Tools */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Monitoring Tools</label>
              <div className="flex flex-wrap gap-2">
                {monitoringToolOptions.map(tool => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => handleMultiSelect('monitoringTools', tool)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.monitoringTools.includes(tool)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors"
            >
              {submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Application Submitted!
                </>
              ) : submitStatus === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Try Again
                </>
              ) : isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComputeProviderForm; 