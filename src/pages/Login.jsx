import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../Context/AuthContext';
import { Input } from '../Components/common/Input';
import { Button } from '../Components/common/Button';
import { User, Lock } from 'lucide-react';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter mobile number or email'),
  password: z.string().min(1, 'Password is required'),
});

export function Login() {
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, showToast } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
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
      showToast('Login successful!', 'success');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      showToast(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotModalOpen(false);
    showToast(`Password reset request sent for ${forgotEmail || 'your email'}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img
          src={COLLEGE_CONFIG.images.emblem}
          alt={`${COLLEGE_CONFIG.shortName} Logo`}
          className="mx-auto h-12 sm:h-14 w-auto object-contain"
        />
        <h2 className="mt-2 text-2xl font-extrabold text-tec-navy">
          {COLLEGE_CONFIG.portalTitle} Login
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          {COLLEGE_CONFIG.loginSubheading}
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-5 sm:py-6 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">

          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
            
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. user@example.com"
              icon={User}
              required
              error={errors.identifier}
              {...register('identifier')}
            />

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
              Enter your registered email address. We will send you instructions to reset your password.
            </p>
            <Input
              label="Email Address"
              placeholder="Registered email"
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

