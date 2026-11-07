import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Phone,
  Store,
  Truck,
  Megaphone,
  KeyRound,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Video,
  Film,
  RotateCcw,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  useAdminSettings,
  useUpdateSettings,
  useUploadImage,
  useUploadVideo,
} from '../../api';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/auth';
import { settingUpdateSchema } from '@indraprasth/shared';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';
  const { data: settings, isLoading, refetch } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();
  const uploadImageMutation = useUploadImage();
  const uploadVideoMutation = useUploadVideo();

  const [activeTab, setActiveTab] = useState<'business' | 'hero' | 'branches' | 'delivery' | 'security'>('business');
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(settingUpdateSchema),
    defaultValues: {
      businessName: '',
      tagline: '',
      logoUrl: '',
      heroVideoUrl: '/new-video-hero.mp4',
      phones: ['+91 98260 25211'],
      email: '',
      whatsappNumber: '',
      address: '',
      branches: [] as any[],
      deliveryFee: 60,
      freeDeliveryAbove: 1500,
      announcementBar: {
        text: '',
        enabled: true,
        link: '',
      },
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
      gstin: '',
    },
  });

  const {
    fields: branchFields,
    append: appendBranch,
    remove: removeBranch,
  } = useFieldArray({
    control,
    name: 'branches',
  });

  const logoUrlValue = watch('logoUrl');
  const heroVideoUrlValue = watch('heroVideoUrl');

  useEffect(() => {
    if (settings) {
      reset({
        businessName: settings.businessName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl || '',
        heroVideoUrl: settings.heroVideoUrl || '/new-video-hero.mp4',
        phones: settings.phones || ['+91 98260 25211'],
        email: settings.email,
        whatsappNumber: settings.whatsappNumber,
        address: settings.address,
        branches: settings.branches || [],
        deliveryFee: settings.deliveryFee,
        freeDeliveryAbove: settings.freeDeliveryAbove,
        announcementBar: settings.announcementBar || {
          text: '',
          enabled: true,
          link: '',
        },
        socialLinks: settings.socialLinks || {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
        },
        gstin: settings.gstin || '',
      });
    }
  }, [settings, reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageMutation.mutateAsync(file);
      setValue('logoUrl', res.url, { shouldValidate: true, shouldDirty: true });
      toast.success('Brand logo uploaded successfully to Cloudinary');
    } catch (err: any) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size exceeds 50MB limit');
      return;
    }

    setIsVideoUploading(true);
    setVideoUploadProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    try {
      const res = await uploadVideoMutation.mutateAsync(file);
      setValue('heroVideoUrl', res.url, { shouldValidate: true, shouldDirty: true });
      toast.success('Hero background video uploaded! Click "Save Settings" or "Save & Apply Hero Video" to publish.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload video');
    } finally {
      setIsVideoUploading(false);
      setVideoUploadProgress('');
      e.target.value = '';
    }
  };

  const onSubmit = async (values: any) => {
    if (!isOwner) {
      toast.error('Forbidden: Store settings can only be saved by the store Owner.');
      return;
    }
    try {
      await updateSettingsMutation.mutateAsync(values);
      toast.success('Store settings saved successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.post('/admin/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-sand-200 rounded animate-pulse" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Helmet>
        <title>Store Settings | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 font-serif tracking-tight">
          Store Configuration
        </h1>
        <p className="text-xs sm:text-sm text-taupe-500 mt-1">
          Configure business profile, 4 Bhopal physical branches, delivery rates, and announcements.
        </p>
      </div>

      {!isOwner && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Staff Role Notice: </span>
            Store settings (business details, branches, and delivery fees) can only be updated by the store Owner. You can manage your own credentials under the Account Security tab.
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-sand-300 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'business'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-taupe-500 hover:text-navy-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'hero'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-taupe-500 hover:text-navy-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Hero Video Backdrop</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'branches'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-taupe-500 hover:text-navy-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Bhopal Branches ({branchFields.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'delivery'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-taupe-500 hover:text-navy-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery & Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-taupe-500 hover:text-navy-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Account Security</span>
        </button>
      </div>

      {/* Form Area */}
      {activeTab !== 'security' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* TAB 1: Business Profile */}
          {activeTab === 'business' && (
            <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-taupe-500">
                Brand & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">Business Name *</label>
                  <input
                    type="text"
                    {...register('businessName')}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 font-bold"
                  />
                  {errors.businessName && (
                    <p className="text-[11px] text-crimson-600">{errors.businessName.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">Tagline *</label>
                  <input
                    type="text"
                    {...register('tagline')}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 italic"
                  />
                  {errors.tagline && (
                    <p className="text-[11px] text-crimson-600">{errors.tagline.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">Support Email *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-crimson-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">
                    WhatsApp Hotline (International Format without +) *
                  </label>
                  <input
                    type="text"
                    {...register('whatsappNumber')}
                    placeholder="919826025211"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500 font-mono"
                  />
                  {errors.whatsappNumber && (
                    <p className="text-[11px] text-crimson-600">{errors.whatsappNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">GSTIN Registration</label>
                  <input
                    type="text"
                    {...register('gstin')}
                    placeholder="23AAAAA0000A1Z5"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500 font-mono uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">Primary Phone</label>
                  <input
                    type="text"
                    {...register('phones.0' as const)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-navy-800">HQ Physical Address *</label>
                  <textarea
                    rows={2}
                    {...register('address')}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 leading-relaxed"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="pt-4 border-t border-sand-200 space-y-2">
                <label className="text-xs font-bold text-navy-800">Brand Logo / Header Crest</label>
                <div className="flex items-center gap-4">
                  {logoUrlValue && (
                    <img
                      src={logoUrlValue}
                      alt="Store Logo"
                      className="w-16 h-16 rounded-2xl object-cover bg-cream-100 border border-sand-300 p-1"
                    />
                  )}
                  <div>
                    <label
                      htmlFor="settings-logo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-sand-200 hover:bg-sand-300 text-navy-800 text-xs font-bold transition-colors focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2"
                    >
                      <Upload className="w-4 h-4 text-taupe-500" aria-hidden="true" />
                      <span>{isUploading ? 'Uploading to Cloudinary...' : 'Change Store Logo'}</span>
                      <input
                        id="settings-logo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-[10px] text-taupe-500 mt-1">
                      PNG or SVG format with transparent background recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero Video Quick Summary & Link to Tab */}
              <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sand-100/60 p-4 rounded-2xl border border-sand-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-navy-800">Storefront Hero Video Backdrop</h3>
                    <p className="text-[11px] text-taupe-500 font-mono truncate max-w-xs sm:max-w-md">
                      Current: {heroVideoUrlValue || '/new-video-hero.mp4'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('hero')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold transition-colors shadow-sm shrink-0 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <Film className="w-4 h-4" aria-hidden="true" />
                  <span>Configure Video & Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: Hero Video Management */}
          {activeTab === 'hero' && (
            <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-taupe-500">
                    Storefront Hero Video Backdrop
                  </h2>
                  <p className="text-xs text-taupe-500 mt-0.5">
                    Controls the ambient background video playing across the homepage hero banner.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue('heroVideoUrl', '/new-video-hero.mp4', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-sand-200 hover:bg-sand-300 text-navy-800 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                    title="Restore the new-video-hero.mp4 default"
                    aria-label="Reset hero video to default /new-video-hero.mp4"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-taupe-500" aria-hidden="true" />
                    <span>Reset to Default</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !isOwner}
                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
                    aria-label="Save and apply hero video"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>{isSubmitting ? 'Saving...' : 'Save & Apply Video'}</span>
                  </button>
                </div>
              </div>

              {/* Unsaved changes notice banner */}
              {isDirty && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>
                      You have unsaved video changes. Click <strong>Save & Apply Video</strong> to publish them to the live storefront.
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isOwner}
                    className="px-3 py-1.5 min-h-[36px] bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Save Now
                  </button>
                </div>
              )}

              {/* Live Video Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="hero-video-url-input" className="text-xs font-bold text-navy-800 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span>Live Hero Video Preview</span>
                  </label>
                  <span className="text-[11px] font-mono text-taupe-500 truncate max-w-xs sm:max-w-md">
                    {heroVideoUrlValue || '/new-video-hero.mp4'}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-sand-300 shadow-inner aspect-[16/9] max-h-80 sm:max-h-96 w-full flex items-center justify-center group dark">
                  <video
                    key={heroVideoUrlValue || '/new-video-hero.mp4'}
                    src={heroVideoUrlValue || '/new-video-hero.mp4'}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    title="Live hero video backdrop preview"
                    aria-label="Live hero video backdrop preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Scrim preview overlay note */}
                  <div className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur-sm border border-sand-300/20 text-cream-100 text-[10px] font-mono px-2.5 py-1 rounded-full pointer-events-none">
                    Ambient Preview Mode • Muted Autoplay
                  </div>
                </div>
              </div>

              {/* Video URL Input & Upload Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label htmlFor="hero-video-url-input" className="text-xs font-bold text-navy-800">
                    Hero Video URL or Static Path *
                  </label>
                  <input
                    id="hero-video-url-input"
                    type="text"
                    {...register('heroVideoUrl')}
                    placeholder="/new-video-hero.mp4 or https://res.cloudinary.com/..."
                    className="w-full text-xs px-3 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 font-mono"
                  />
                  {errors.heroVideoUrl && (
                    <p className="text-[11px] text-crimson-600">
                      {errors.heroVideoUrl.message as string}
                    </p>
                  )}
                  <p className="text-[11px] text-taupe-500">
                    Enter a relative path (e.g.{' '}
                    <code className="bg-sand-200 px-1 py-0.5 rounded text-navy-800 font-mono">
                      /new-video-hero.mp4
                    </code>
                    ) or an external Cloudinary / CDN URL.
                  </p>
                </div>

                {/* File Upload Box */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-navy-800 block">
                    Upload Video File (MP4 / WebM up to 50MB)
                  </span>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="hero-video-file-upload"
                      className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 ${
                        isVideoUploading ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4" aria-hidden="true" />
                      <span>{isVideoUploading ? 'Uploading Video...' : 'Choose & Upload Video'}</span>
                      <input
                        id="hero-video-file-upload"
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        className="sr-only"
                        onChange={handleVideoUpload}
                        disabled={isVideoUploading}
                      />
                    </label>
                  </div>
                  {videoUploadProgress && (
                    <p className="text-[11px] text-blue-600 font-medium animate-pulse mt-1">
                      {videoUploadProgress}
                    </p>
                  )}
                  <p className="text-[11px] text-taupe-500">
                    High-definition H.264/MP4 or WebM video recommended. Aspect ratio 16:9 or wider.
                  </p>
                </div>
              </div>

              {/* Preset Quick Selectors */}
              <div className="pt-3 border-t border-sand-200">
                <span className="text-[11px] font-bold text-navy-800 uppercase tracking-wider block mb-2">
                  Available Local Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue('heroVideoUrl', '/new-video-hero.mp4', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    aria-pressed={heroVideoUrlValue === '/new-video-hero.mp4' || !heroVideoUrlValue}
                    className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-medium transition-colors border focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                      heroVideoUrlValue === '/new-video-hero.mp4' || !heroVideoUrlValue
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-white border-sand-300 text-slate hover:bg-sand-100'
                    }`}
                  >
                    ✨ /new-video-hero.mp4 (Current Default)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValue('heroVideoUrl', '/new-bg-hero-background-video.mp4', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    aria-pressed={heroVideoUrlValue === '/new-bg-hero-background-video.mp4'}
                    className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-mono font-medium transition-colors border focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                      heroVideoUrlValue === '/new-bg-hero-background-video.mp4'
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                        : 'bg-white border-sand-300 text-slate hover:bg-sand-100'
                    }`}
                  >
                    🏛️ /new-bg-hero-background-video.mp4 (Archival)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bhopal Branches */}
          {activeTab === 'branches' && (
            <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-taupe-500">
                    Bhopal Retail Outlets
                  </h2>
                  <p className="text-xs text-taupe-500 mt-0.5">
                    Seed stores: Jawahar Chowk (HQ), Kolar Road, Piplani/BHEL, Karond.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendBranch({
                      name: '',
                      address: '',
                      phone: '+91 98260 ',
                      hours: 'Mon-Sat: 10:30 AM - 8:30 PM',
                      mapUrl: '',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-200 text-navy-800 hover:bg-sand-300 font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>

              <div className="space-y-4">
                {branchFields.map((branch, idx) => (
                  <div
                    key={branch.id}
                    className="p-4 rounded-2xl border border-sand-300 bg-sand-100/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-black text-xs text-navy-800 uppercase tracking-wider">
                        Branch #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBranch(idx)}
                        className="p-1 rounded-lg text-taupe-500 hover:text-crimson-600 hover:bg-crimson-100 transition-colors"
                        title="Remove branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-navy-800">Branch Name *</label>
                        <input
                          type="text"
                          {...register(`branches.${idx}.name` as const)}
                          placeholder="e.g. Jawahar Chowk (HQ)"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold placeholder:text-taupe-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-navy-800">Contact Phone *</label>
                        <input
                          type="text"
                          {...register(`branches.${idx}.phone` as const)}
                          placeholder="+91 98260 25211"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono placeholder:text-taupe-500"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-navy-800">Full Address *</label>
                        <input
                          type="text"
                          {...register(`branches.${idx}.address` as const)}
                          placeholder="Plot 23, New MLA Colony, near Unique College, Bhopal 462003"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-taupe-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-navy-800">Business Hours *</label>
                        <input
                          type="text"
                          {...register(`branches.${idx}.hours` as const)}
                          placeholder="Mon-Sat: 10:30 AM - 8:30 PM"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-taupe-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-navy-800">Google Maps URL</label>
                        <input
                          type="text"
                          {...register(`branches.${idx}.mapUrl` as const)}
                          placeholder="https://maps.google.com/?q=..."
                          className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 bg-white text-navy-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-[11px] placeholder:text-taupe-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Delivery & Banner */}
          {activeTab === 'delivery' && (
            <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-taupe-500">
                Delivery Parameters & Top Announcement
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">Standard Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    {...register('deliveryFee', { valueAsNumber: true })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 font-bold font-mono"
                  />
                  {errors.deliveryFee && (
                    <p className="text-[11px] text-crimson-600">{errors.deliveryFee.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-800">
                    Free Delivery Threshold (₹) *
                  </label>
                  <input
                    type="number"
                    {...register('freeDeliveryAbove', { valueAsNumber: true })}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 font-bold font-mono"
                  />
                  {errors.freeDeliveryAbove && (
                    <p className="text-[11px] text-crimson-600">{errors.freeDeliveryAbove.message}</p>
                  )}
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="pt-4 border-t border-sand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-navy-800 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <span>Top Site Announcement Bar</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('announcementBar.enabled')}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-sand-300"
                    />
                    <span>Show Announcement</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    {...register('announcementBar.text')}
                    placeholder="e.g. 🎒 New Academic Year Uniforms Available! Free Home Delivery across Bhopal on orders over ₹1,500."
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
                  />
                  <input
                    type="text"
                    {...register('announcementBar.link')}
                    placeholder="Optional banner link (e.g. /shop)"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate font-mono placeholder:text-taupe-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isOwner}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all"
            >
              <Save className="w-4 h-4" />
              <span>
                {!isOwner
                  ? 'Owner Role Required to Save'
                  : isSubmitting
                  ? 'Saving Settings...'
                  : 'Save Settings'}
              </span>
            </button>
          </div>
        </form>
      ) : (
        /* TAB 4: Security (Password Change) */
        <div className="bg-cream-50 p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm max-w-lg space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-taupe-500">
            Change Administrator Password
          </h2>
          <p className="text-xs text-taupe-500">
            Update your authentication credentials. Passwords are encrypted with bcrypt (cost 12).
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">New Password (Min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all"
            >
              {isChangingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
