import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from '../services/api';
import { useAuth } from '../Context/AuthContext';
import { Input } from '../Components/common/Input';
import { Button } from '../Components/common/Button';
import { User, Phone, Mail, Lock } from 'lucide-react';
import { COLLEGE_CONFIG } from '../Config/collegeConfig';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, setUser, login } = useAuth();
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
      await registerUser({
        name: data.fullName,
        email: data.email,
        phone_number: data.mobile,
        password: data.password,
      });
      // Auto login to retrieve credentials token
      await login({
        identifier: data.email,
        password: data.password,
      });
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed';
      showToast(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full md:max-w-2xl lg:max-w-3xl text-center">
        <img
          src={COLLEGE_CONFIG.images.emblem}
          alt={`${COLLEGE_CONFIG.shortName} Logo`}
          className="mx-auto h-12 sm:h-14 w-auto object-contain"
        />
        <h2 className="mt-2 text-2xl font-extrabold text-tec-navy">
          Create Applicant Account
        </h2>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          {COLLEGE_CONFIG.portalSubheading}
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full md:max-w-2xl lg:max-w-3xl">
        <div className="bg-white py-5 sm:py-6 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
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
                error={errors.mobile}
                {...register('mobile')}
              />

              <div className="md:col-span-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  required
                  error={errors.email}
                  {...register('email')}
                />
              </div>

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
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="accent"
                isLoading={isSubmitting}
                className="w-full text-base font-extrabold py-3 shadow-md"
              >
                Create Account
              </Button>
            </div>

            <div className="mt-4 text-center text-xs text-slate-600">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-tec-navy hover:underline">
                Log in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

