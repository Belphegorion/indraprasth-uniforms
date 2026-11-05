import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { usePublicSettings, useCreateInquiry } from '../../api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const { data: settings } = usePublicSettings();
  const createInquiryMutation = useCreateInquiry();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createInquiryMutation.mutateAsync({
        type: 'contact',
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success('Your message has been sent. Our team will contact you shortly!', {
        style: {
          background: '#0E2747',
          color: '#FBF8F2',
          border: '1px solid #DCCDB4',
        },
      });
    } catch (err: any) {
      toast.error('Failed to submit message. Please try calling our branch directly.');
    }
  };

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Indraprasth Uniforms Bhopal',
    description: 'Bhopal premier school and institutional uniform supplier since 1975.',
    telephone: settings?.phones?.[0] || '+91 98260 25211',
    url: 'https://indraprasth-uniforms.netlify.app/contact',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot 23, New MLA Colony, near Unique College, Jawahar Chowk',
      addressLocality: 'Bhopal',
      addressRegion: 'Madhya Pradesh',
      postalCode: '462003',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:30',
        closes: '20:30',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <Helmet>
        <title>Contact & Store Locations | Indraprasth Uniforms Bhopal</title>
        <meta
          name="description"
          content="Visit our 4 retail uniform stores in Bhopal: Jawahar Chowk, Kolar Road, Piplani, and Karond. Store hours, phone numbers and Google Map directions."
        />
        <script type="application/ld+json">{JSON.stringify(contactJsonLd)}</script>
      </Helmet>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
          Retail Presence Across Bhopal
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-navy-800 tracking-tight">
          Visit Our Stores or Reach Out
        </h1>
        <p className="text-sm text-slate font-sans">
          Inquiries regarding sizing, school uniform compliance, or on-site alterations? Visit any of our 4 local branches.
        </p>
      </div>

      {/* 4 Bhopal Branches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {settings?.branches?.map((branch, idx) => (
          <div
            key={idx}
            className="bg-cream-50 rounded-lg border border-sand-300 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-sand-400 transition-all duration-200 space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sand-200 text-navy-800">
                  Branch {idx + 1}
                </span>
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-serif font-bold text-base text-navy-800">{branch.name}</h3>
              <p className="text-xs text-slate leading-relaxed font-sans">{branch.address}</p>

              <div className="pt-3 border-t border-sand-300 text-xs space-y-1.5 font-mono">
                <p className="flex items-center gap-1.5 text-navy-800 font-medium">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  {branch.phone}
                </p>
                <p className="flex items-center gap-1.5 text-slate text-[11px] font-sans">
                  <Clock className="w-3.5 h-3.5 text-slate/70" />
                  {branch.hours}
                </p>
              </div>
            </div>

            {branch.mapUrl && (
              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-3 border-t border-sand-300 text-xs font-serif font-bold text-blue-600 hover:text-navy-800 flex items-center justify-between transition-colors"
              >
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Contact Form & Direct Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 bg-navy-900 text-white rounded-xl p-8 space-y-6 shadow-xl border border-navy-800 dark">
          <div className="space-y-2">
            <span className="text-xs font-serif italic uppercase tracking-wider text-brass font-bold block">
              Direct Inquiries
            </span>
            <h2 className="text-2xl font-serif font-bold text-white">Central Operations & Tailoring HQ</h2>
            <p className="text-xs text-sand-300 leading-relaxed font-sans">
              Our central team is available to assist with custom sizing, bulk school tenders, or order status verifications.
            </p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-brass shrink-0" />
              <div>
                <p className="font-serif font-bold text-cream-50">Central Headquarters</p>
                <p className="text-sand-300 mt-0.5">{settings?.address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-brass shrink-0" />
              <div>
                <p className="font-serif font-bold text-cream-50">Telephone Lines</p>
                <p className="text-sand-300 font-mono mt-0.5">{settings?.phones?.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-brass shrink-0" />
              <div>
                <p className="font-serif font-bold text-cream-50">Electronic Mail</p>
                <p className="text-sand-300 mt-0.5">{settings?.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-serif font-bold text-cream-50">WhatsApp Client Concierge</p>
                <a
                  href={`https://wa.me/${settings?.whatsappNumber || '919826025211'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-mono font-medium block mt-0.5"
                >
                  +{settings?.whatsappNumber}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-cream-50 p-8 rounded-xl border border-sand-300 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-navy-800">Transmit a Message</h2>
            <p className="text-xs text-slate font-sans">
              Provide your contact details and our team will get in touch within 24 business hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-sand-200/50 rounded-lg border border-sand-300 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-success-text mx-auto" />
              <h3 className="font-serif font-bold text-navy-800 text-lg">Message Acknowledged</h3>
              <p className="text-xs text-slate font-sans max-w-sm mx-auto">
                Thank you for contacting Indraprasth Uniforms. Our customer care desk will contact you promptly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-serif italic text-blue-600 underline font-semibold mt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Your Full Name *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Anand Sharma"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                  {errors.name && (
                    <p className="text-xs text-crimson-600 font-medium">{errors.name.message as string}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Phone Number *</label>
                  <input
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit Indian phone number',
                      },
                    })}
                    placeholder="e.g. 9826012345"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                  {errors.phone && (
                    <p className="text-xs text-crimson-600 font-medium">{errors.phone.message as string}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Email Address (Optional)</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="e.g. anand@example.com"
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Message or Inquiry *</label>
                <textarea
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  placeholder="Describe school uniform requirements, custom fit questions, or order inquiries..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
                {errors.message && (
                  <p className="text-xs text-crimson-600 font-medium">{errors.message.message as string}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createInquiryMutation.isPending}
                className="w-full min-h-[44px] py-3.5 px-6 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-medium text-sm flex items-center justify-center gap-2 shadow-sm btn-tactile transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-cream-50" />
                <span>{createInquiryMutation.isPending ? 'Sending...' : 'Transmit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
