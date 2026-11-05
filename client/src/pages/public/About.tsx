import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Award, Clock, Users, Shield, MapPin, CheckCircle2, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <Helmet>
        <title>About Indraprasth Uniforms | 50 Years of Excellence Since 1975</title>
        <meta
          name="description"
          content="Learn about Indraprasth Uniforms Bhopal, our 50-year heritage since 1975, craftsmanship, master stitching and 4 Bhopal retail branches."
        />
      </Helmet>

      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold block">
          Tailoring Heritage
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-navy-800 tracking-tight leading-tight">
          Over 50 Years of Defining Bhopal’s Academic & Institutional Identity
        </h1>
        <p className="text-base sm:text-lg text-slate leading-relaxed font-sans">
          Established in 1975 at Jawahar Chowk, Indraprasth Uniforms was founded with an enduring tailoring philosophy:
          to provide students and professionals with uniforms that present unmatched dignity, feel comfortable across long hours, and withstand years of active daily life.
        </p>
      </div>

      {/* Visual Plinth & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-sand-300 bg-navy-900">
            <img
              src="https://res.cloudinary.com/dvaynkflu/image/upload/v1791284736/indraprasth/products/lhr4qpes6dxelbgo77vo.jpg"
              alt="Tailoring craftsmanship at Indraprasth"
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-navy-900 border border-sand-300/40 text-cream-50 p-6 rounded-xl shadow-xl hidden sm:block">
            <span className="block text-3xl font-serif font-bold text-cream-50">1975</span>
            <span className="text-xs uppercase font-serif tracking-wider font-semibold text-sand-300">Founded in Bhopal</span>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800">
            Founded on Trust, Precision Weave & Uncompromised Fabric Quality
          </h2>
          <p className="text-sm text-slate leading-relaxed font-sans">
            Over the past five decades, Bhopal has grown and evolved, and our master tailors have dressed successive generations of families. What originated as a dedicated bespoke uniform boutique at Jawahar Chowk has evolved into 4 retail branches across Kolar Road, Piplani/BHEL, and Karond, supported by an advanced institutional manufacturing unit.
          </p>
          <p className="text-sm text-slate leading-relaxed font-sans">
            We source certified yarns from renowned mills in Bhilwara, Surat, and Mumbai, engineering fabrics characterized by supreme colorfastness, anti-microbial treatments, and minimal shrinkage.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-cream-50 border border-sand-300 shadow-sm">
              <span className="block text-2xl font-serif font-bold text-navy-800">500,000+</span>
              <span className="text-xs text-slate font-serif italic">Students Dressed Since 1975</span>
            </div>
            <div className="p-4 rounded-lg bg-cream-50 border border-sand-300 shadow-sm">
              <span className="block text-2xl font-serif font-bold text-navy-800">4</span>
              <span className="text-xs text-slate font-serif italic">Retail Stores Across Bhopal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles — Warm Beige Plinth */}
      <div className="bg-sand-200/50 p-8 sm:p-12 rounded-2xl border border-sand-300 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 text-center">
          The 4 Pillars of the Indraprasth Standard
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 shadow-sm space-y-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="font-serif font-bold text-base text-navy-800">Reinforced Seams</h3>
            <p className="text-xs text-slate font-sans">
              Heavy-duty spun polyester thread with double-interlocked side seams and bar-tacked stress pockets.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 shadow-sm space-y-2">
            <Award className="w-6 h-6 text-blue-600" />
            <h3 className="font-serif font-bold text-base text-navy-800">Regulation Conformity</h3>
            <p className="text-xs text-slate font-sans">
              Strict adherence to school board approved color shades, monogram embroidery, and institution norms.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 shadow-sm space-y-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="font-serif font-bold text-base text-navy-800">Branch Trial Rooms</h3>
            <p className="text-xs text-slate font-sans">
              Spacious fitting rooms in all 4 Bhopal branches with seasoned master tailors for on-site adjustments.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-lg border border-sand-300 shadow-sm space-y-2">
            <Scissors className="w-6 h-6 text-blue-600" />
            <h3 className="font-serif font-bold text-base text-navy-800">Bespoke Fit Service</h3>
            <p className="text-xs text-slate font-sans">
              Custom sizing options for non-standard student measurements to ensure every child feels proud and poised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
