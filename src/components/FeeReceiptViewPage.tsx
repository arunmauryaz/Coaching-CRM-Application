import { useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { useCRMData } from './hooks/useCRMData';

interface FeeReceiptViewPageProps {
  receiptId: string;
  onBack: () => void;
}

export default function FeeReceiptViewPage({ receiptId, onBack }: FeeReceiptViewPageProps) {
  const { receipts, receiptTemplate } = useCRMData();
  const printRef = useRef<HTMLDivElement>(null);

  const receipt = receipts.find(rec => rec.id === receiptId);

  if (!receipt) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Receipt not found</p>
        <Button onClick={onBack} className="mt-4">
          Back to Billing
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - No Print */}
      <div className="print:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Receipt Display */}
      <div ref={printRef} className="print-preview max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 my-8 print:my-0 shadow-lg print:shadow-none">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-preview, .print-preview * {
              visibility: visible;
            }
            .print-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              background: white !important;
            }
          }
        `}</style>

        {/* Receipt Layout Based on Template */}
        {receiptTemplate?.layout === 'centered' ? (
          // Centered Layout
          <>
            <div className="text-center mb-8 pb-4 border-b-2 border-gray-200">
              {receiptTemplate?.logo && (
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded overflow-hidden">
                    <img src={receiptTemplate.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <h1 className="text-3xl text-blue-900 mb-2">{receiptTemplate?.businessName || 'Coaching CRM'}</h1>
              {receiptTemplate?.address && (
                <p className="text-sm text-gray-600 mb-1">{receiptTemplate.address}</p>
              )}
              {receiptTemplate?.phone && (
                <p className="text-sm text-gray-600 mb-1">Phone: {receiptTemplate.phone}</p>
              )}
              {receiptTemplate?.email && (
                <p className="text-sm text-gray-600">Email: {receiptTemplate.email}</p>
              )}
            </div>

            <h2 className="text-2xl text-center mb-8">Fee Receipt</h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Receipt No.</p>
                <p className="text-lg">{receipt.receiptNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg">
                  {new Date(receipt.date).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </>
        ) : (
          // Left-aligned Layout (Default)
          <>
            <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <div className="flex items-start gap-4">
                {receiptTemplate?.logo && (
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img src={receiptTemplate.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                {!receiptTemplate?.logo && (
                  <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {(receiptTemplate?.businessName || 'CRM')[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl text-blue-900 mb-1">{receiptTemplate?.businessName || 'Coaching CRM'}</h2>
                  {receiptTemplate?.address && (
                    <p className="text-sm text-gray-600">{receiptTemplate.address}</p>
                  )}
                  {receiptTemplate?.phone && (
                    <p className="text-sm text-gray-600">Phone: {receiptTemplate.phone}</p>
                  )}
                  {receiptTemplate?.email && (
                    <p className="text-sm text-gray-600">Email: {receiptTemplate.email}</p>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-2xl mb-8">Fee Receipt</h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receipt No.</p>
                <p className="text-lg">{receipt.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg">
                  {new Date(receipt.date).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Student Details - Same for both layouts */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h4 className="text-sm text-gray-600 mb-3">Student Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg">{receipt.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="text-lg">{receipt.studentRoll}</p>
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 text-gray-600">Description</th>
              <th className="text-right py-3 text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3">
                <div>
                  <p className="font-medium">Batch: {receipt.batchName}</p>
                  <p className="text-sm text-gray-600">Total Batch Fee</p>
                </div>
              </td>
              <td className="text-right py-3">₹ {receipt.batchPrice.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-3">Amount Paid</td>
              <td className="text-right py-3 text-green-600">₹ {receipt.amountPaid.toFixed(2)}</td>
            </tr>
            <tr className="border-b-2 border-gray-300">
              <td className="py-3 font-medium">Due Amount</td>
              <td className="text-right py-3 font-medium text-red-600">₹ {receipt.dueAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {receipt.notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h4 className="text-sm text-gray-600 mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{receipt.notes}</p>
          </div>
        )}

        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your payment!</p>
        </div>
      </div>
    </div>
  );
}
