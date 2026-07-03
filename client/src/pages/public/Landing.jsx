import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineX, HiOutlineMenu, HiOutlineXCircle, HiOutlineCheckCircle } from 'react-icons/hi';
import {
  NAV_LINKS,
  HERO,
  PROBLEM,
  HOW_IT_WORKS,
  ROLES,
  FEATURES,
  CTA,
  FOOTER,
} from '@constants/landingContent';
import Button from '@components/ui/Button';
import useScrollToSection from '@hooks/useScrollToSection';

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION WRAPPER — reusable scroll-triggered animation wrapper
   ═══════════════════════════════════════════════════════════════════════ */

function Section({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollToSection = useScrollToSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-heading font-bold text-sm">F</span>
          </div>
          <span className="font-heading font-bold text-xl text-charcoal-950 tracking-tight">
            Fixra
          </span>
        </a>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.filter((link) => !link.href.startsWith('/')).map((link) => (
            <a
              key={link.label}
              href={`#${link.href}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="font-heading text-sm font-medium text-charcoal-600 hover:text-primary-500 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side - Auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="font-heading text-sm font-medium text-charcoal-600 hover:text-primary-500 transition-colors duration-200"
          >
            Login
          </Link>
          <Link to="/register">
            <Button variant="primary" className="!w-auto !px-5 !py-2.5 !text-sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-charcoal-700 hover:bg-charcoal-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-charcoal-100 overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) =>
                !link.href.startsWith('/') ? (
                  <a
                    key={link.label}
                    href={`#${link.href}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                      setMobileOpen(false);
                    }}
                    className="font-heading text-sm font-medium text-charcoal-700 hover:text-primary-500 py-2.5 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-heading text-sm font-medium text-charcoal-700 hover:text-primary-500 py-2.5 transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="!w-auto !px-5 !py-2.5 !text-sm mt-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════════════ */

function Hero() {
  const scrollToSection = useScrollToSection();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-mesh">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-100/40 blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-sage-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-100/20 blur-3xl" />
      </div>

      {/* Grid dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1f 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-40 pb-20 text-center">


        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-charcoal-950 leading-[1.08] tracking-tight whitespace-pre-line max-w-4xl mx-auto"
        >
          {HERO.headline.split('Maintenance').map((part, i) =>
            i === 0 ? (
              <span key={i}>
                {part}
                <span className="relative inline-block">
                  <span className="relative z-10">Maintenance</span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-4 bg-primary-200/60 -z-0 origin-left rounded-sm"
                  />
                </span>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          className="mt-6 md:mt-8 font-body text-lg md:text-xl text-charcoal-500 leading-relaxed max-w-2xl mx-auto"
        >
          {HERO.subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link to={HERO.primaryCta.href}>
              <Button variant="primary" className="!w-auto !px-8 !py-3.5 !text-base">
                {HERO.primaryCta.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </motion.div>
          <motion.a
            href={`#${HERO.secondaryCta.href}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(HERO.secondaryCta.href);
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="secondary" className="!w-auto !px-8 !py-3.5 !text-base">
              {HERO.secondaryCta.label}
            </Button>
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-charcoal-300 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-charcoal-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROBLEM SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function ProblemSection() {
  return (
    <Section className="py-24 md:py-32 bg-white" id="problem">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16 md:mb-20">
          <span className="inline-block font-heading text-xs font-semibold text-primary-500 tracking-widest uppercase mb-4">
            Why Fixra?
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight">
            {PROBLEM.title}
          </h2>
          <p className="mt-4 font-body text-lg text-charcoal-500 max-w-xl mx-auto">
            {PROBLEM.subtitle}
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Old way */}
          <motion.div
            variants={slideInLeft}
            className="relative rounded-2xl border-2 border-charcoal-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-charcoal-400 via-charcoal-300 to-charcoal-200" />
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center">
                  <HiOutlineXCircle className="w-6 h-6 text-charcoal-600" />
                </div>
                <h3 className="font-heading font-bold text-xl text-charcoal-900">
                  {PROBLEM.oldWay.label}
                </h3>
              </div>
              <ul className="space-y-4">
                {PROBLEM.oldWay.items.map((item, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-charcoal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <span className="font-body text-charcoal-700 leading-relaxed">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* New way */}
          <motion.div
            variants={slideInRight}
            className="relative rounded-2xl border-2 border-sage-300 bg-white shadow-sm hover:shadow-lg hover:shadow-sage-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage-500 via-sage-400 to-sage-300" />
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-6 h-6 text-sage-600" />
                </div>
                <h3 className="font-heading font-bold text-xl text-sage-900">
                  {PROBLEM.newWay.label}
                </h3>
              </div>
              <ul className="space-y-4">
                {PROBLEM.newWay.items.map((item, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="font-body text-charcoal-700 leading-relaxed font-medium">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════ */

const stepColorMap = {
  primary: {
    gradient: 'from-primary-500 to-primary-600',
    glow: 'shadow-primary-500/20',
    ring: 'ring-primary-500/10',
    bg: 'bg-primary-50',
    textAccent: 'text-primary-600',
    iconBg: 'bg-primary-500',
  },
  sage: {
    gradient: 'from-sage-500 to-sage-600',
    glow: 'shadow-sage-500/20',
    ring: 'ring-sage-500/10',
    bg: 'bg-sage-50',
    textAccent: 'text-sage-600',
    iconBg: 'bg-sage-500',
  },
  amber: {
    gradient: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/20',
    ring: 'ring-amber-500/10',
    bg: 'bg-amber-50',
    textAccent: 'text-amber-600',
    iconBg: 'bg-amber-500',
  },
};

function HowItWorks() {
  return (
    <Section className="relative py-24 md:py-32 bg-gradient-to-br from-surface-warm via-white to-surface-cream overflow-hidden" id="how-it-works">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-sage-100/30 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-primary-100/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-20 md:mb-24">
          <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-sage-600 tracking-widest uppercase mb-4 px-4 py-2 rounded-full bg-sage-50 border border-sage-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            The Process
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight mt-6">
            {HOW_IT_WORKS.title}
          </h2>
          <p className="mt-5 font-body text-lg text-charcoal-500 max-w-2xl mx-auto leading-relaxed">
            {HOW_IT_WORKS.subtitle}
          </p>
        </motion.div>

        {/* Steps Grid - Modern Layout */}
        <motion.div
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {HOW_IT_WORKS.steps.map((step, idx) => {
            const colors = stepColorMap[step.color] || stepColorMap.primary;
            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {/* Connecting line for visual flow */}
                {idx < HOW_IT_WORKS.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-0">
                    <svg className="w-8 h-8 text-charcoal-200 group-hover:text-charcoal-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}

                {/* Card */}
                <div className="relative bg-white rounded-3xl border-2 border-charcoal-100 p-8 shadow-lg group-hover:shadow-2xl group-hover:border-charcoal-200 transition-all duration-300 overflow-hidden h-full">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300`} />
                  
                  {/* Top gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

                  {/* Content */}
                  <div className="relative">
                    {/* Number Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow}`}
                      >
                        <span className="font-heading font-extrabold text-2xl text-white">
                          {step.number}
                        </span>
                        {/* Pulse ring */}
                        <div className={`absolute inset-0 rounded-2xl ring-4 ${colors.ring} animate-pulse-soft`} />
                      </motion.div>

                      {/* Step indicator */}
                      <div className="flex items-center gap-1.5">
                        {HOW_IT_WORKS.steps.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === idx ? 'w-8 bg-charcoal-400' : 'w-1.5 bg-charcoal-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`font-heading font-bold text-2xl text-charcoal-950 mb-3 group-hover:${colors.textAccent} transition-colors`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="font-body text-charcoal-600 leading-relaxed text-base">
                      {step.description}
                    </p>

                    {/* Decorative corner element */}
                    <div className={`absolute bottom-6 right-6 w-12 h-12 rounded-xl ${colors.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}>
                      <div className={`absolute inset-2 rounded-lg border-2 border-dashed ${colors.textAccent} border-opacity-30`} />
                    </div>
                  </div>
                </div>

                {/* Mobile connector arrow */}
                {idx < HOW_IT_WORKS.steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <svg className="w-6 h-6 text-charcoal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-sm text-charcoal-400 italic">
            Simple, transparent, and accountable — every step of the way.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROLES SECTION
   ═══════════════════════════════════════════════════════════════════════ */

const roleColorMap = {
  0: {
    iconGradient: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-50',
    iconBorder: 'border-primary-200',
    iconColor: 'text-primary-500',
    accentLine: 'bg-gradient-to-r from-primary-400 to-primary-500',
    hoverBorder: 'hover:border-primary-300',
    hoverShadow: 'hover:shadow-primary-500/10',
  },
  1: {
    iconGradient: 'from-sage-500 to-sage-600',
    iconBg: 'bg-sage-50',
    iconBorder: 'border-sage-200',
    iconColor: 'text-sage-500',
    accentLine: 'bg-gradient-to-r from-sage-400 to-sage-500',
    hoverBorder: 'hover:border-sage-300',
    hoverShadow: 'hover:shadow-sage-500/10',
  },
  2: {
    iconGradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-200',
    iconColor: 'text-amber-500',
    accentLine: 'bg-gradient-to-r from-amber-400 to-amber-500',
    hoverBorder: 'hover:border-amber-300',
    hoverShadow: 'hover:shadow-amber-500/10',
  },
  3: {
    iconGradient: 'from-primary-600 to-sage-600',
    iconBg: 'bg-primary-50',
    iconBorder: 'border-primary-200',
    iconColor: 'text-primary-600',
    accentLine: 'bg-gradient-to-r from-primary-500 to-sage-500',
    hoverBorder: 'hover:border-primary-300',
    hoverShadow: 'hover:shadow-primary-500/10',
  },
};

function RolesSection() {
  return (
    <Section className="relative py-24 md:py-32 bg-gradient-to-b from-white via-surface-warm to-white overflow-hidden" id="roles">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-primary-100/20 blur-3xl" />
        <div className="absolute bottom-40 -right-20 w-96 h-96 rounded-full bg-sage-100/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-20 md:mb-24">
          <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-primary-500 tracking-widest uppercase mb-4 px-4 py-2 rounded-full bg-primary-50 border border-primary-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            For Everyone
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight mt-6">
            {ROLES.title}
          </h2>
          <p className="mt-5 font-body text-lg text-charcoal-500 max-w-2xl mx-auto leading-relaxed">
            {ROLES.subtitle}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7"
        >
          {ROLES.cards.map((card, idx) => {
            const colors = roleColorMap[idx] || roleColorMap[0];
            const Icon = card.icon;
            return (
              <motion.div
                key={card.role}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative bg-white border-2 border-charcoal-100 rounded-3xl p-7 ${colors.hoverBorder} hover:shadow-xl ${colors.hoverShadow} transition-all duration-300 overflow-hidden`}
              >
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative w-14 h-14 rounded-2xl ${colors.iconBg} border-2 ${colors.iconBorder} flex items-center justify-center group-hover:border-transparent transition-all duration-300`}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.iconGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <Icon className={`relative w-7 h-7 ${colors.iconColor} group-hover:text-white transition-colors duration-300 z-10`} />
                  </motion.div>
                  
                  {/* Role number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-charcoal-900 border-2 border-white flex items-center justify-center">
                    <span className="font-heading font-bold text-xs text-white">{idx + 1}</span>
                  </div>
                </div>

                {/* Role name */}
                <h3 className="font-heading font-bold text-xl text-charcoal-950 mb-3 group-hover:text-charcoal-950 transition-colors duration-200">
                  {card.role}
                </h3>

                {/* Description */}
                <p className="font-body text-sm text-charcoal-600 leading-relaxed mb-5">
                  {card.description}
                </p>

                {/* Highlights - Enhanced tags */}
                <div className="flex flex-wrap gap-2">
                  {card.highlights.map((tag, tagIdx) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: tagIdx * 0.1 }}
                      className="font-heading text-xs font-semibold text-charcoal-700 bg-charcoal-50 border border-charcoal-200 px-3 py-1.5 rounded-full group-hover:bg-charcoal-100 group-hover:border-charcoal-300 transition-all duration-200"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                {/* Decorative corner dot */}
                <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-charcoal-200 group-hover:bg-charcoal-400 transition-colors duration-300" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-sm text-charcoal-400">
            <span className="font-semibold text-charcoal-600">One platform.</span> Four roles. Complete transparency.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURES GRID
   ═══════════════════════════════════════════════════════════════════════ */

const featureColorMap = {
  0: { accent: 'primary', gradient: 'from-primary-500 to-primary-600', bg: 'bg-primary-50', border: 'border-primary-200', iconColor: 'text-primary-600' },
  1: { accent: 'sage', gradient: 'from-sage-500 to-sage-600', bg: 'bg-sage-50', border: 'border-sage-200', iconColor: 'text-sage-600' },
  2: { accent: 'amber', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-600' },
  3: { accent: 'primary', gradient: 'from-primary-600 to-sage-500', bg: 'bg-primary-50', border: 'border-primary-200', iconColor: 'text-primary-600' },
  4: { accent: 'sage', gradient: 'from-sage-600 to-amber-500', bg: 'bg-sage-50', border: 'border-sage-200', iconColor: 'text-sage-600' },
  5: { accent: 'amber', gradient: 'from-amber-600 to-primary-500', bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-600' },
};

function FeaturesGrid() {
  return (
    <Section className="relative py-24 md:py-32 bg-white overflow-hidden" id="features">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-primary-100/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-sage-100/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-100/10 blur-3xl" />
      </div>

      {/* Grid dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1f 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-20 md:mb-24">
          <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-sage-600 tracking-widest uppercase mb-4 px-4 py-2 rounded-full bg-sage-50 border border-sage-200">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Features
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight mt-6">
            {FEATURES.title}
          </h2>
          <p className="mt-5 font-body text-lg text-charcoal-500 max-w-2xl mx-auto leading-relaxed">
            {FEATURES.subtitle}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {FEATURES.items.map((feature, idx) => {
            const Icon = feature.icon;
            const colors = featureColorMap[idx] || featureColorMap[0];
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {/* Card with clean styling */}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-charcoal-100 hover:border-charcoal-200">
                  {/* Icon with animated background */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`relative w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}
                    >
                      {/* Animated pulse ring */}
                      <div className={`absolute inset-0 rounded-xl ${colors.border} border-2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`} />
                      <Icon className={`relative w-7 h-7 ${colors.iconColor} transition-transform duration-300 group-hover:scale-110 z-10`} />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-xl text-charcoal-950 mb-3 group-hover:text-charcoal-950 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-sm text-charcoal-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom left accent dot */}
                  <div className={`absolute bottom-6 left-6 w-1.5 h-1.5 rounded-full ${colors.bg} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Hover arrow indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg className={`w-5 h-5 ${colors.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom feature highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary-50 via-sage-50 to-amber-50 border border-charcoal-100">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-heading text-sm font-semibold text-charcoal-700">
              All features included in every plan
            </span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function CtaSection() {
  return (
    <Section className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={scaleIn}
          className="relative rounded-3xl overflow-hidden bg-charcoal-950 px-8 py-16 md:px-16 md:py-20 text-center"
        >
          {/* Decorative gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sage-500/10 blur-3xl" />
          </div>

          {/* Grid dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative">
            <motion.h2
              variants={fadeUp}
              className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight whitespace-pre-line"
            >
              {CTA.title}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mt-5 font-body text-lg text-charcoal-300 max-w-xl mx-auto"
            >
              {CTA.subtitle}
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link to={CTA.buttonHref}>
                  <Button variant="secondary" className="!w-auto !px-8 !py-3.5 !text-base">
                    {CTA.buttonLabel}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */

function Footer() {
  const scrollToSection = useScrollToSection();

  const handleFooterLinkClick = (e, href) => {
    if (!href.startsWith('/')) {
      e.preventDefault();
      scrollToSection(href);
    }
  };

  return (
    <footer className="bg-charcoal-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-5 gap-12 md:gap-8 pb-12 border-b border-charcoal-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">F</span>
              </div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                Fixra
              </span>
            </div>
            <p className="font-body text-sm text-charcoal-400 leading-relaxed max-w-xs">
              {FOOTER.tagline}
            </p>
          </div>

          {/* Link columns */}
          {FOOTER.links.map((group) => (
            <div key={group.heading}>
              <h4 className="font-heading font-semibold text-sm text-charcoal-200 mb-4">
                {group.heading}
              </h4>
              <ul className="space-y-2.5">
                {group.items.map((link) => (
                  <li key={link.label}>
                    <a
                      href={`#${link.href}`}
                      onClick={(e) => handleFooterLinkClick(e, link.href)}
                      className="font-body text-sm text-charcoal-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="font-body text-xs text-charcoal-500">
            {FOOTER.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LANDING PAGE (assembled)
   ═══════════════════════════════════════════════════════════════════════ */

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <RolesSection />
      <FeaturesGrid />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Landing;
