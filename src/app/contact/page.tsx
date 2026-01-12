import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import TechnicalSpecs from "@/components/TechnicalSpecs";

export const metadata: Metadata = {
  title: "Contact Us - Glazia",
  description: "Get in touch with Glazia for windoors profiles, hardware, and glazing solutions. Expert consultation and technical support available.",
};

export default function ContactPage() {
  return (
    <div className="">
      <Header />
      
      {/* Hero Section */}
      <section className="text-white">
        <div className="relative h-64 overflow-hidden">
          <img src="/new-ui/hero.png" alt="Contact Us" className="w-full h-auto" />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute left-24 top-[50%] transform -translate-y-1/2 mx-auto px-4">
            <div className="max-w-4xl mx-auto text-left">
              <h1 className="text-3xl md:text-5xl font-[500] mb-6">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Get professional consultation, technical support, and custom quotes 
                for your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Contact Form */}
            <div className="bg-[#D9D9D9] rounded-l-lg p-12">
              <h2 className="text-3xl font-[500] text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border bg-white border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="quote">Request Quote</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="complaint">Complaint/Issue</option>
                  </select>
                </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border bg-white  border-[#B4B4B4] border-[1px]rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    required
                    className="mt-1 mr-3 h-4 w-4 text-[#124657} focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to the processing of my personal data for the purpose of responding to my inquiry. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#EE1C25] cursor-pointer hover:bg-[#EE1C25] text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-[#2F3A4F] text-white rounded-r-lg p-12">
              <h2 className="text-3xl font-[500] mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-8">
                {/* Office Address */}

                <div>
                  <h2 className="text-lg font-[500] underline">Chat to Us</h2>
                  <div className="mb-2">Our friendly team is here to help.</div>
                  <a href="mailto:sales@glazia.in"><b>sales@glazia.in</b></a>
                </div>

                <div>
                  <h2 className="text-lg font-[500] underline">Visit Us</h2>
                  <div className="mb-2">Our friendly team is here to help.</div>
                  <p><b>Near Manesar Toll Plaza, Gurgaon, Haryana - 122001</b></p>
                </div>

                <div>
                  <h2 className="text-lg font-[500] underline">Call Us</h2>
                  <div className="mb-2">Mon-Sat From 9am to 6pm</div>
                  <p><b>+91-9958053708<br />+91-9354876670</b></p>
                </div>

                <div style={{width: "100%", height: "300px", borderRadius: '12px', overflow: 'hidden'}}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{border:"0"}}
                    loading="lazy"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3712.266887090091!2d76.98408071537633!3d28.399058079436698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d3df3f3a5d4c5%3A0xb66beaf7f2aabddb!2sGlazia%20Windoors%20Private%20Limited!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin">
                  </iframe>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </section>

      <TechnicalSpecs />

      <Footer />
    </div>
  );
}
