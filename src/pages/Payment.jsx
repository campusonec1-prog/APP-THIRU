import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initiatePayment } from '../Api';
import { Button } from '../components/common/Button';
import { ShieldCheck, CreditCard, QrCode, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import emblemPng from '../assets/emblem.png';

export function Payment() {
  const { user, application, refreshApplicationStatus, showToast } = useAuth();
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState('user@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshApplicationStatus();
  }, [refreshApplicationStatus]);

  const appId = application?.application_no || application?.applicationNo || application?.applicationId || 'UG260001';

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      const res = await initiatePayment(appId);
      await refreshApplicationStatus();
      setIsSuccess(true);
      showToast('Payment of ₹500 successfully completed!', 'success');
    } catch (err) {
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <img src={emblemPng} alt="TEC Emblem" className="h-14 w-auto mx-auto mb-2" />
          <h2 className="text-2xl font-extrabold text-tec-navy">Application Fee Payment</h2>
          <p className="text-xs text-slate-600">Thirumalai Engineering College Admissions 2026-27</p>
        </div>

        {!isSuccess ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6">
            
            {/* Fee Breakdown */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Application Reference:</span>
                <span className="font-bold text-slate-800">{appId}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Application Processing Fee:</span>
                <span className="font-bold text-slate-800">₹500.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>GST (Inclusive):</span>
                <span className="font-bold text-slate-800">₹0.00</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-tec-navy">
                <span>Total Amount Payable:</span>
                <span className="text-tec-gold text-xl font-black">₹500.00</span>
              </div>
            </div>

            {/* Payment Method Selectors */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Payment Gateway Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    method === 'UPI'
                      ? 'border-tec-navy bg-tec-navy text-white shadow-xs'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    method === 'CARD'
                      ? 'border-tec-navy bg-tec-navy text-white shadow-xs'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Debit/Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('NETBANKING')}
                  className={`p-3 rounded-lg border text-xs font-bold transition flex flex-col items-center gap-1 ${
                    method === 'NETBANKING'
                      ? 'border-tec-navy bg-tec-navy text-white shadow-xs'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span>Netbanking</span>
                </button>
              </div>

              {method === 'UPI' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-tec-navy focus:outline-none"
                    placeholder="mobile@upi or user@okicici"
                  />
                </div>
              )}
            </div>

            {/* Pay Now Trigger */}
            <Button
              variant="accent"
              isLoading={isProcessing}
              onClick={handlePayNow}
              className="w-full py-3 text-base font-extrabold shadow-lg"
            >
              <span>Pay ₹500 & Complete Application</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted Mock Gateway</span>
            </p>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-600">
              Transaction ID: <span className="font-mono font-bold text-slate-800">TXN_TEC_{Date.now()}</span>
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg">
              ₹500.00 application fee received for Application {appId}
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/profile')}
              className="w-full py-3 font-bold"
            >
              View Updated Application PDF Status
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
