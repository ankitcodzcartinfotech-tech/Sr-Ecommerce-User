import PolicyLayout from '@/components/common/PolicyLayout';

export const metadata = {
  title: "Return & Refund Policy | SR Ecommerce",
  description: "Read the SR Return & Refund Policy to understand our return guidelines and processes.",
};

export default function ReturnPolicyPage() {
  const sections = [
    {
      id: 'eligibility',
      title: '1. Return Eligibility',
      content: (
        <>
          <p>You may request a return if:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>The product received is damaged or defective.</li>
            <li>You received an incorrect product.</li>
            <li>The product has a manufacturing defect.</li>
          </ul>
          <p>To be eligible for a return:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The request must be made within 7 days of delivery.</li>
            <li>The product must be unused, unwashed, and in its original condition.</li>
            <li>All original tags, packaging, invoices, and accessories must be included.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'non-returnable',
      title: '2. Non-Returnable Items',
      content: (
        <>
          <p>The following items cannot be returned:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Products used or washed after delivery.</li>
            <li>Sarees altered or customized according to customer requirements.</li>
            <li>Gift cards or promotional items.</li>
            <li>Products damaged due to customer misuse.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'damaged-wrong',
      title: '3. Damaged or Wrong Product',
      content: (
        <>
          <p>If you receive a damaged, defective, or incorrect product:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Contact us within 48 hours of delivery.</li>
            <li>Share your order number.</li>
            <li>Upload clear photos or videos of the product and packaging.</li>
          </ul>
          <p>After verification, we will arrange a replacement or refund.</p>
        </>
      ),
    },
    {
      id: 'refund-process',
      title: '4. Refund Process',
      content: (
        <>
          <p>Once the returned product is received and inspected:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Approved refunds will be processed within 5–7 business days.</li>
            <li>Refunds will be credited to the original payment method.</li>
            <li>COD refunds will be transferred to your provided bank account.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'return-shipping',
      title: '5. Return Shipping',
      content: (
        <>
          <p>
            If the return is due to our mistake (wrong, damaged, or defective product), return shipping costs will be borne by SR Ecommerce.
          </p>
          <p>
            For other approved returns, shipping charges may be deducted from the refund.
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '6. Contact Us',
      content: (
        <>
          <p className="mb-4">If you have any questions regarding returns or refunds, please contact our customer support.</p>
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mt-4">
            <p className="font-semibold text-stone-900 mb-2">SR Ecommerce</p>
            <p className="mb-1"><strong>Email:</strong> support@srecommerce.com</p>
            <p className="mb-1"><strong>Phone:</strong> +91 98246 76060</p>
            <p className="mt-2"><strong>Address:</strong><br />Ground Floor, Raghuvir Scarlett, G-59,<br />Nr. DMD Logistic Park, Saroli,<br />Surat, Gujarat 395010</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Return & Refund Policy"
      description="At SR Ecommerce, customer satisfaction is our priority. If you are not completely satisfied with your purchase, please review our return and refund policy below."
      date="July 1, 2026"
      sections={sections}
    />
  );
}
