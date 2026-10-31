import { useEffect, useRef, useState, createContext, useContext } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "motion/react";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  X,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  Code2,
  Smartphone,
  Layers3,
  MousePointer2,
} from "lucide-react";

// Context for global cursor parallax coordinates
const ParallaxContext = createContext({
  springX: null,
  springY: null,
});

// Project data structure
const projects = [
  {
    number: "01",
    name: "HiringBase",
    category: "AI-Powered Recruitment Platform",
    description:
      "An intelligent resume matching and applicant tracking platform that helps recruiters discover relevant candidates through AI-powered CV analysis and candidate ranking.",
    stack: ["React", "Flutter", "AI Integration"],
    image: "/images/projects/hiringbase.png",
    className: "project-lavender",
  },
  {
    number: "02",
    name: "Bunda Care",
    category: "Maternal & Child Nutrition Application",
    description:
      "A mobile application designed to support nutritional awareness for mothers and children through intelligent recommendations, food scanning, and digital education.",
    stack: ["Flutter", "UI/UX", "AI Integration"],
    visual: "B",
    className: "project-peach",
  },
];

// Tech stack skills - strictly preserved
const skills = [
  { name: "React", category: "Frontend", icon: Code2 },
  { name: "Tailwind CSS", category: "Styling", icon: Layers3 },
  { name: "Flutter", category: "Mobile", icon: Smartphone },
  { name: "JavaScript", category: "Language", icon: Code2 },
  { name: "Python", category: "Language", icon: Code2 },
  { name: "UI / UX", category: "Design", icon: MousePointer2 },
];

/* =========================================================================
   INTERACTIVE UTILITIES & MICRO-INTERACTIONS
   ========================================================================= */

// Top page scroll progress bar
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

// Magnetic Button / Element Wrapper
function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 280, damping: 20, mass: 0.15 });
  const springY = useSpring(y, { stiffness: 280, damping: 20, mass: 0.15 });

  const handleMouseMove = (e) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic-wrap ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

// Custom Cursor Follower for Desktop
function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState("default");
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { damping: 26, stiffness: 320, mass: 0.4 });
  const springY = useSpring(mouseY, { damping: 26, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    const onMouseOver = (e) => {
      const target = e.target;
      const projectCard = target.closest(".project-card");
      const floatingBadge = target.closest(".floating-glass-badge");
      const magneticBtn = target.closest(
        ".button-primary, .contact-button, .nav-cta, .project-arrow"
      );
      const interactiveEl = target.closest("a, button, .skill-card, [role='button']");

      if (projectCard) {
        setVariant("project");
        setCursorText("VIEW");
      } else if (floatingBadge) {
        setVariant("hover");
        setCursorText("");
      } else if (magneticBtn) {
        setVariant("button");
        setCursorText("");
      } else if (interactiveEl) {
        setVariant("hover");
        setCursorText("");
      } else {
        setVariant("default");
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <div
      className={`cursor-container ${isVisible ? "cursor-visible" : "cursor-hidden"}`}
      aria-hidden="true"
    >
      <motion.div
        className="custom-cursor-dot"
        style={{
          x: mouseX,
          y: mouseY,
        }}
      />
      <motion.div
        className={`custom-cursor-ring cursor-${variant}`}
        style={{
          x: springX,
          y: springY,
        }}
      >
        {cursorText && <span className="cursor-text">{cursorText}</span>}
      </motion.div>
    </div>
  );
}

// Reveal animation container on scroll
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Masked text word-by-word reveal for headlines
function MaskedHeading({ title, accent, className = "" }) {
  const words = title.split(" ");

  return (
    <h2 className={className}>
      {words.map((word, i) => (
        <span key={i} className="masked-word-wrap">
          <motion.span
            className="masked-word"
            initial={{ y: "115%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.75,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}{" "}
          </motion.span>
        </span>
      ))}
      {accent && (
        <span className="masked-word-wrap">
          <motion.em
            className="masked-word"
            initial={{ y: "115%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: words.length * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {accent}
          </motion.em>
        </span>
      )}
    </h2>
  );
}

function SectionHeading({ index, label, title, accent }) {
  return (
    <div className="section-heading">
      <div className="section-index">
        <span>{index}</span>
        <span className="index-rule" />
        <span>{label}</span>
      </div>
      <MaskedHeading title={title} accent={accent} />
    </div>
  );
}

/* =========================================================================
   FLOATING VISUAL ELEMENTS SYSTEM (WHITESPACE ENHANCEMENT)
   ========================================================================= */

// A. Floating Frosted Glass Micro-Card / Badge
function FloatingGlassBadge({ icon: Icon, text, style, parallaxFactor = 16, floatDuration = 6.5 }) {
  const { springX, springY } = useContext(ParallaxContext);
  const px = useTransform(springX, (v) => v * parallaxFactor);
  const py = useTransform(springY, (v) => v * parallaxFactor);

  return (
    <motion.div
      className="floating-glass-badge"
      style={{
        ...style,
        x: px,
        y: py,
      }}
      animate={{
        translateY: [0, -9, 0],
        rotate: [0, 1.4, 0],
      }}
      transition={{
        duration: floatDuration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.05,
        y: -4,
      }}
    >
      {Icon && <Icon size={13} className="badge-icon" />}
      <span>{text}</span>
      <span className="badge-glow-dot" />
    </motion.div>
  );
}

// B. Orbital Ring with Revolving Satellite Dot
function FloatingOrbitalRing({
  size = 130,
  speed = 18,
  dashed = false,
  style,
  parallaxFactor = 12,
}) {
  const { springX, springY } = useContext(ParallaxContext);
  const px = useTransform(springX, (v) => v * parallaxFactor);
  const py = useTransform(springY, (v) => v * parallaxFactor);

  return (
    <motion.div
      className={`floating-orbital-container ${dashed ? "orbital-dashed" : ""}`}
      style={{
        width: size,
        height: size,
        ...style,
        x: px,
        y: py,
      }}
      aria-hidden="true"
    >
      <div className="orbital-track" />
      <motion.div
        className="orbital-arm"
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        <span className="orbital-satellite-dot" />
      </motion.div>
    </motion.div>
  );
}

// C. Translucent Lavender Glowing Sphere
function FloatingTranslucentOrb({ size = 52, style, parallaxFactor = 14, floatDuration = 7.5 }) {
  const { springX, springY } = useContext(ParallaxContext);
  const px = useTransform(springX, (v) => v * parallaxFactor);
  const py = useTransform(springY, (v) => v * parallaxFactor);

  return (
    <motion.div
      className="floating-translucent-orb"
      style={{
        width: size,
        height: size,
        ...style,
        x: px,
        y: py,
      }}
      animate={{
        translateY: [0, -11, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{
        duration: floatDuration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    />
  );
}

// D. Abstract 3D Geometric Facet / Diamond
function FloatingAbstractFacet({ style, parallaxFactor = 15 }) {
  const { springX, springY } = useContext(ParallaxContext);
  const px = useTransform(springX, (v) => v * parallaxFactor);
  const py = useTransform(springY, (v) => v * parallaxFactor);

  return (
    <motion.div
      className="floating-abstract-facet"
      style={{
        ...style,
        x: px,
        y: py,
      }}
      animate={{
        rotateY: [0, 180, 360],
        translateY: [0, -8, 0],
      }}
      transition={{
        rotateY: { duration: 16, repeat: Infinity, ease: "linear" },
        translateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      }}
      aria-hidden="true"
    >
      <span className="facet-shape">✦</span>
      <span className="facet-ring" />
    </motion.div>
  );
}

// E. Oversized Background Typography
function OversizedBackgroundWord({ word, speed = 35, align = "right", style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  return (
    <div
      ref={ref}
      className={`oversized-word-wrap word-align-${align}`}
      style={style}
      aria-hidden="true"
    >
      <motion.span style={{ y }} className="oversized-word-text">
        {word}
      </motion.span>
    </div>
  );
}

/* =========================================================================
   CURATED TRANSITION BANDS (2-4 FLOATING ELEMENTS PER ZONE)
   ========================================================================= */

// Zone 1: Between About Me and Tech Stack
function TransitionZoneAboutToStack() {
  return (
    <div className="floating-transition-zone zone-about-stack" aria-hidden="true">
      <OversizedBackgroundWord word="EXPLORE" align="right" style={{ top: "-30px" }} />
      <FloatingTranslucentOrb
        size={50}
        style={{ left: "8%", top: "35px" }}
        parallaxFactor={-14}
        floatDuration={7}
      />
      <FloatingOrbitalRing
        size={120}
        speed={20}
        dashed={true}
        style={{ right: "12%", top: "10px" }}
        parallaxFactor={12}
      />
      <FloatingGlassBadge
        icon={Sparkles}
        text="THOUGHTFUL DESIGN"
        style={{ right: "22%", top: "50px" }}
        parallaxFactor={18}
        floatDuration={6.2}
      />
    </div>
  );
}

// Zone 2: Between Tech Stack and Selected Works
function TransitionZoneStackToWorks() {
  return (
    <div className="floating-transition-zone zone-stack-works" aria-hidden="true">
      <OversizedBackgroundWord word="CREATE" align="left" style={{ top: "-25px" }} />
      <FloatingAbstractFacet
        style={{ right: "10%", top: "35px" }}
        parallaxFactor={15}
      />
      <FloatingGlassBadge
        icon={Code2}
        text="MODERN SYSTEMS"
        style={{ left: "14%", top: "45px" }}
        parallaxFactor={-18}
        floatDuration={7.4}
      />
      <FloatingOrbitalRing
        size={135}
        speed={17}
        dashed={false}
        style={{ left: "38%", top: "15px" }}
        parallaxFactor={-10}
      />
    </div>
  );
}

// Zone 3: Between Selected Works and The Journey So Far
function TransitionZoneWorksToJourney() {
  return (
    <div className="floating-transition-zone zone-works-journey" aria-hidden="true">
      <OversizedBackgroundWord word="INNOVATE" align="right" style={{ top: "-30px" }} />
      <FloatingGlassBadge
        icon={Smartphone}
        text="USER EXPERIENCE"
        style={{ left: "11%", top: "45px" }}
        parallaxFactor={-16}
        floatDuration={6.8}
      />
      <FloatingOrbitalRing
        size={125}
        speed={22}
        dashed={true}
        style={{ right: "15%", top: "15px" }}
        parallaxFactor={14}
      />
      <FloatingTranslucentOrb
        size={46}
        style={{ right: "32%", top: "40px" }}
        parallaxFactor={10}
        floatDuration={8}
      />
    </div>
  );
}

/* =========================================================================
   HEADER & NAVIGATION
   ========================================================================= */

function Header({ activeSection }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["About", "#about", "about"],
    ["Works", "#works", "works"],
    ["Journey", "#journey", "journey"],
    ["Contact", "#contact", "contact"],
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Abdell Muwaffaq N. home">
        <span className="brand-mark">A.</span>
        <span>abdell<span className="brand-dot">.</span></span>
      </a>

      <nav className="nav-links desktop-nav">
        {links.map(([label, href, id]) => {
          const isActive = activeSection === id;
          return (
            <a
              key={label}
              href={href}
              className={`nav-link-item ${isActive ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, href)}
            >
              <span>{label}</span>
              <motion.span
                className="nav-hover-bar"
                layoutId="nav-underline"
                style={{ transformOrigin: "left" }}
              />
            </a>
          );
        })}

        <Magnetic strength={0.32}>
          <a
            className="nav-cta"
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
          >
            Let's talk <ArrowUpRight size={14} className="nav-cta-arrow" />
          </a>
        </Magnetic>
      </nav>

      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-nav-drawer"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-nav-inner">
              {links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="mobile-nav-link"
                  onClick={(e) => handleNavClick(e, href)}
                >
                  {label}
                </a>
              ))}
              <a
                className="button-primary mobile-cta"
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
              >
                Let's talk <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* =========================================================================
   HERO SECTION
   ========================================================================= */

function Hero() {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 75]);
  const shapeRotate = useTransform(scrollYProgress, [0, 1], [0, 38]);
  const shapeRotateReverse = useTransform(scrollYProgress, [0, 1], [0, -32]);

  const heroNormX = useMotionValue(0);
  const heroNormY = useMotionValue(0);

  const portraitRotateX = useSpring(useTransform(heroNormY, [-0.5, 0.5], [6, -6]), {
    stiffness: 240,
    damping: 24,
  });
  const portraitRotateY = useSpring(useTransform(heroNormX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 240,
    damping: 24,
  });
  const portraitTransX = useSpring(useTransform(heroNormX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 240,
    damping: 24,
  });

  const innerImgX = useSpring(useTransform(heroNormX, [-0.5, 0.5], [8, -8]), {
    stiffness: 240,
    damping: 24,
  });
  const innerImgY = useSpring(useTransform(heroNormY, [-0.5, 0.5], [6, -6]), {
    stiffness: 240,
    damping: 24,
  });

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotOpacity = useMotionValue(0);

  const handleHeroMouseMove = (e) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    heroNormX.set(x / rect.width - 0.5);
    heroNormY.set(y / rect.height - 0.5);

    spotX.set(x);
    spotY.set(y);
    spotOpacity.set(1);
  };

  const handleHeroMouseLeave = () => {
    heroNormX.set(0);
    heroNormY.set(0);
    spotOpacity.set(0);
  };

  return (
    <section
      className="hero section-shell"
      id="top"
      ref={heroRef}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      <motion.div
        className="hero-spotlight"
        style={{
          background: useTransform(
            [spotX, spotY],
            ([x, y]) =>
              `radial-gradient(650px circle at ${x}px ${y}px, rgba(110, 140, 251, 0.08), transparent 70%)`
          ),
          opacity: spotOpacity,
        }}
      />

      <div className="hero-meta">
        <span><i className="status-dot" /> OPEN TO OPPORTUNITIES</span>
        <span>BASED IN INDONESIA · 2026</span>
      </div>

      <div className="hero-grid">
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            HELLO, I'M ABDELL MUWAFFAQ N.
          </motion.p>

          <div className="hero-heading">
            <div className="heading-line">
              <motion.span
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                I build
              </motion.span>
            </div>
            <div className="heading-line accent-line">
              <motion.span
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                digital
              </motion.span>
            </div>
            <div className="heading-line">
              <motion.span
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                experiences<span className="period">.</span>
              </motion.span>
            </div>
          </div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8 }}
          >
            Frontend developer crafting thoughtful web & mobile experiences through code, creativity, and curiosity.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}
          >
            <Magnetic strength={0.35}>
              <motion.a
                className="button-primary"
                href="#works"
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                Explore my work <ArrowUpRight size={17} className="btn-arrow" />
              </motion.a>
            </Magnetic>

            <Magnetic strength={0.25}>
              <a className="text-link" href="#about">
                More about me <ArrowDown size={15} />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="hero-art">
          <motion.div className="orbit orbit-one" style={{ rotate: shapeRotate }} />
          <motion.div className="orbit orbit-two" style={{ rotate: shapeRotateReverse }} />

          <motion.div
            className="hero-sticker"
            animate={{ rotate: [0, 8, 0], y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, rotate: 12 }}
          >
            <Sparkles size={18} />
            <span>DESIGN<br />MEETS CODE</span>
          </motion.div>

          <motion.div
            className="hero-floating-chip"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            whileHover={{ scale: 1.06, y: -4 }}
          >
            <Smartphone size={13} className="chip-icon" />
            <span>Web & Mobile</span>
          </motion.div>

          <motion.div
            className="portrait-frame"
            style={{
              y: imageY,
              rotateX: portraitRotateX,
              rotateY: portraitRotateY,
              x: portraitTransX,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="/images/profile.jpg"
              alt="Portrait of Abdell Muwaffaq N."
              className="portrait-img"
              loading="eager"
              style={{
                x: innerImgX,
                y: innerImgY,
              }}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(".jpeg")) {
                  e.currentTarget.src = "/images/profile.jpeg";
                }
              }}
            />
            <div className="portrait-caption">
              <span>FRONTEND DEVELOPER</span>
              <span>INDONESIA</span>
            </div>
          </motion.div>

          <motion.div
            className="floating-cross"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          >
            ✳
          </motion.div>

          <div className="hero-side-note">DIGITAL CRAFT · FRONTEND · UI/UX</div>
        </div>
      </div>

      <div className="hero-bottom">
        <span>SCROLL TO EXPLORE</span>
        <span className="scroll-line" />
        <span>01 — 06</span>
      </div>
    </section>
  );
}

function Marquee() {
  const words = "CREATIVE DEVELOPMENT ✳ FRONTEND ENGINEERING ✳ DIGITAL EXPERIENCES ✳ UI / UX ✳ ";
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i}>{words}</span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   ABOUT SECTION
   ========================================================================= */

function About() {
  return (
    <section className="about section-shell section-pad" id="about">
      <SectionHeading
        index="01"
        label="A LITTLE INTRODUCTION"
        title="Curious by nature."
        accent="Developer by choice."
      />
      <div className="about-grid">
        <Reveal className="about-note">
          <span className="quote-mark">“</span>
          <p>
            I believe great digital products live at the intersection of thoughtful design and purposeful technology.
          </p>
          <span className="note-signature">— Abdel</span>
        </Reveal>

        <Reveal delay={0.12} className="about-copy">
          <p className="large-copy">
            I'm a frontend developer who enjoys turning ideas into meaningful digital experiences. My focus is on building web and mobile applications with clean interfaces, thoughtful interactions, and user-centered design.
          </p>
          <p>
            Through academic projects and hands-on development, I've explored different technologies, collaborated with teams, and continuously improved my approach to creating digital products.
          </p>
          <p>
            I'm always curious about new technologies, especially how AI can enhance the way we build and experience applications.
          </p>
          <Magnetic strength={0.25} className="mt-2">
            <a className="underlined-link" href="#contact">
              A little more? Let's connect <ArrowUpRight size={16} />
            </a>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================================
   TECH STACK SECTION (EXPERTISE)
   ========================================================================= */

function Expertise() {
  return (
    <section className="expertise section-shell section-pad">
      <SectionHeading
        index="02"
        label="WHAT I WORK WITH"
        title="Tools for turning"
        accent="ideas into reality."
      />
      <div className="skill-grid">
        {skills.map((skill, i) => {
          const Icon = skill.icon;
          return (
            <Reveal delay={i * 0.06} key={skill.name}>
              <motion.div
                className="skill-card"
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  rotate: i % 2 ? 0.8 : -0.8,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <motion.div
                  className="skill-icon"
                  whileHover={{ rotate: 10, scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <Icon size={22} strokeWidth={1.6} />
                </motion.div>
                <div>
                  <h3>{skill.name}</h3>
                  <span>{skill.category}</span>
                </div>
                <ArrowUpRight className="skill-arrow" size={17} />
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   WORKS / PROJECTS SECTION
   ========================================================================= */

function ProjectCard3D({ project, delay = 0 }) {
  const cardRef = useRef(null);

  const normX = useMotionValue(0);
  const normY = useMotionValue(0);

  const rotateX = useSpring(useTransform(normY, [-0.5, 0.5], [6.5, -6.5]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(normX, [-0.5, 0.5], [-6.5, 6.5]), {
    stiffness: 260,
    damping: 22,
  });

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotOpacity = useMotionValue(0);

  const innerX = useSpring(useTransform(normX, [-0.5, 0.5], [-9, 9]), {
    stiffness: 260,
    damping: 22,
  });
  const innerY = useSpring(useTransform(normY, [-0.5, 0.5], [-9, 9]), {
    stiffness: 260,
    damping: 22,
  });

  const handleMouseMove = (e) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    normX.set(x / rect.width - 0.5);
    normY.set(y / rect.height - 0.5);

    spotX.set(x);
    spotY.set(y);
    spotOpacity.set(1);
  };

  const handleMouseLeave = () => {
    normX.set(0);
    normY.set(0);
    spotOpacity.set(0);
  };

  return (
    <Reveal delay={delay}>
      <div className="project-card-3d-perspective">
        <motion.article
          ref={cardRef}
          className={`project-card ${project.className}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          whileTap={{ scale: 0.985 }}
        >
          <motion.div
            className="card-spotlight"
            style={{
              background: useTransform(
                [spotX, spotY],
                ([x, y]) =>
                  `radial-gradient(380px circle at ${x}px ${y}px, rgba(110, 140, 251, 0.15), transparent 75%)`
              ),
              opacity: spotOpacity,
            }}
          />

          <div className="project-visual">
            <div className="project-visual-top">
              <span>SELECTED PROJECT / {project.number}</span>
              <span>2024 — 2026</span>
            </div>

            {project.image ? (
              <motion.div
                className="project-image-wrapper"
                style={{
                  x: innerX,
                  y: innerY,
                  transformStyle: "preserve-3d",
                }}
              >
                <img
                  src={project.image}
                  alt={`${project.name} preview`}
                  className="project-preview-img"
                  loading="lazy"
                />
              </motion.div>
            ) : (
              <motion.div
                className="project-monogram"
                style={{
                  x: innerX,
                  y: innerY,
                }}
                whileHover={{ scale: 1.08, rotate: -7 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {project.visual}
              </motion.div>
            )}

            <div className="project-visual-bottom">
              <span>PRODUCT EXPERIENCE</span>
              <span>↗</span>
            </div>
          </div>

          <div className="project-info">
            <div>
              <span className="project-type">{project.category}</span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </div>
            <div className="project-footer">
              <div className="tag-list">
                {project.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <Magnetic strength={0.4}>
                <span className="project-arrow" aria-label={`View ${project.name}`}>
                  <ArrowUpRight size={20} className="arrow-icon" />
                </span>
              </Magnetic>
            </div>
          </div>
        </motion.article>
      </div>
    </Reveal>
  );
}

function Projects() {
  return (
    <section className="projects section-shell section-pad" id="works">
      <SectionHeading
        index="03"
        label="SELECTED WORKS"
        title="A few things I've"
        accent="helped bring to life."
      />

      <div className="project-list">
        {projects.map((project, i) => (
          <ProjectCard3D
            key={project.number}
            project={project}
            delay={i * 0.1}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   JOURNEY SECTION
   ========================================================================= */

function Journey() {
  return (
    <section className="journey section-shell section-pad" id="journey">
      <SectionHeading
        index="04"
        label="THE JOURNEY SO FAR"
        title="Learning, building,"
        accent="and growing."
      />

      <div className="journey-timeline-container">
        <div className="journey-timeline-bar" aria-hidden="true">
          <motion.div
            className="journey-timeline-fill"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <motion.div
          className="journey-row"
          whileHover={{ x: 6 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
        >
          <span className="journey-year">2022 — PRESENT</span>
          <div>
            <h3>Diploma IV · Informatics Engineering</h3>
            <p>Universitas Harkat Negeri</p>
          </div>
          <span className="journey-kind">EDUCATION</span>
        </motion.div>

        <motion.div
          className="journey-row"
          whileHover={{ x: 6 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
        >
          <span className="journey-year">ONGOING</span>
          <div>
            <h3>Frontend & Mobile Development</h3>
            <p>Building interfaces, exploring product experiences, and learning through real projects.</p>
          </div>
          <span className="journey-kind">FOCUS</span>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   CONTACT SECTION
   ========================================================================= */

function Contact() {
  const contactRef = useRef(null);
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotOpacity = useMotionValue(0);

  const handleContactMouseMove = (e) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = contactRef.current?.getBoundingClientRect();
    if (!rect) return;

    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
    spotOpacity.set(1);
  };

  const handleContactMouseLeave = () => {
    spotOpacity.set(0);
  };

  return (
    <section
      className="contact section-shell"
      id="contact"
      ref={contactRef}
      onMouseMove={handleContactMouseMove}
      onMouseLeave={handleContactMouseLeave}
    >
      <motion.div
        className="contact-spotlight"
        style={{
          background: useTransform(
            [spotX, spotY],
            ([x, y]) =>
              `radial-gradient(550px circle at ${x}px ${y}px, rgba(174, 185, 255, 0.14), transparent 70%)`
          ),
          opacity: spotOpacity,
        }}
      />

      <div className="contact-top">
        <span>HAVE AN IDEA IN MIND?</span>
        <span>LET'S MAKE IT REAL ↘</span>
      </div>

      <div className="contact-heading-wrap">
        <h2>
          Let's create<br />
          <em>something</em><br />
          meaningful<span>.</span>
        </h2>
      </div>

      <Magnetic strength={0.38}>
        <motion.a
          className="contact-button"
          href="mailto:hello@example.com"
          whileTap={{ scale: 0.98 }}
        >
          Start a conversation <ArrowUpRight size={20} className="contact-btn-arrow" />
        </motion.a>
      </Magnetic>

      <div className="contact-bottom">
        <div>
          <span className="contact-label">FIND ME HERE</span>
          <div className="social-links">
            <Magnetic strength={0.25}>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                <Github size={17} /> GitHub <ArrowUpRight size={13} />
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer">
                <Linkedin size={17} /> LinkedIn <ArrowUpRight size={13} />
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a href="mailto:hello@example.com">
                <Mail size={17} /> Email <ArrowUpRight size={13} />
              </a>
            </Magnetic>
          </div>
        </div>
        <span className="contact-location">
          BASED IN INDONESIA<br />AVAILABLE WORLDWIDE
        </span>
      </div>
    </section>
  );
}

/* =========================================================================
   FOOTER
   ========================================================================= */

function Footer() {
  return (
    <footer className="footer section-shell">
      <a className="brand" href="#top" aria-label="Abdell Muwaffaq N.">
        <span className="brand-mark">A.</span>
        <span>abdell<span className="brand-dot">.</span></span>
      </a>
      <span>DESIGNED & BUILT WITH CURIOSITY © 2026</span>
      <Magnetic strength={0.25}>
        <a href="#top" className="back-to-top">
          BACK TO TOP ↑
        </a>
      </Magnetic>
    </footer>
  );
}

/* =========================================================================
   APP ROOT WITH GLOBAL MOUSE PARALLAX PROVIDER
   ========================================================================= */

export default function App() {
  const [activeSection, setActiveSection] = useState("");

  // Global mouse coordinates for multi-plane floating parallax
  const mouseNormX = useMotionValue(0);
  const mouseNormY = useMotionValue(0);

  const springX = useSpring(mouseNormX, { stiffness: 120, damping: 24 });
  const springY = useSpring(mouseNormY, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      mouseNormX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseNormY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseNormX, mouseNormY]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.4,
    });

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: -65, duration: 1.15 });
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  // Active section observer for navigation indicator
  useEffect(() => {
    const sectionIds = ["about", "works", "journey", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ParallaxContext.Provider value={{ springX, springY }}>
      <ScrollProgressBar />
      <CustomCursor />
      <div className="grain" aria-hidden="true" />
      <Header activeSection={activeSection} />
      <main>
        <Hero />
        <Marquee />
        <About />
        <TransitionZoneAboutToStack />
        <Expertise />
        <TransitionZoneStackToWorks />
        <Projects />
        <TransitionZoneWorksToJourney />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </ParallaxContext.Provider>
  );
}
