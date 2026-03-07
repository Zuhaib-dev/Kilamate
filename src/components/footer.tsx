import { Github, Twitter, Linkedin, Globe, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            Crafted with <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse drop-shadow-sm" /> by
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
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/zuhaib-r"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 relative group"
            title="GitHub"
          >
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Github className="h-5 w-5 relative z-10" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href="https://x.com/zuhaibrashid_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 relative group"
            title="Twitter"
          >
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Twitter className="h-5 w-5 relative z-10" />
            <span className="sr-only">Twitter</span>
          </a>
          <a
            href="https://www.linkedin.com/in/zuhaibrashid/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 relative group"
            title="LinkedIn"
          >
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Linkedin className="h-5 w-5 relative z-10" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="https://www.zuhaibrashid.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 relative group"
            title="Portfolio"
          >
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Globe className="h-5 w-5 relative z-10" />
            <span className="sr-only">Portfolio</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
