import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RefundPolicyPage() {
return (
<>
 <Header />
  <main className="bg-gray-50 min-h-screen py-10">
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8">

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
        Refund Policy
      </h1>

      <p className="text-sm text-gray-500 mb-8">
        Effective Date: 1st June, 2026
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Refund Eligibility
      </h2>
      <p className="text-gray-700 mb-2">
        Refunds shall be processed only if:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>A return request has been approved by Glazia.</li>
        <li>Glazia is unable to replace the product within a reasonable time.</li>
        <li>Payment has been received in excess due to billing errors.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Refund Process
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Approved refunds will be processed through the original payment method or bank transfer.</li>
        <li>Refunds may take approximately 7–14 business days from approval date, depending on banking and payment systems.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Non-Refundable Cases
      </h2>
      <p className="text-gray-700 mb-2">
        No refunds shall be issued for:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Customized or made-to-order products after manufacturing has started.</li>
        <li>Delays caused by third-party logistics providers.</li>
        <li>Customer order changes after confirmation.</li>
        <li>Products damaged due to improper handling or installation after delivery.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Policy Updates
      </h2>
      <p className="text-gray-700">
        Glazia reserves the right to amend this policy at any time without prior notice.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Contact
      </h2>
      <p className="text-gray-700">
        Glazia <br />

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

        Phone: 9958053708
      </p>

    </div>
  </main>

  <Footer />
</>


);
}
