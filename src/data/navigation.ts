export const MAIN_MENU = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Who we are',
    href: '#',
    children: [
      { label: 'About us', href: '/about/' },
      { label: 'Testimonials', href: '/testimonials/' },
      { label: 'FAQ', href: '/frequently-asked-questions/' },
      { label: 'Partners', href: '/partners/' },
    ],
  },
  {
    label: 'Get a Quote',
    href: '/insurance-services/',
    children: [
      { label: 'Health insurance', href: '/insurance-services/health-insurance/' },
      { label: 'Residence permit insurance', href: '/insurance-services/residence-permit-insurance/' },
      { label: 'Home insurance', href: '/insurance-services/home-insurance/' },
      { label: 'Car insurance', href: '/insurance-services/car-insurance/' },
      { label: 'Travel insurance', href: '/insurance-services/travel-insurance/' },
      { label: 'Boat insurance', href: '/insurance-services/boat-insurance/' },
      { label: 'Other', href: '/insurance-services/other-type-insurance/' },
    ],
  },
  {
    label: 'Useful Tips',
    href: '/insurance-tips-in-greece/',
  },
  {
    label: 'Contact Us',
    href: '/contact-us/',
    isButton: true,
  },
];

export const SERVICE_TYPES = [
  { slug: 'health-insurance', name: 'Health Insurance', icon: 'heart', image: '/images/services/health.insurance.jpg', heroImage: '/images/services/health.insurance.greece.jpg' },
  { slug: 'residence-permit-insurance', name: 'Residence Permit Insurance', icon: 'id-card', image: '/images/services/residence.permit.insurance.jpg', heroImage: '/images/services/residence.permit.greece.jpg' },
  { slug: 'home-insurance', name: 'Home Insurance', icon: 'home', image: '/images/services/home.insurance2.jpg', heroImage: '/images/services/home.insurance.greece.jpg' },
  { slug: 'car-insurance', name: 'Car Insurance', icon: 'car', image: '/images/services/car.insurance.jpg', heroImage: '/images/services/car.insurance.greece.jpg' },
  { slug: 'travel-insurance', name: 'Travel Insurance', icon: 'plane', image: '/images/services/travel.insurance.jpg', heroImage: '/images/services/travel.insurance.greece.jpg' },
  { slug: 'boat-insurance', name: 'Boat Insurance', icon: 'anchor', image: '/images/services/boat.insurance.jpg', heroImage: '/images/services/boat.insurance.greece.jpg' },
  { slug: 'other-type-insurance', name: 'Other Insurance', icon: 'shield', image: '/images/services/other.insurance.jpg', heroImage: '/images/services/other.type.insurance.greece.jpg' },
];

export function getServiceDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'health-insurance': 'Comprehensive private health insurance plans for expats. Meet residence permit requirements and get access to quality healthcare.',
    'home-insurance': 'Protect your property in Greece with comprehensive home insurance covering natural disasters, theft, and liability.',
    'car-insurance': 'Mandatory third-party and comprehensive car insurance for vehicles in Greece. Greek and foreign plates covered.',
    'travel-insurance': 'Travel insurance for trips within Greece and internationally. Medical coverage, trip cancellation, and more.',
    'boat-insurance': 'Marine insurance for yachts, sailboats, and motorboats in Greek waters. Hull, liability, and crew coverage.',
    'residence-permit-insurance': 'Insurance certificates required for Greek residence permits and Golden Visa applications. Fast processing available.',
    'other-type-insurance': 'Business insurance, life insurance, pet insurance, and other specialized coverage for expats in Greece.',
  };
  return descriptions[slug] || 'Expert insurance solutions tailored for expats living in Greece.';
}
