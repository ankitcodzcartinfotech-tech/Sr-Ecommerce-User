import PolicyLayout from '@/components/common/PolicyLayout';

export const metadata = {
  title: "Cancellation Policy | SR Ecommerce",
  description: "Read the SR Ecommerce Cancellation Policy to understand how to cancel orders.",
};

export default function CancellationPolicyPage() {
  const sections = [
    {
      id: 'order-cancellation',
      title: '1. Order Cancellation',
      content: (
        <>
          <p>Customers may cancel an order:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Before the order has been shipped.</li>
            <li>Through their account (if available) or by contacting customer support.</li>
          </ul>
          <p className="mt-4">Once an order has been dispatched, it cannot be cancelled.</p>
        </>
      ),
    },
    {
      id: 'cancellation-by-Sr Software ',
      title: '2. Cancellation by Sr Software ',
      content: (
        <>
          <p>We reserve the right to cancel any order due to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Product out of stock</li>
            <li>Pricing errors</li>
            <li>Payment verification failure</li>
            <li>Suspected fraudulent activity</li>
            <li>Technical errors</li>
          </ul>
          <p className="mt-4">If your order is cancelled by us after payment, a full refund will be issued.</p>
        </>
      ),
    },
    {
      id: 'refund-for-cancelled',
      title: '3. Refund for Cancelled Orders',
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Online payments will be refunded to the original payment method.</li>
          <li>Refunds are generally processed within 5–7 business days.</li>
          <li>COD orders do not require a refund if payment has not been collected.</li>
        </ul>
      ),
    },
    {
      id: 'changes-to-orders',
      title: '4. Changes to Orders',
      content: (
        <>
          <p>If your order has not yet been processed, you may request changes such as:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Delivery address</li>
            <li>Contact information</li>
          </ul>
          <p className="mt-4">Changes cannot be guaranteed once order processing has begun.</p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '5. Contact Us',
      content: (
        <>
          <p className="mb-4">For cancellation requests or assistance, please contact our customer support.</p>
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
      title="Cancellation Policy"
      description="At SR Ecommerce, we understand that you may need to cancel an order. Please review our cancellation policy below."
      date="July 1, 2026"
      sections={sections}
    />
  );
}
