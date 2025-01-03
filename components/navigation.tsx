"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cart } from "@/components/cart";
import { useCartStore } from "@/store/cart-store";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const items = useCartStore((state) => state.items);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 500);
    }
  }, [items.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const CartButton = ({ isMobile = false }) => (
    <Button
      variant="ghost"
      size="icon"
      className={`relative ${isMobile ? '' : 'hidden md:flex'}`}
      onClick={() => setIsCartOpen(true)}
      data-cart-icon
    >
      <motion.div
        animate={isCartBouncing ? {
          scale: [1, 2.9, 1.9, 2.7, 1],
          rotate: [0, -50, 30, -5, 0],
        } : {}}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
        }}
      >
        <ShoppingCart className="h-8 w-8" />
        {items.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center"
          >
            {items.length}
          </motion.span>
        )}
      </motion.div>
    </Button>
  );

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">
              J.Antunes
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Início
              </Link>
              <Link
                href="/produtos"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Produtos
              </Link>
              <Link
                href="/duvidas-frequentes"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Dúvidas Frequentes
              </Link>
              <Link
                href="/about"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Contato
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <CartButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <CartButton isMobile />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-neutral-900"
            >
              <div className="px-4 pt-2 pb-3 space-y-1">
                <Link
                  href="/"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Início
                </Link>
                <Link
                  href="/produtos"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Produtos
                </Link>
                <Link
                  href="/duvidas-frequentes"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dúvidas Frequentes
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sobre
                </Link>
                <Link
                  href="/contato"
                  className="block px-3 py-2 text-neutral-600 dark:text-neutral-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contato
                </Link>
                <div className="px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-8 w-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-8 w-8 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}