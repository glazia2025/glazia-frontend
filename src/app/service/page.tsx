
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="bg-gray-50 min-h-screen py-10">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Terms of Service
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Last Updated: 1st June, 2026
          </p>

          {/* Section 1 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using{" "}
            <a
              href="https://www.glazia.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.glazia.in
            </a>
            , you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.
          </p>

          {/* Section 2 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. About Glazia
          </h2>
          <p className="text-gray-700 mb-3">
            Glazia provides information regarding:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Aluminium systems</li>
            <li>Windows and doors</li>
            <li>Glass solutions</li>
            <li>Hardware and accessories</li>
            <li>Smart home solutions</li>
            <li>Related construction and building material products and services</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Information on the website is for general informational purposes only.
          </p>

          {/* Section 3 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Use of Website
          </h2>
          <p className="text-gray-700 mb-2">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Use the website for unlawful purposes</li>
            <li>Attempt unauthorized access to systems</li>
            <li>Upload malicious code</li>
            <li>Interfere with website functionality</li>
            <li>Misrepresent your identity</li>
          </ul>

          {/* Section 4 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Product Information
          </h2>
          <p className="text-gray-700 mb-2">
            We strive to ensure product information is accurate. However:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Product specifications may change without notice.</li>
            <li>Product images are illustrative.</li>
            <li>Availability may vary.</li>
            <li>Quotations are subject to final confirmation.</li>
          </ul>

          {/* Section 5 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Intellectual Property
          </h2>
          <p className="text-gray-700 mb-2">
            All content including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Logos</li>
            <li>Trademarks</li>
            <li>Product descriptions</li>
            <li>Graphics</li>
            <li>Website design</li>
            <li>Text and images</li>
          </ul>
          <p className="text-gray-700 mt-2">
            are owned by or licensed to Glazia. Unauthorized use is prohibited.
          </p>

          {/* Section 6 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            6. Quotations and Orders
          </h2>
          <p className="text-gray-700 mb-2">
            Any quotation provided through the website:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Does not constitute a binding offer</li>
            <li>Is subject to stock availability</li>
            <li>May be revised without notice</li>
          </ul>
          <p className="text-gray-700 mt-2">
            A binding contract arises only after formal acceptance and confirmation by Glazia.
          </p>

          {/* Section 7 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-700 mb-2">
            To the fullest extent permitted by law, Glazia shall not be liable for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Indirect damages</li>
            <li>Consequential damages</li>
            <li>Loss of profits</li>
            <li>Loss of business opportunities</li>
            <li>Data loss</li>
          </ul>

          {/* Section 8 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            8. Disclaimer
          </h2>
          <p className="text-gray-700 mb-2">
            The website is provided on an "as is" and "as available" basis. We make no warranties regarding:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Availability</li>
            <li>Accuracy</li>
            <li>Reliability</li>
            <li>Fitness for a particular purpose</li>
          </ul>

          {/* Section 9 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            9. Third-Party Services
          </h2>
          <p className="text-gray-700">
            The website may include third-party tools, links, or integrations. Glazia is not responsible for third-party content or services.
          </p>

          {/* Section 10 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            10. Governing Law
          </h2>
          <p className="text-gray-700">
            These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Gurgaon, Haryana.
          </p>

          {/* Section 11 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            11. Contact
          </h2>
          <p className="text-gray-700">
            Glazia Windoors Private Limited <br />

            Email:{" "}
            <a
              href="mailto:sales@glazia.in"
              className="text-blue-600 hover:underline"
            >
              sales@glazia.in
            </a>
            <br />

            Website:{" "}
            <a
              href="https://www.glazia.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.glazia.in
            </a>
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}

