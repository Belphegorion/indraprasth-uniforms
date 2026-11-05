import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  Award,
  Truck,
  Building,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Scissors,
} from 'lucide-react';
import { useSchools, useFeaturedProducts, usePublicSettings } from '../../api';
import { ProductCard } from '../../components/product/ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { SchoolShopSection } from '../../components/home/SchoolShopSection';

export const Home: React.FC = () => {
  const { data: schools, isLoading: schoolsLoading } = useSchools();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: settings } = usePublicSettings();

  // LocalBusiness schema for rich snippet SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Indraprasth Uniforms',
    image: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1791284239/indraprasth/products/y3sgf8q8kydtlarcydnb.jpg',
    telephone: settings?.phones?.[0] || '+91 98260 25211',
    url: 'https://indraprasth-uniforms.netlify.app',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot 23, New MLA Colony, near Unique College, Jawahar Chowk',
      addressLocality: 'Bhopal',
      addressRegion: 'Madhya Pradesh',
      postalCode: '462003',
      addressCountry: 'IN',
    },
    priceRange: '₹90 - ₹3500',
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      <Helmet>
        <title>Indraprasth Uniforms Bhopal | The Uniform Icons since 1975</title>
        <meta
          name="description"
          content="Official Delhi Public School (DPS), St. Joseph's and top Bhopal school uniforms. Shop winter blazers, sweaters, shirts, pants & hospital scrubs."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero Section — Archival Atelier Elegance */}
      <section className="relative overflow-hidden bg-cream-100 py-12 sm:py-20 border-b border-sand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-50 border border-sand-300 text-brass-text text-xs font-serif font-semibold uppercase tracking-wider shadow-subtle">
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                <span>The Uniform Icons Since 1975</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-navy-800 tracking-tight leading-[1.08]">
                Crafted for Character &{' '}
                <span className="font-serif italic font-normal text-brass-text">
                  Academic Distinction
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Trusted by Bhopal's premier schools, colleges, medical faculties, and corporations for half a century.
                Official regulation dye-lots, certified shrink-resistant woollens, and master tailoring designed to outlast the academic year.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                <a
                  href="#shop-by-school"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('shop-by-school')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-crimson-600 hover:bg-crimson-700 active:bg-crimson-800 text-white font-medium text-sm sm:text-base shadow-sm shadow-crimson-600/20 btn-tactile focus-visible:ring-2 focus-visible:ring-crimson-600"
                >
                  <span>Select Your School</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/bulk-inquiry"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-transparent hover:bg-navy-800 hover:text-cream-50 text-navy-800 border-[1.5px] border-navy-800 font-medium text-sm sm:text-base btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Building className="w-4 h-4 text-brass" />
                  <span>Institutional & Bulk Orders</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-sand-300 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-navy-800">50+</span>
                  <span className="text-xs text-slate font-serif italic">Years of Heritage</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-navy-800">4</span>
                  <span className="text-xs text-slate font-serif italic">Bhopal Retail Branches</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-serif font-bold text-navy-800">100%</span>
                  <span className="text-xs text-slate font-serif italic">Regulation Conformity</span>
                </div>
              </div>
            </div>

            {/* Right Column Visual Plinth */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-[10px] overflow-hidden shadow-2xl border border-navy-700 bg-navy-900 text-cream-50">
                  <div className="relative bg-cream-50 p-4 sm:p-6 flex items-center justify-center border-b border-sand-300">
                    <img
                      src="https://res.cloudinary.com/dvaynkflu/image/upload/f_auto,q_auto,w_800/v1791284239/indraprasth/products/y3sgf8q8kydtlarcydnb.jpg"
                      alt="Delhi Public School Bhopal Blazer by Indraprasth"
                      className="w-full h-64 sm:h-80 object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-serif font-semibold bg-navy-800 text-cream-50 border border-navy-700 shadow-md">
                        DPS Official Issue
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 bg-navy-900 text-cream-50">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-serif tracking-widest text-brass font-bold">
                        Bespoke Masterpiece
                      </span>
                      <span className="font-mono text-sm font-semibold text-crimson-400">₹1,650</span>
                    </div>
                    <div className="text-xl font-serif font-bold text-cream-50 mt-1">
                      Delhi Public School Official Blazer
                    </div>
                    <p className="text-xs text-sand-300 mt-1.5 font-sans leading-relaxed">
                      Double-interlocked lapels, crest-embossed brass buttons, certified thermal poly-wool weave.
                    </p>
                  </div>
                </div>

                {/* Floating Heritage Craft Pill */}
                <div className="absolute -bottom-6 -left-6 bg-cream-50 p-4 rounded-[10px] shadow-xl border border-sand-300 flex items-center gap-3.5 hidden sm:flex">
                  <div className="w-11 h-11 rounded-[8px] bg-blue-100 text-navy-800 flex items-center justify-center font-bold border border-blue-600/30">
                    <Scissors className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold text-navy-800">Master Cut & Finish</div>
                    <p className="text-xs text-slate font-serif italic">Free branch alteration support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Select School Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold">
            Academic Dress Codes
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
            Select Your Child's School
          </h2>
          <p className="text-sm text-slate font-sans">
            Choose your affiliated campus to view certified regulation uniforms, winter wear, and sports kits.
          </p>
        </div>

        {schoolsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-36 rounded-[10px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {schools?.map((school) => (
              <Link
                key={school._id || school.code}
                to={`/school/${school.slug}`}
                className="group p-6 bg-cream-50 rounded-[10px] border border-sand-300 shadow-plinth hover:shadow-plinth-hover hover:border-brass transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-navy-800 border border-blue-600/30">
                      {school.code}
                    </span>
                    <span className="text-xs font-mono text-slate">
                      {school.productCount || 0} items
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-navy-800 group-hover:text-blue-600 transition-colors leading-snug">
                    {school.name}
                  </h3>
                  {school.branchLabel && (
                    <p className="text-xs text-slate font-serif italic mt-1">{school.branchLabel}</p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-sand-300 flex items-center justify-between text-xs font-serif font-bold text-navy-800 group-hover:text-blue-600">
                  <span>Explore Uniform Set</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Uniforms Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-sand-300">
          <div>
            <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold">
              Current Session Essentials
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
              Featured Winter Uniforms
            </h2>
            <p className="text-sm text-slate font-sans mt-1">
              Popular blazers, dividers, and regulation shirts for current Bhopal school dress codes.
            </p>
          </div>
          <Link
            to="/shop?category=winter-ware"
            className="text-sm font-serif italic text-blue-600 hover:text-navy-800 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Explore all winter woollens</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-80 rounded-[10px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts?.slice(0, 8).map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Shop by School Filter & Browse Section */}
      <SchoolShopSection />

      {/* Uniform Categories Section — Alternate Sand Band */}
      <section className="bg-sand-200 py-16 sm:py-20 border-y border-sand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold">
              Institutional Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800">
              Tailored Across Every Sector
            </h2>
            <p className="text-sm text-slate font-sans">
              From kindergarten primary classes to tertiary medical faculties and corporate teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-cream-50 p-6 rounded-[10px] border border-sand-300 shadow-plinth space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-cream-100 border border-sand-300 text-navy-800 flex items-center justify-center text-xl mb-4">
                  🎒
                </div>
                <h3 className="font-serif font-bold text-lg text-navy-800">School Uniforms</h3>
                <p className="text-xs text-slate leading-relaxed mt-2 font-sans">
                  Official blazers, shirts, dividers, trousers, socks, ties, and winter sweaters for Bhopal CBSE & ICSE schools.
                </p>
              </div>
              <Link to="/shop" className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold block pt-4 border-t border-sand-300">
                Browse school collection →
              </Link>
            </div>

            <div className="bg-cream-50 p-6 rounded-[10px] border border-sand-300 shadow-plinth space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-cream-100 border border-sand-300 text-navy-800 flex items-center justify-center text-xl mb-4">
                  🎓
                </div>
                <h3 className="font-serif font-bold text-lg text-navy-800">Colleges & Universities</h3>
                <p className="text-xs text-slate leading-relaxed mt-2 font-sans">
                  Management blazers, engineering workshop coats, law student uniforms, and pharmacy laboratory aprons.
                </p>
              </div>
              <Link to="/shop" className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold block pt-4 border-t border-sand-300">
                Browse college attire →
              </Link>
            </div>

            <div className="bg-cream-50 p-6 rounded-[10px] border border-sand-300 shadow-plinth space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-cream-100 border border-sand-300 text-navy-800 flex items-center justify-center text-xl mb-4">
                  🏥
                </div>
                <h3 className="font-serif font-bold text-lg text-navy-800">Hospital & Healthcare</h3>
                <p className="text-xs text-slate leading-relaxed mt-2 font-sans">
                  Antimicrobial surgical scrubs, physician coats, nursing attire, OT linen, and patient care gowns.
                </p>
              </div>
              <Link to="/bulk-inquiry" className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold block pt-4 border-t border-sand-300">
                Request medical catalog →
              </Link>
            </div>

            <div className="bg-cream-50 p-6 rounded-[10px] border border-sand-300 shadow-plinth space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] bg-cream-100 border border-sand-300 text-navy-800 flex items-center justify-center text-xl mb-4">
                  💼
                </div>
                <h3 className="font-serif font-bold text-lg text-navy-800">Corporate & Hospitality</h3>
                <p className="text-xs text-slate leading-relaxed mt-2 font-sans">
                  Executive corporate shirts, front-desk blazers, security uniforms, and facility service staff wear.
                </p>
              </div>
              <Link to="/bulk-inquiry" className="text-xs font-serif italic text-blue-600 hover:text-navy-800 font-bold block pt-4 border-t border-sand-300">
                Request commercial quote →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Indraprasth — Archival Navy Plinth */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-800 text-cream-50 rounded-[12px] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-navy-700">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-serif italic uppercase tracking-widest text-brass font-bold">
              The Indraprasth Standard
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Why Bhopal Has Trusted Us For Over Half a Century
            </h2>
            <p className="text-sand-200 text-sm sm:text-base leading-relaxed font-sans">
              Established in 1975, Indraprasth Uniforms was founded on a bedrock tailoring principle: school uniforms must endure rigorous daily play, repeated machine washings, and active student growth without losing shape or color fidelity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-navy-700">
              <div className="space-y-2">
                <ShieldCheck className="w-8 h-8 text-brass" />
                <h3 className="font-serif font-bold text-base text-white">Double-Stitched Seams</h3>
                <p className="text-xs text-sand-300 font-sans">
                  Reinforced stress points on all pockets, armholes, and trouser crotches for maximum longevity.
                </p>
              </div>

              <div className="space-y-2">
                <Truck className="w-8 h-8 text-brass" />
                <h3 className="font-serif font-bold text-base text-white">4 Branch Trial & Pickup</h3>
                <p className="text-xs text-sand-300 font-sans">
                  Pick up at 4 local stores with free on-spot alterations, or order home delivery anywhere in Bhopal.
                </p>
              </div>

              <div className="space-y-2">
                <Award className="w-8 h-8 text-brass" />
                <h3 className="font-serif font-bold text-base text-white">Official Color Matching</h3>
                <p className="text-xs text-sand-300 font-sans">
                  Accredited dye-lots and school crest embroidery adhering strictly to institution guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Bhopal Retail Branches Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-serif italic uppercase tracking-widest text-brass-text font-bold">
            Visit Our Stores
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-800 tracking-tight">
            Our 4 Retail Branches in Bhopal
          </h2>
          <p className="text-sm text-slate font-sans">
            Centrally situated across the city with dedicated changing rooms and veteran alteration tailors on site.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settings?.branches?.map((branch, index) => (
            <div
              key={index}
              className="bg-cream-50 p-6 rounded-[10px] border border-sand-300 shadow-plinth hover:shadow-plinth-hover hover:border-brass transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sand-200 text-navy-800 border border-sand-300">
                    Branch {index + 1}
                  </span>
                  <MapPin className="w-4 h-4 text-brass" />
                </div>
                <h3 className="font-serif font-bold text-base text-navy-800">{branch.name}</h3>
                <p className="text-xs text-slate leading-relaxed font-sans">{branch.address}</p>
                <div className="pt-3 border-t border-sand-300 text-xs space-y-1">
                  <p className="flex items-center gap-1.5 text-navy-800 font-mono font-medium">
                    <Phone className="w-3.5 h-3.5 text-brass" />
                    {branch.phone}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-taupe-500" />
                    {branch.hours}
                  </p>
                </div>
              </div>

              {branch.mapUrl && (
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 pt-3 border-t border-sand-300 text-xs font-serif font-bold text-blue-600 hover:text-navy-800 flex items-center justify-between transition-colors"
                >
                  <span>Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
