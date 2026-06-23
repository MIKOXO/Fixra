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
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-heading font-bold text-sm">F</span>
          </div>
          <span className="font-heading font-bold text-xl text-charcoal-950 tracking-tight">
            Fixra
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-heading text-sm font-medium text-charcoal-600 hover:text-primary-500 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/register"
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/20"
          >
            Get Started
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
                link.href.startsWith('#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
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
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center font-heading text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 px-5 py-2.5 rounded-full transition-all duration-200"
              >
                Get Started
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
            <Link
              to={HERO.primaryCta.href}
              className="inline-flex items-center gap-2 font-heading text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 px-8 py-3.5 rounded-full shadow-lg shadow-primary-500/25 transition-colors duration-200"
            >
              {HERO.primaryCta.label}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
          <motion.a
            href={HERO.secondaryCta.href}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 font-heading text-base font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 px-8 py-3.5 rounded-full transition-colors duration-200"
          >
            {HERO.secondaryCta.label}
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
            className="relative rounded-2xl border border-charcoal-200 bg-charcoal-50/50 p-8 md:p-10"
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-charcoal-300 to-charcoal-200" />
            <div className="flex items-center gap-3 mb-6">
              <HiOutlineXCircle className="w-8 h-8 text-charcoal-500" />
              <h3 className="font-heading font-bold text-xl text-charcoal-800">
                {PROBLEM.oldWay.label}
              </h3>
            </div>
            <ul className="space-y-3.5">
              {PROBLEM.oldWay.items.map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-charcoal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span className="font-body text-charcoal-600 leading-relaxed">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* New way */}
          <motion.div
            variants={slideInRight}
            className="relative rounded-2xl border border-sage-200 bg-sage-50/40 p-8 md:p-10"
          >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-sage-400 to-sage-300" />
            <div className="flex items-center gap-3 mb-6">
              <HiOutlineCheckCircle className="w-8 h-8 text-sage-600" />
              <h3 className="font-heading font-bold text-xl text-sage-800">
                {PROBLEM.newWay.label}
              </h3>
            </div>
            <ul className="space-y-3.5">
              {PROBLEM.newWay.items.map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-sage-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-body text-charcoal-700 leading-relaxed">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
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
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    number: 'text-primary-500',
    line: 'bg-primary-200',
    dot: 'bg-primary-500',
  },
  sage: {
    bg: 'bg-sage-50',
    border: 'border-sage-200',
    number: 'text-sage-500',
    line: 'bg-sage-200',
    dot: 'bg-sage-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    number: 'text-amber-600',
    line: 'bg-amber-200',
    dot: 'bg-amber-500',
  },
};

function HowItWorks() {
  return (
    <Section className="py-24 md:py-32 bg-surface-warm" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16 md:mb-20">
          <span className="inline-block font-heading text-xs font-semibold text-sage-600 tracking-widest uppercase mb-4">
            The Process
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight">
            {HOW_IT_WORKS.title}
          </h2>
          <p className="mt-4 font-body text-lg text-charcoal-500 max-w-xl mx-auto">
            {HOW_IT_WORKS.subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          className="relative max-w-3xl mx-auto"
        >
          {/* Vertical connector line (desktop) */}
          <div className="hidden md:block absolute left-8 top-6 bottom-6 w-px bg-gradient-to-b from-primary-200 via-sage-200 to-primary-200" />

          {HOW_IT_WORKS.steps.map((step, idx) => {
            const colors = stepColorMap[step.color] || stepColorMap.primary;
            return (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={idx}
                className={`relative flex items-start gap-6 md:gap-8 ${idx < HOW_IT_WORKS.steps.length - 1 ? 'mb-8 md:mb-12' : ''}`}
              >
                {/* Number circle */}
                <div className="flex-shrink-0 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <span className={`font-heading font-bold text-xl ${colors.number}`}>
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 pt-1"
                >
                  <h3 className="font-heading font-bold text-xl text-charcoal-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-charcoal-500 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow connector between steps */}
                {idx < HOW_IT_WORKS.steps.length - 1 && (
                  <div className="hidden md:flex absolute left-8 -bottom-6 md:-bottom-8 w-px h-8 md:h-12 items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${colors.dot} absolute -bottom-1`} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROLES SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function RolesSection() {
  return (
    <Section className="py-24 md:py-32 bg-white" id="roles">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16 md:mb-20">
          <span className="inline-block font-heading text-xs font-semibold text-primary-500 tracking-widest uppercase mb-4">
            For Everyone
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight">
            {ROLES.title}
          </h2>
          <p className="mt-4 font-body text-lg text-charcoal-500 max-w-xl mx-auto">
            {ROLES.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {ROLES.cards.map((card, idx) => (
            <motion.div
              key={card.role}
              variants={scaleIn}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative bg-white border border-charcoal-150 rounded-2xl p-7 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="text-primary-500 mb-5">
                <card.icon className="w-10 h-10" />
              </div>

              {/* Role name */}
              <h3 className="font-heading font-bold text-lg text-charcoal-950 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                {card.role}
              </h3>

              {/* Description */}
              <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-5">
                {card.description}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {card.highlights.map((tag) => (
                  <span
                    key={tag}
                    className="font-heading text-xs font-medium text-sage-700 bg-sage-50 border border-sage-100 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURES GRID
   ═══════════════════════════════════════════════════════════════════════ */

function FeaturesGrid() {
  return (
    <Section className="py-24 md:py-32 bg-surface-warm" id="features">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div variants={fadeUp} className="text-center mb-16 md:mb-20">
          <span className="inline-block font-heading text-xs font-semibold text-sage-600 tracking-widest uppercase mb-4">
            Features
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-charcoal-950 tracking-tight">
            {FEATURES.title}
          </h2>
          <p className="mt-4 font-body text-lg text-charcoal-500 max-w-xl mx-auto">
            {FEATURES.subtitle}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.items.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group bg-white rounded-2xl border border-charcoal-100 p-7 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-5 group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="font-heading font-bold text-lg text-charcoal-950 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="font-body text-sm text-charcoal-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
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
                <Link
                  to={CTA.buttonHref}
                  className="inline-flex items-center gap-2 font-heading text-base font-semibold text-charcoal-950 bg-white hover:bg-charcoal-50 px-8 py-3.5 rounded-full shadow-lg transition-colors duration-200"
                >
                  {CTA.buttonLabel}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
                      href={link.href}
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
