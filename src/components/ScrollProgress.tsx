import { motion, useScroll, useSpring } from "framer-motion";

/** Neon line across the very top that tracks page scroll progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001
  });
  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />;
}
