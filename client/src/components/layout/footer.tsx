import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">FlatFinder</h3>
            <p className="text-gray-400 mb-6">Finding your perfect home has never been easier. Browse thousands of listings, connect with property owners, and secure your next home.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/"><a className="text-gray-400 hover:text-white transition-colors">Home</a></Link></li>
              <li><Link href="/properties"><a className="text-gray-400 hover:text-white transition-colors">Explore</a></Link></li>
              <li><Link href="/add-property"><a className="text-gray-400 hover:text-white transition-colors">List a Property</a></Link></li>
              <li><Link href="/favorites"><a className="text-gray-400 hover:text-white transition-colors">Saved Properties</a></Link></li>
              <li><Link href="/dashboard"><a className="text-gray-400 hover:text-white transition-colors">Dashboard</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Property Types</h4>
            <ul className="space-y-3">
              <li><Link href="/properties?type=apartment"><a className="text-gray-400 hover:text-white transition-colors">Apartments</a></Link></li>
              <li><Link href="/properties?type=house"><a className="text-gray-400 hover:text-white transition-colors">Houses</a></Link></li>
              <li><Link href="/properties?type=studio"><a className="text-gray-400 hover:text-white transition-colors">Studios</a></Link></li>
              <li><Link href="/properties?type=condo"><a className="text-gray-400 hover:text-white transition-colors">Luxury Homes</a></Link></li>
              <li><Link href="/properties"><a className="text-gray-400 hover:text-white transition-colors">Furnished Rentals</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} FlatFinder. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-400 text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
