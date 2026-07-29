import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Lock, KeyRound, Sparkles } from 'lucide-react';
import emblemPng from '../assets/emblem.png';

export function Login() {
  const [loginMode, setLoginMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate('/apply');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setValue('identifier', '9876543210');
    setValue('password', 'demo1234');
    showToast('Demo credentials loaded! Click Sign In to continue.', 'info');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotModalOpen(false);
    showToast(`Password reset link sent to ${forgotEmail || 'your email'}`, 'success');
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
          Applicant Portal Login
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          Thirumalai Engineering College, Kanchipuram (Code: 1517)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">

          {/* Login mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setLoginMode('PASSWORD')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                loginMode === 'PASSWORD'
                  ? 'bg-white text-tec-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => setLoginMode('OTP')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                loginMode === 'OTP'
                  ? 'bg-white text-tec-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="mb-5 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
              <Sparkles className="w-4 h-4 text-tec-gold" />
              <span>Quick Test Access</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs font-bold text-tec-navy hover:underline bg-white px-2.5 py-1 rounded border border-blue-200 shadow-2xs"
            >
              Auto-fill Demo Credentials
            </button>
          </div>

          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
            
            <Input
              label="Registered Mobile / Email"
              placeholder="e.g. 9876543210 or email@domain.com"
              icon={User}
              required
              error={errors.identifier}
              {...register('identifier')}
            />

            {loginMode === 'PASSWORD' ? (
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  icon={Lock}
                  required
                  error={errors.password}
                  {...register('password')}
                />
                <div className="mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs font-semibold text-tec-navy hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Input
                  label="Enter 6-Digit OTP"
                  type="text"
                  placeholder="123456"
                  icon={KeyRound}
                  required
                  helperText="Demo OTP is 123456"
                  error={errors.password}
                  {...register('password')}
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full text-base font-extrabold py-3 shadow-md"
              >
                Sign In to Portal
              </Button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-600">
              Don't have an applicant account?{' '}
              <Link to="/register" className="font-bold text-tec-gold hover:underline">
                Register New Application
              </Link>
            </div>

          </form>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-600">
              Enter your registered mobile or email address. We will send you instructions to reset your password.
            </p>
            <Input
              label="Email or Mobile"
              placeholder="Registered email or mobile"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setForgotModalOpen(false)}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleForgotSubmit}
                className="w-1/2 font-bold"
              >
                Send Link
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
