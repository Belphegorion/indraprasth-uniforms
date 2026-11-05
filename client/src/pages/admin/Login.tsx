import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, ArrowRight, ShieldAlert, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { adminLoginSchema } from '@indraprasth/shared';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: any) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await api.post('/admin/auth/login', values);
      if (res.data.success && res.data.data) {
        setAuth(res.data.data.user);
        toast.success(`Welcome back, ${res.data.data.user.name}!`);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || 'Login failed. Please check credentials.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center items-center p-4">
      <Helmet>
        <title>Admin Login | Indraprasth Uniforms Bhopal</title>
      </Helmet>

      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-serif italic text-sand-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Storefront</span>
        </Link>

        {/* Card */}
        <div className="bg-cream-50 rounded-xl p-8 sm:p-10 shadow-xl border border-sand-300 space-y-6 text-ink">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <img
                src="/logo.png"
                alt="Indraprasth Uniforms - The Uniform Icons Since 1975"
                className="h-16 w-auto object-contain"
                width="200"
                height="100"
              />
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy-800 tracking-tight">Staff Administration</h1>
            <p className="text-xs text-slate font-sans">
              Sign in with your staff or management credentials to oversee Bhopal store inventory and customer orders.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-crimson-100 border border-crimson-200 text-crimson-800 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-crimson-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="admin@indraprasth.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
                <Mail className="w-4 h-4 text-slate/70 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="text-xs text-crimson-600 font-medium">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Password</label>
              <div className="relative">
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Lock className="w-4 h-4 text-slate/70 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.password && (
                <p className="text-xs text-crimson-600 font-medium">{errors.password.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] py-3.5 px-6 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-serif font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all btn-tactile disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-cream-50" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-[11px] text-slate font-serif italic pt-2 border-t border-sand-300">
            Authorized staff access only • Bhopal Retail Stores
          </div>
        </div>
      </div>
    </div>
  );
};
