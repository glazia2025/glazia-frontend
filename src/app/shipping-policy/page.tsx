import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPolicyPage() {
    return (
        <>
            <Header />

            <main className="bg-gray-50 min-h-screen py-10">
                <div className="w-full max-w-6xl mx-auto px-4 md:px-8">

                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        Shipping Policy
                    </h1>

                    <p className="text-sm text-gray-500 mb-8">
                        Effective Date: 1st June, 2026
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        At Glazia, we strive to ensure timely processing and delivery of all orders while maintaining the highest quality standards.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-3">
                        Order Processing
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            Orders are processed after confirmation of purchase order and receipt of applicable advance payment, if any.
                        </li>
                        <li>
                            Processing time may vary depending on product type, customization requirements, quantity, and availability of material.
                        </li>
                        <li>
                            Standard products generally require 3–7 business days for dispatch, while customized products may require additional production time.
                        </li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-8 mb-3">
                        Delivery Timeline
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            Delivery timelines are indicative and may vary based on location, logistics availability, weather conditions, transportation delays, and unforeseen circumstances.
                        </li>
                        <li>
                            Glazia will make reasonable efforts to meet committed delivery schedules; however, delays beyond our control shall not result in liability for damages or penalties.
                        </li>
                    </ul>
                    <h2 className="text-xl font-semibold mt-8 mb-3">
                        Shipping Charges
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            Shipping and transportation charges may be included separately in the invoice unless specifically agreed otherwise.
                        </li>
                        <li>
                            Any additional loading, unloading, handling, local taxes, or delivery-related charges shall be borne by the customer unless otherwise specified.
                        </li>
                    </ul>
                    <h2 className="text-xl font-semibold mt-8 mb-3">
                        Delivery & Inspection
                    </h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            Customers are advised to inspect products at the time of delivery.
                        </li>
                        <li>
                            Any visible damage, shortages, or discrepancies must be reported within 48 hours of delivery through email or written communication.
                        </li>
                        <li>
                            Claims raised after this period may not be considered.
                        </li>
                    </ul>
                </div>
            </main>

            <Footer />
        </>
    );
}