import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            NeuroFlash
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-700 hover:text-primary-600">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 hover:text-primary-600">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-700 hover:text-primary-600">
              FAQ
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-primary-600">
              Login
            </Link>
            <Button primary size="sm" onClick={() => (window.location.href = '/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

