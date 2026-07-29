import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../utils/validation';
import { registerUser, sendOtp, verifyOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, User, Phone, Mail, Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import emblemPng from '../assets/emblem.png';

export function Register() {
  const [step, setStep] = useState('FORM'); // 'FORM' | 'OTP'
  const [otpVal, setOtpVal] = useState('123456');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  const { showToast, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onRegisterSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await registerUser(data);
      await sendOtp(data.mobile);
      setRegisteredData(res.user || data);
      setStep('OTP');
      showToast('Registration details saved! Please verify OTP.', 'info');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otpVal || otpVal.length !== 6) {
      setOtpError('Please enter a 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(registeredData?.mobile || '9876543210', otpVal);
      setUser(registeredData);
      showToast('Account created & mobile verified successfully!', 'success');
      navigate('/apply');
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src={emblemPng}
          alt="TEC Logo"
          className="mx-auto h-16 w-auto object-contain"
        />
        <h2 className="mt-4 text-2xl font-extrabold text-tec-navy">
          Create Applicant Account
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          Thirumalai Engineering College Online Application Portal 2026-27
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          
          {step === 'FORM' ? (
            <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
              
              <Input
                label="Full Name (as per 10th Marksheet)"
                placeholder="e.g. Karthik Raja S"
                icon={User}
                required
                error={errors.fullName}
                {...register('fullName')}
              />

              <Input
                label="Mobile Number"
                type="tel"
                placeholder="10-digit mobile number"
                icon={Phone}
                required
                helperText="OTP verification code will be sent to this number"
                error={errors.mobile}
                {...register('mobile')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon={Mail}
                required
                error={errors.email}
                {...register('email')}
              />

              <Input
                label="Create Password"
                type="password"
                placeholder="Min 6 characters"
                icon={Lock}
                required
                error={errors.password}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon={Lock}
                required
                error={errors.confirmPassword}
                {...register('confirmPassword')}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  isLoading={isSubmitting}
                  className="w-full text-base font-extrabold py-3 shadow-md"
                >
                  Register & Verify OTP
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-tec-navy hover:underline">
                  Log in here
                </Link>
              </div>

            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-5 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Verify Mobile OTP</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Enter the 6-digit OTP code sent to{' '}
                  <span className="font-bold text-slate-800">+91 {registeredData?.mobile}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold">
                💡 Demo Mode Hint: Use OTP <span className="underline font-extrabold">123456</span> to proceed.
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpVal}
                  onChange={(e) => setOtpVal(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tec-navy focus:outline-none"
                  placeholder="123456"
                />
                {otpError && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">⚠️ {otpError}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full py-3 font-bold"
              >
                Verify & Continue to Application
              </Button>

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                ← Back to registration form
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
