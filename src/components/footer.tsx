import { Github, Twitter, Linkedin, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainerFast } from "@/lib/animations";

const socialVariant = {
  hidden: { opacity: 0, y: 12, scale: 0.85 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 24 } },
};

export function Footer() {
  return (
    <motion.footer
      className="relative border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 200, damping: 28 }}
    >
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Crafted by */}
        <motion.div
          className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 250, damping: 28, delay: 0.1 }}
        >
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            Crafted with
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-red-500 drop-shadow-sm" />
            </motion.span>
            by
            <a
              href="https://www.zuhaibrashid.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hover:from-primary hover:to-primary/70 transition-all duration-300 ml-1 group"
            >
              Zuhaib Rashid
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          </p>
        </motion.div>

        {/* Social icons — stagger in */}
        <motion.div
          className="flex items-center gap-5"
          variants={staggerContainerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { href: "https://github.com/zuhaib-dev", Icon: Github, label: "GitHub" },
            { href: "https://x.com/xuhaib_x9", Icon: Twitter, label: "Twitter" },
            { href: "https://www.linkedin.com/in/zuhaib-rashid-661345318/", Icon: Linkedin, label: "LinkedIn" },
            { href: "https://www.zuhaibrashid.com/", Icon: Globe, label: "Portfolio" },
          ].map(({ href, Icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              variants={socialVariant}
              whileHover={{ scale: 1.25, y: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative text-muted-foreground hover:text-foreground group"
            >
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Icon className="h-5 w-5 relative z-10" />
              <span className="sr-only">{label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </motion.footer>
  );
}
