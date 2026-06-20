import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
return (
<>
 <Header />
  <main className="bg-gray-50 min-h-screen py-10">
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8">

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Return Policy
      </h1>

      <p className="text-sm text-gray-500 mb-8">
        Effective Date: 1st June, 2026
      </p>

      <p className="text-gray-700 leading-relaxed">
        As Glazia deals in customized and made-to-order products including aluminium profiles, doors, windows, glass, hardware, and related materials, returns are subject to the following conditions:
      </p>

    
      <h2 className="text-xl font-semibold mt-8 mb-3">
        Eligible Returns
      </h2>
      <p className="text-gray-700 mb-2">
        Returns may be accepted only in the following cases:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Incorrect product supplied by Glazia.</li>
        <li>Manufacturing defects identified upon delivery.</li>
        <li>Material received in damaged condition due to transportation, subject to verification.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Non-Eligible Returns
      </h2>
      <p className="text-gray-700 mb-2">
        Returns shall not be accepted for:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Customized, fabricated, cut-to-size, or specially manufactured products.</li>
        <li>Minor color, texture, or finish variations within acceptable industry standards.</li>
        <li>Products damaged due to mishandling, improper storage, installation, or customer negligence.</li>
        <li>Returns requested after products have been installed, modified, or used.</li>
        <li>Change of mind or order cancellation after production has commenced.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-3">
        Return Request Procedure
      </h2>
      <p className="text-gray-700 mb-2">
        Customers must initiate a return request within 48 hours of receiving the material by providing:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Order number</li>
        <li>Product details</li>
        <li>Images/videos showing the issue</li>
        <li>Brief description of the concern</li>
      </ul>

      <p className="text-gray-700 mt-4">
        Glazia reserves the right to inspect and verify the claim before approving any return request.
      </p>

    </div>
  </main>

  <Footer />
</>


);
}
