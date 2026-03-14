import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useCRMData } from './hooks/useCRMData';
import { toast } from 'sonner@2.0.3';

interface ReceiptTemplateSettingsProps {
  onBack: () => void;
}

export default function ReceiptTemplateSettings({ onBack }: ReceiptTemplateSettingsProps) {
  const { receiptTemplate, updateReceiptTemplate } = useCRMData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    businessName: receiptTemplate?.businessName || localStorage.getItem('crm_org_name') || 'Coaching CRM',
    address: receiptTemplate?.address || '',
    phone: receiptTemplate?.phone || '',
    email: receiptTemplate?.email || '',
    logo: receiptTemplate?.logo || '',
    layout: receiptTemplate?.layout || 'left-aligned' as 'left-aligned' | 'centered',
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({ ...formData, logo: result });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    updateReceiptTemplate(formData);
    toast.success('Receipt template updated successfully');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
          <Button onClick={handleSave}>
            Save Template
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">Receipt Template Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your receipt template with your business information and layout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  This information will appear on all your receipts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>Business Logo (Optional)</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Upload your business logo (max 2MB, PNG/JPG)
                  </p>
                  
                  {formData.logo ? (
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                        <img 
                          src={formData.logo} 
                          alt="Business Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={removeLogo}>
                        <X className="w-4 h-4 mr-2" />
                        Remove Logo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    </>
                  )}
                </div>

                {/* Business Name */}
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Enter your business name"
                  />
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your complete business address"
                    rows={3}
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +91 9876543210"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., contact@yourbusiness.com"
                  />
                </div>

                {/* Template Layout */}
                <div>
                  <Label>Template Layout</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Choose how your receipt header should be displayed
                  </p>
                  <RadioGroup 
                    value={formData.layout} 
                    onValueChange={(value: 'left-aligned' | 'centered') => setFormData({ ...formData, layout: value })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="left-aligned" id="left-aligned" />
                      <Label htmlFor="left-aligned" className="cursor-pointer">
                        Left-Aligned (Professional)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="centered" id="centered" />
                      <Label htmlFor="centered" className="cursor-pointer">
                        Centered (Modern)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Panel */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your receipt will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 min-h-[600px]">
                  {/* Preview Based on Layout */}
                  {formData.layout === 'centered' ? (
                    // Centered Layout Preview
                    <>
                      <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
                        {formData.logo ? (
                          <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 rounded overflow-hidden">
                              <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center">
                              <span className="text-white text-xl">
                                {formData.businessName[0] || 'B'}
                              </span>
                            </div>
                          </div>
                        )}
                        <h2 className="text-2xl text-blue-900 dark:text-blue-400 mb-2">
                          {formData.businessName || 'Business Name'}
                        </h2>
                        {formData.address && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{formData.address}</p>
                        )}
                        {formData.phone && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Phone: {formData.phone}</p>
                        )}
                        {formData.email && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">Email: {formData.email}</p>
                        )}
                      </div>
                      <h3 className="text-xl text-center mb-6">Fee Receipt</h3>
                    </>
                  ) : (
                    // Left-aligned Layout Preview
                    <>
                      <div className="flex items-start gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                        {formData.logo ? (
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg">
                              {formData.businessName[0] || 'B'}
                            </span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl text-blue-900 dark:text-blue-400 mb-1">
                            {formData.businessName || 'Business Name'}
                          </h2>
                          {formData.address && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">{formData.address}</p>
                          )}
                          {formData.phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">Phone: {formData.phone}</p>
                          )}
                          {formData.email && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">Email: {formData.email}</p>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl mb-6">Fee Receipt</h3>
                    </>
                  )}

                  {/* Sample Receipt Content */}
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Receipt No.</p>
                        <p className="text-gray-900 dark:text-gray-100">REC-1001</p>
                      </div>
                      <div className={formData.layout === 'centered' ? 'text-center' : 'text-right'}>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="text-gray-900 dark:text-gray-100">20 Oct 2025</p>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Student Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                          <p className="text-gray-900 dark:text-gray-100">John Doe</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Roll Number</p>
                          <p className="text-gray-900 dark:text-gray-100">101</p>
                        </div>
                      </div>
                    </div>

                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Description</th>
                          <th className="text-right py-2 text-gray-600 dark:text-gray-400">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2">
                            <p className="font-medium">Batch: Python Basics</p>
                            <p className="text-gray-500 dark:text-gray-400">Total Batch Fee</p>
                          </td>
                          <td className="text-right">₹ 10,000.00</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2">Amount Paid</td>
                          <td className="text-right text-green-600">₹ 5,000.00</td>
                        </tr>
                        <tr className="border-b-2 border-gray-300">
                          <td className="py-2 font-medium">Due Amount</td>
                          <td className="text-right font-medium text-red-600">₹ 5,000.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-8 pt-3 border-t border-gray-200 text-center text-xs text-gray-500 dark:text-gray-400">
                      <p>Thank you for your payment!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
