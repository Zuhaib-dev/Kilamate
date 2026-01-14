import type { PropsWithChildren } from "react";
import { Header } from "./header";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className=" bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="min-h-screen container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12">
        <div className="container mx-auto px-4 text-center text-gray-700 dark:text-gray-300">
          <p>
            Made with <span className="text-2xl">💗</span> by 
            <span id="owner">
              <a href="https://www.zuhaibrashid.com/" target="_blank">
                Zuhaib Rashid
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
