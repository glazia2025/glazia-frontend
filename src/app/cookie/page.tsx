
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  return (
    <>
      <Header />

      <main className="bg-gray-50 min-h-screen py-10">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Cookie Policy
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Last Updated: 1st June, 2026
          </p>

          {/* Section 1 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            1. What Are Cookies?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files placed on your device when you visit a website. They help websites function properly and improve user experience.
          </p>

          {/* Section 2 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            2. How We Use Cookies
          </h2>
          <p className="text-gray-700 mb-2">
            Glazia uses cookies to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Remember user preferences</li>
            <li>Improve website performance</li>
            <li>Analyze visitor behavior</li>
            <li>Measure marketing effectiveness</li>
            <li>Enhance security</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            3. Types of Cookies We Use
          </h2>

          <h3 className="font-medium text-gray-900 mt-4 mb-2">
            Essential Cookies
          </h3>
          <p className="text-gray-700 mb-2">
            Required for basic website functionality.
          </p>
          <p className="text-gray-700 mb-2">Examples:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Security</li>
            <li>Form submissions</li>
            <li>Session management</li>
          </ul>

          <h3 className="font-medium text-gray-900 mt-4 mb-2">
            Analytics Cookies
          </h3>
          <p className="text-gray-700 mb-2">
            Help us understand website usage.
          </p>
          <p className="text-gray-700 mb-2">Examples:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Google Analytics</li>
            <li>Traffic monitoring tools</li>
          </ul>

          <h3 className="font-medium text-gray-900 mt-4 mb-2">
            Functional Cookies
          </h3>
          <p className="text-gray-700 mb-2">
            Allow enhanced functionality and personalization.
          </p>
          <p className="text-gray-700 mb-2">Examples:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Language preferences</li>
            <li>User settings</li>
          </ul>

          <h3 className="font-medium text-gray-900 mt-4 mb-2">
            Marketing Cookies
          </h3>
          <p className="text-gray-700">
            May be used to deliver relevant advertisements and track campaign performance.
          </p>

          {/* Section 4 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            4. Third-Party Cookies
          </h2>
          <p className="text-gray-700">
            Certain third-party services integrated into our website may place cookies on your device. These providers maintain their own privacy policies.
          </p>

          {/* Section 5 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            5. Managing Cookies
          </h2>
          <p className="text-gray-700 mb-2">
            Most browsers allow you to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>View cookies</li>
            <li>Delete cookies</li>
            <li>Block cookies</li>
            <li>Configure cookie preferences</li>
          </ul>
          <p className="text-gray-700 mt-2">
            Disabling cookies may affect website functionality.
          </p>

          {/* Section 6 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            6. Consent
          </h2>
          <p className="text-gray-700">
            By continuing to use our website, you consent to the use of cookies as described in this Cookie Policy. Where required by law, we will obtain consent before placing non-essential cookies.
          </p>

          {/* Section 7 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            7. Updates to this Policy
          </h2>
          <p className="text-gray-700">
            We may update this Cookie Policy periodically. Updated versions will be posted on this page.
          </p>

          {/* Section 8 */}
          <h2 className="text-xl font-semibold mt-8 mb-3">
            8. Contact
          </h2>
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
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}

