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
  Play,
  Pause,
} from 'lucide-react';
import { useSchools, useFeaturedProducts, usePublicSettings } from '../../api';
import { ProductCard } from '../../components/product/ProductCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { SchoolShopSection } from '../../components/home/SchoolShopSection';

const getVideoMimeType = (url: string): string => {
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  if (clean.endsWith('.webm')) return 'video/webm';
  if (clean.endsWith('.ogg')) return 'video/ogg';
  if (clean.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
};

export const Home: React.FC = () => {
  const { data: schools, isLoading: schoolsLoading } = useSchools();
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: settings } = usePublicSettings();
  const heroVideo = settings?.heroVideoUrl?.trim() || '/new-video-hero.mp4';

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const userPausedRef = React.useRef(false);
  const [isPlaying, setIsPlaying] = React.useState(true);

  // Auto-pause when off-screen or tab is hidden to save CPU, battery, and bandwidth (HIGH-03)
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (!userPausedRef.current && isPlaying) {
        video.play().catch(() => {});
      }
    };

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry.isIntersecting) {
            video.pause();
          } else if (!userPausedRef.current && isPlaying) {
            video.play().catch(() => {});
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(video);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer && video) {
        observer.unobserve(video);
      }
    };
  }, [isPlaying, heroVideo]);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      userPausedRef.current = false;
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      userPausedRef.current = true;
    }
  };

  // LocalBusiness schema for rich snippet SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'Indraprasth Uniforms',
    image: 'https://res.cloudinary.com/dvaynkflu/image/upload/v1791284239/indraprasth/products/y3sgf8q8kydtlarcydnb.jpg',
    telephone: settings?.phones?.[0] || '+91 98260 25211',
    url: 'https://indraprasth-uniforms.vercel.app',
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

      {/* Hero Section — Archival Atelier Elegance with Ambient Video Backdrop */}
      <section className="relative overflow-hidden bg-cream-100 py-16 sm:py-24 lg:py-28 border-b border-sand-300">
        {/* Background Video Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none group dark" aria-hidden="true">
          <video
            ref={videoRef}
            key={heroVideo}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/hero-video-poster.jpg"
            aria-label="Craftsmanship and tailoring background video"
            className="w-full h-full object-cover object-right lg:object-[80%_center] motion-reduce:hidden"
          >
            <source
              src={heroVideo}
              type={getVideoMimeType(heroVideo)}
            />
          </video>
          {/* Fallback image for users with prefers-reduced-motion */}
          <img
            src="/hero-video-poster.jpg"
            alt=""
            className="w-full h-full object-cover object-right lg:object-[80%_center] hidden motion-reduce:block"
          />
          {/* Atelier Gradient Scrim for Legibility & Contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-cream-100/95 via-cream-100/90 to-cream-100/60 lg:bg-gradient-to-r lg:from-cream-100 lg:via-cream-100/95 lg:via-60% lg:to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-navy-950/[0.02]" aria-hidden="true" />
        </div>

        {/* Ambient Video Play/Pause Toggle (WCAG 2.2.2 Pause, Stop, Hide) */}
        <div className="absolute bottom-4 right-4 z-20">
          <button
            type="button"
            onClick={toggleVideoPlayback}
            aria-label={isPlaying ? 'Pause background hero video' : 'Play background hero video'}
            title={isPlaying ? 'Pause background video' : 'Play background video'}
            className="inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-cream-50/90 hover:bg-cream-50 text-navy-800 border border-sand-300 shadow-md backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-navy-800" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 text-navy-800 ml-0.5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Hero Content (Foreground) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-6 text-center lg:text-left p-6 sm:p-8 lg:p-0 rounded-2xl lg:rounded-none bg-cream-50/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-sand-300/80 lg:border-none shadow-xl lg:shadow-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-50/90 backdrop-blur-sm border border-sand-300 text-brass-text text-xs font-serif font-semibold uppercase tracking-wider shadow-subtle">
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
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[8px] bg-cream-50/80 backdrop-blur-sm hover:bg-navy-800 hover:text-cream-50 text-navy-800 border-[1.5px] border-navy-800 font-medium text-sm sm:text-base btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
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
