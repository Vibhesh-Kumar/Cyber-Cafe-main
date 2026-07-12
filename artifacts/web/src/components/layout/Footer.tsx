import { Link } from "wouter";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold font-serif text-secondary">
                Bihar Cyber
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Your trusted neighborhood digital service portal. Helping everyday citizens navigate government paperwork, certificates, education forms, and online payments securely.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">All Services</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors">Track Application</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">News & Updates</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary transition-colors">Portal Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bihar Cyber Café Digital Service Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
