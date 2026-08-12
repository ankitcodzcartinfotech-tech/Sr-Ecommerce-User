import PolicyLayout from '@/components/common/PolicyLayout';

export const metadata = {
  title: "Shipping Policy | Keshrag Premium Sarees",
  description: "Read the Keshrag Shipping Policy to understand our delivery timelines and processes.",
};

export default function ShippingPolicyPage() {
  const sections = [
    {
      id: 'order-processing',
      title: '1. Order Processing',
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Orders are processed within 1–2 business days after payment confirmation.</li>
          <li>Orders placed on Sundays or public holidays will be processed on the next business day.</li>
        </ul>
      ),
    },
    {
      id: 'delivery-time',
      title: '2. Delivery Time',
      content: (
        <>
          <p>Estimated delivery timelines:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Gujarat:</strong> 2–4 business days</li>
            <li><strong>Other Indian States:</strong> 3–7 business days</li>
            <li><strong>Remote Areas:</strong> 5–10 business days</li>
          </ul>
          <p className="mt-4">Delivery times are estimates and may vary depending on the courier service and location.</p>
        </>
      ),
    },
    {
      id: 'shipping-charges',
      title: '3. Shipping Charges',
      content: (
        <>
          <p>Shipping charges, if applicable, will be displayed during checkout before payment.</p>
          <p>Free shipping may be available on selected products or promotional offers.</p>
        </>
      ),
    },
    {
      id: 'order-tracking',
      title: '4. Order Tracking',
      content: (
        <>
          <p>Once your order is shipped, you will receive:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Order confirmation</li>
            <li>Shipping confirmation</li>
            <li>Tracking ID</li>
            <li>Courier details</li>
          </ul>
          <p className="mt-4">You can track your order using the provided tracking information.</p>
        </>
      ),
    },
    {
      id: 'delivery-delays',
      title: '5. Delivery Delays',
      content: (
        <>
          <p>Delivery may be delayed due to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Weather conditions</li>
            <li>Natural disasters</li>
            <li>Public holidays</li>
            <li>Courier delays</li>
            <li>Government restrictions</li>
            <li>Other unforeseen circumstances</li>
          </ul>
          <p className="mt-4">We appreciate your patience in such situations.</p>
        </>
      ),
    },
    {
      id: 'incorrect-address',
      title: '6. Incorrect Address',
      content: (
        <>
          <p>Customers are responsible for providing accurate shipping details.</p>
          <p>Keshrag is not responsible for delays or failed deliveries due to incorrect addresses provided by the customer.</p>
        </>
      ),
    },
    {
      id: 'contact',
      title: '7. Contact Us',
      content: (
        <>
          <p className="mb-4">For shipping-related questions, please contact our support team.</p>
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 mt-4">
            <p className="font-semibold text-stone-900 mb-2">Keshrag</p>
            <p className="mb-1"><strong>Email:</strong> support@keshrag.com</p>
            <p className="mb-1"><strong>Phone:</strong> +91 98246 76060</p>
            <p className="mt-2"><strong>Address:</strong><br />Ground Floor, Raghuvir Scarlett, G-59,<br />Nr. DMD Logistic Park, Saroli,<br />Surat, Gujarat 395010</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Shipping Policy"
      description="Thank you for shopping with Keshrag. We aim to deliver your order safely and on time. Read on to understand our delivery processes."
      date="July 1, 2026"
      sections={sections}
    />
  );
}
