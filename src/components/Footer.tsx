import Link from "next/link";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Clock,
  Truck,
  Shield,
  CreditCard
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-[#124657} p-3 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-gray-300">On windoors orders above ₹1000000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#124657} p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">24/7 Support</h4>
                <p className="text-sm text-gray-300">Round the clock assistance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#124657' }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Quality Assured</h4>
                <p className="text-sm text-gray-300">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#124657' }}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Secure Payment</h4>
                <p className="text-sm text-gray-300">Safe & secure transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">
                GLAZIA
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for premium fenestration profiles and hardware solutions with an experience of over 25 years.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/categories/aluminium-profiles" className="text-gray-300 hover:text-white transition-colors">Aluminium Profiles</Link></li>
                <li><Link href="/categories/hardware" className="text-gray-300 hover:text-white transition-colors">Hardwares</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">
                      Near Manesar Toll Plaza, Gurgaon, Haryana - 122001 (Can we integrate google location?)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">+91 9958053708</p>
                    <p className="text-gray-300">+91 9354876670</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">sales@glazia.in</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Glazia. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
