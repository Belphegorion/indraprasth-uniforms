import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Building2, CheckCircle2, Send, ShieldCheck, Truck, Users, Scissors } from 'lucide-react';
import { useCreateInquiry } from '../../api';
import toast from 'react-hot-toast';

export const BulkInquiry: React.FC = () => {
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
      organisation: '',
      quantityEstimate: 50,
      message: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createInquiryMutation.mutateAsync({
        type: 'bulk',
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        organisation: data.organisation || undefined,
        quantityEstimate: Number(data.quantityEstimate) || undefined,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success('Institutional inquiry received! Our senior consultant will contact you.', {
        style: {
          background: '#0E2747',
          color: '#FBF8F2',
          border: '1px solid #DCCDB4',
        },
      });
    } catch (err: any) {
      toast.error('Failed to submit inquiry. Please try calling our head office.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <Helmet>
        <title>Institutional & Bulk Uniform Orders | Indraprasth Uniforms Bhopal</title>
        <meta
          name="description"
          content="Specialized uniform manufacturing and volume supply for schools, hospitals, hotels and corporate companies across Madhya Pradesh."
        />
      </Helmet>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
          Institutional Procurement & Tenders
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-navy-800 tracking-tight">
          Bulk Uniform Tailoring & Institutional Supply
        </h1>
        <p className="text-sm text-slate font-sans">
          Partner with Bhopal's premier uniform icon since 1975. Direct textile mill sourcing, bespoke monogram embroidery, and door-to-door institutional delivery across Central India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7 bg-cream-50 p-6 sm:p-8 rounded-xl border border-sand-300 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-navy-800">Request Institutional Quote</h2>
            <p className="text-xs text-slate font-sans">
              Provide your academy or enterprise requirements for volume-tiered bespoke pricing.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-sand-200/50 rounded-lg border border-sand-300 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-success-text mx-auto" />
              <h3 className="text-xl font-serif font-bold text-navy-800">Inquiry Logged Successfully!</h3>
              <p className="text-xs text-slate max-w-md mx-auto font-sans leading-relaxed">
                Thank you for reaching out to Indraprasth Uniforms. Our institutional relationship director will contact you with fabric swatch samples and comprehensive volume quotations.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 inline-block text-xs font-serif italic text-blue-600 underline font-semibold"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Contact Person *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g. Dr. R. K. Sharma"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Organization / School Name *</label>
                  <input
                    type="text"
                    {...register('organisation', { required: 'Organization is required' })}
                    placeholder="e.g. St. Xavier's Academy Bhopal"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Estimated Quantity (Sets)</label>
                  <input
                    type="number"
                    min="10"
                    {...register('quantityEstimate')}
                    placeholder="e.g. 100"
                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="e.g. procurement@academy.org"
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Tender Specifications & Requirements *</label>
                <textarea
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  placeholder="Provide required uniform items (blazers, shirts, aprons), fabric expectations, crest embroidery details, and target delivery deadline..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                />
                {errors.message && (
                  <p className="text-xs text-crimson-600 font-medium">{errors.message.message as string}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createInquiryMutation.isPending}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm btn-tactile transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{createInquiryMutation.isPending ? 'Logging Proposal...' : 'Submit Institutional Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Institutional Capabilities */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-navy-900 text-white rounded-xl p-8 space-y-6 border border-navy-800 shadow-xl dark">
            <h3 className="font-serif font-bold text-xl text-white">Why Partner with Indraprasth?</h3>
            <p className="text-xs text-sand-300 leading-relaxed font-sans">
              With 50 years of manufacturing experience, we operate dedicated cutting and stitching bays capable of producing over 2,000 uniform sets monthly with guaranteed quality consistency.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <Scissors className="w-5 h-5 text-brass shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-cream-50">Fabric Swatch Samples</h4>
                  <p className="text-xs text-sand-300 mt-0.5">Physical swatch cards and shade catalogues delivered directly to your administrative board.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-brass shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-cream-50">Lab Tested Fabrics</h4>
                  <p className="text-xs text-sand-300 mt-0.5">Certified tear strength, zero-pilling finishes, and colorfast laboratory guarantees.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-brass shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-cream-50">Scheduled Dispatch</h4>
                  <p className="text-xs text-sand-300 mt-0.5">Staggered delivery schedules mapped precisely to your academic semester openings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
