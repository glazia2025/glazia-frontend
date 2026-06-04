import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function PrivacyPolicyPage() {
  return (
     <>
      
      <Header />
    <div className="bg-gray-50 min-h-screen py-10">
        
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-10">
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: 1st June, 2026
        </p>

        {/* Intro */}
        <p className="text-gray-700 leading-relaxed mb-6">
          Welcome to Glazia ("Glazia", "we", "our", or "us"). This Privacy Policy explains how we collect, use, disclose, and protect information when you visit our website, www.glazia.in, use our services, or interact with us.
        </p>

        {/* Section 1 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>

        <h3 className="font-medium text-gray-900 mb-2">Information You Provide</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Name</li>
          <li>Company Name</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Business Address</li>
          <li>GST Number</li>
          <li>Project Information</li>
          <li>Inquiry Details</li>
          <li>Any information submitted through forms, emails, WhatsApp, or other communication channels</li>
        </ul>

        <h3 className="font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>IP Address</li>
          <li>Browser Type</li>
          <li>Device Information</li>
          <li>Operating System</li>
          <li>Pages Visited</li>
          <li>Time Spent on Website</li>
          <li>Referring Website</li>
          <li>Cookies and Similar Technologies</li>
        </ul>

        {/* Section 2 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Information</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Respond to inquiries and requests</li>
          <li>Provide quotations and proposals</li>
          <li>Process orders and transactions</li>
          <li>Manage dealer and fabricator relationships</li>
          <li>Improve website functionality and user experience</li>
          <li>Send product updates and marketing communications</li>
          <li>Conduct market research and analytics</li>
          <li>Prevent fraud and unauthorized activity</li>
          <li>Comply with legal obligations</li>
        </ul>

        {/* Section 3 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">3. Sharing of Information</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          We do not sell personal information.
        </p>
        <p className="text-gray-700 leading-relaxed mb-2">
          We may share information with:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Suppliers and logistics partners</li>
          <li>Service providers and technology vendors</li>
          <li>Professional advisors</li>
          <li>Government authorities when legally required</li>
          <li>Potential investors or acquirers in connection with business transactions</li>
        </ul>

        <p className="text-gray-700 mt-3">
          All such parties are required to protect your information appropriately.
        </p>

        {/* Section 4 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Retention</h2>
        <p className="text-gray-700 leading-relaxed">
          We retain information only for as long as necessary to fulfill business purposes, comply with legal requirements, resolve disputes, and enforce agreements.
        </p>

        {/* Section 5 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Security</h2>
        <p className="text-gray-700 leading-relaxed">
          We implement reasonable technical and organizational measures to protect information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet can be guaranteed to be completely secure.
        </p>

        {/* Section 6 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">6. Marketing Communications</h2>
        <p className="text-gray-700 mb-2">
          You may receive marketing communications from us.
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Clicking the unsubscribe link in emails</li>
          <li>Contacting us directly</li>
        </ul>

        {/* Section 7 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">7. Your Rights</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Access your information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of information</li>
          <li>Withdraw consent where applicable</li>
        </ul>

        <p className="text-gray-700 mt-2">
          Requests may be submitted using the contact information below.
        </p>

        {/* Section 8 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">8. Third-Party Links</h2>
        <p className="text-gray-700">
          Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites.
        </p>

        {/* Section 9 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">9. Children's Privacy</h2>
        <p className="text-gray-700">
          Our services are intended for business users and individuals above 18 years of age. We do not knowingly collect information from children.
        </p>

        {/* Section 10 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to this Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy periodically. Changes become effective upon posting on this page.
        </p>

        {/* Section 11 */}
        <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact Us</h2>
       <p className="text-gray-700">
  Glazia Windoors Private Limited <br />

  Website:{" "}
  <a
    href="https://www.glazia.in"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline"
  >
    www.glazia.in
  </a>
  <br />

  Email:{" "}
  <a
    href="mailto:sales@glazia.in"
    className="text-blue-600 hover:underline"
  >
    sales@glazia.in
  </a>
  <br />

  Phone:{" "}
  <a
    href="tel:+919958053708"
    className="text-blue-600 hover:underline"
  >
    +91-9958053708
  </a>
</p>

      </div>
     
    </div>
     <Footer/>
    </>
  );
}

