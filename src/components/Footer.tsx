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
    <footer className="bg-[#2F3A4F] text-white">
      {/* Main Footer Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="text-4xl font-semibold mb-4">
                GLAZIA
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your trusted partner for premium fenestration profiles and hardware solutions with an experience of over 25 years.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-[#EE1C25] transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="https://www.linkedin.com/company/glazia-windoors-private-limited/" className="text-gray-400 hover:text-[#EE1C25] transition-colors">
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
                  <MapPin className="w-5 h-5 text-[#EE1C25] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">
                      Near Manesar Toll Plaza, Gurgaon, Haryana - 122001
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#EE1C25]" />
                  <div>
                    <p className="text-gray-300">+91 9958053708</p>
                    <p className="text-gray-300">+91 9354876670</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#EE1C25]" />
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
      <div className="bg-[#1F2933] py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              © 2024 Glazia. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link href="/privacy" className="text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
