import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { usePageTitle } from '../lib/usePageTitle';

export function AboutPage() {
  usePageTitle('About Us');
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
      <div className="space-y-4">
        <Badge tone="organic">Our Story · আমাদের গল্প</Badge>
        <h1 className="font-display font-bold text-3xl text-ink">
          Rebuilding Trust Between Bangladesh’s Farms and Dhaka’s Kitchens
        </h1>
        <p className="text-base text-on-surface-variant leading-relaxed">
          In traditional supply chains, produce changes hands 4 to 6 times between Bogura or Rajshahi and Dhaka’s kitchen markets — losing days of freshness while farmers keep as little as 32% of the retail price. KrishiKotha works directly with 1,400+ verified smallholder farmers, paying 78% of the shelf price directly to growers and dispatching morning harvests straight to Tejgaon and Uttara hubs by 11:00 AM.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cream/70 rounded-card ghost-border p-5">
          <p className="font-display font-bold text-2xl text-primary tabular-nums">78%</p>
          <p className="text-xs text-on-surface-variant mt-1">Direct farm-gate share to growers</p>
        </div>
        <div className="bg-cream/70 rounded-card ghost-border p-5">
          <p className="font-display font-bold text-2xl text-primary tabular-nums">6 hrs</p>
          <p className="text-xs text-on-surface-variant mt-1">Harvest to Dhaka doorstep window</p>
        </div>
        <div className="bg-cream/70 rounded-card ghost-border p-5">
          <p className="font-display font-bold text-2xl text-primary tabular-nums">100%</p>
          <p className="text-xs text-on-surface-variant mt-1">Batch QR grower traceability</p>
        </div>
      </div>
    </div>
  );
}

export function TraceabilityPage() {
  usePageTitle('Our Traceability Protocol');
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Our Traceability' }]} />
      <h1 className="font-display font-bold text-3xl text-ink">Farm-to-Fork QR Traceability</h1>
      <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
        Every morning crate leaving Bogura, Rajshahi, Rangpur, Dinajpur, or Pabna carries a batch Trace ID (such as #BD-BG-402-TM). It records the exact grower plot, harvest timestamp, residue-screening status, and dispatch hub arrival.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {[
          { step: '01. Dawn Harvest', desc: 'Farmers pick ripe crops between 5:00 AM and 6:15 AM and log the batch.' },
          { step: '02. Hub Inspection', desc: 'Rapid formalin/carbide screening and weight grading at regional collection points.' },
          { step: '03. Doorstep Delivery', desc: 'Dispatched from Tejgaon & Uttara hubs straight to your kitchen.' },
        ].map((item) => (
          <div key={item.step} className="bg-cream/60 rounded-card ghost-border p-5">
            <h2 className="font-display font-bold text-base text-primary mb-2">{item.step}</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">{item.desc}</p>
          </div>
        ))}
      </div>
      <Button to="/product/deshi-tomato">See Live Example on Deshi Tomato</Button>
    </div>
  );
}

export function DeliverySchedulePage() {
  usePageTitle('Delivery Schedule');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Delivery Schedule' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">Dhaka Delivery Schedule</h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Orders placed before 11:00 AM Asia/Dhaka qualify for same-day Morning Dispatch (11:00 AM – 2:00 PM) or Afternoon/Evening windows across Gulshan, Banani, Dhanmondi, Uttara, Mirpur, Mohammadpur, Baridhara, and Bashundhara. Delivery is ৳60, or FREE on baskets of ৳799 and above.
      </p>
    </div>
  );
}

export function FreshnessGuaranteePage() {
  usePageTitle('Freshness Guarantee');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Freshness Guarantee' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">100% Morning Freshness Guarantee</h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Every leafy green and seasonal vegetable is harvested within 6–12 hours of reaching our Dhaka hubs. Mangoes and fruits are checked for natural ripeness with zero calcium carbide or formalin.
      </p>
    </div>
  );
}

export function RefundReturnPage() {
  usePageTitle('Refund & Return Policy');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Refund & Return Policy' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">No-Questions Replacement &amp; Refund</h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        If any produce arrives bruised, short-weighted, or below expectations, contact our hotline (+880 9612-445566) within 24 hours of delivery for an instant replacement or full credit.
      </p>
    </div>
  );
}

export function FaqPage() {
  usePageTitle('FAQ');
  const faqs = [
    {
      q: 'Do I need an account to browse or order?',
      a: 'You can browse freely without signing in. When adding to basket or checking out, you can click "Continue as Guest" in one tap or sign in with Google or Email.',
    },
    {
      q: 'How does the 15% Weekly Basket discount work?',
      a: 'Any cart containing 4 or more distinct basket-eligible vegetables or greens automatically receives 15% off those eligible items.',
    },
    {
      q: 'Is payment charged during checkout?',
      a: 'No. This site runs a demonstration checkout — no real money or mobile banking wallet is charged.',
    },
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="bg-cream/60 rounded-card ghost-border p-5">
            <h2 className="font-display font-semibold text-base text-ink mb-1.5">{f.q}</h2>
            <p className="text-sm text-on-surface-variant">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  usePageTitle('Page Not Found');
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
      <p className="font-display font-extrabold text-5xl text-primary">404</p>
      <h1 className="font-display font-bold text-2xl text-ink">This field hasn’t been planted yet</h1>
      <p className="text-sm text-on-surface-variant">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Button to="/">Back to Homepage</Button>
    </div>
  );
}
