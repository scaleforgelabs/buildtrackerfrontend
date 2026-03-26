"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Images } from "@/public";
import { Button } from "@/app/components/ui/button";

import { useAuth } from "@/libs/hooks/useAuth";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={Images.logo}
              alt="BuildTracker Logo"
              width={32}
              height={32}
            />
            <span className="text-lg sm:text-xl font-extrabold text-[#0D0D0D] dark:text-white">
              BuildTracker
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/product" className="nav-link">
              Product
            </Link>
            <Link href="/pricing" className="nav-link">
              Plans
            </Link>
            <Link href="/business" className="nav-link">
              Business
            </Link>
            <Link href="/education" className="nav-link">
              Education
            </Link>
            <Link href="/help" className="nav-link">
              Help
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/home">
                <Button className="rounded-full px-6 h-10 bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="rounded-full px-5 h-10 border-primary text-primary hover:bg-primary/5 font-semibold"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full px-5 h-10 bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 pb-6 space-y-6">
          <div className="flex flex-col space-y-4 pt-4">
            <Link href="/product" className="mobile-link">
              Product
            </Link>
            <Link href="/pricing" className="mobile-link">
              Plans
            </Link>
            <Link href="/business" className="mobile-link">
              Business
            </Link>
            <Link href="/education" className="mobile-link">
              Education
            </Link>
            <Link href="/help" className="mobile-link">
              Help
            </Link>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            {isAuthenticated ? (
              <Link href="/home">
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-primary text-primary hover:bg-primary/5 font-semibold"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white shadow-md font-semibold">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reusable Classes */}
      <style jsx>{`
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: hsl(var(--foreground));
        }
        .mobile-link {
          font-size: 1rem;
          font-weight: 500;
          color: hsl(var(--foreground));
        }
      `}</style>
    </nav>
  );
};
