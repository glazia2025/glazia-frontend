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
              <div className="bg-blue-600 p-3 rounded-lg">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-gray-300">On windoors orders above ₹10000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">24/7 Support</h4>
                <p className="text-sm text-gray-300">Round the clock assistance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">Quality Assured</h4>
                <p className="text-sm text-gray-300">100% genuine products</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">
                GLAZIA
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for premium windoors profiles and hardware solutions.
                Creating energy-efficient and durable windoors systems since 2010.
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
                <li><Link href="/brands" className="text-gray-300 hover:text-white transition-colors">Partner Brands</Link></li>
                <li><Link href="/projects" className="text-gray-300 hover:text-white transition-colors">Project Gallery</Link></li>
                <li><Link href="/technical-support" className="text-gray-300 hover:text-white transition-colors">Technical Support</Link></li>
                <li><Link href="/installation-guides" className="text-gray-300 hover:text-white transition-colors">Installation Guides</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/track-order" className="text-gray-300 hover:text-white transition-colors">Track Your Order</Link></li>
                <li><Link href="/returns" className="text-gray-300 hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="text-gray-300 hover:text-white transition-colors">Support Center</Link></li>
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
                      456 Windoors Plaza,<br />
                      Industrial Estate Phase-II,<br />
                      Pune, Maharashtra 411019
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">+91 98765 43210</p>
                    <p className="text-gray-300">+91 98765 43211</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">info@glazia.in</p>
                    <p className="text-gray-300">support@glazia.in</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-300 mb-6">Subscribe to our newsletter for latest windoors products and technical updates</p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium transition-colors">
                Subscribe
              </button>
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
