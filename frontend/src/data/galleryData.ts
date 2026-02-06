// Import all assets images
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';
import img9 from '../assets/9.jpg';
import img10 from '../assets/10.jpg';
import img11 from '../assets/11.jpg';
import img12 from '../assets/12.jpg';
import img13 from '../assets/13.jpg';
import img14 from '../assets/14.jpg';
import img15 from '../assets/15.jpg';
import img16 from '../assets/16.jpg';
import img17 from '../assets/17.jpg';
import img18 from '../assets/18.jpg';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  rating: number;
  views: number;
  likes: number;
  location: string;
  date: string;
  customerName: string;
}

export const galleryData: GalleryItem[] = [
  {
    id: '1',
    title: 'Premium RO Installation - Residential',
    description: 'Complete RO system installation in modern kitchen with under-sink mounting and dedicated faucet.',
    imageUrl: img1,
    category: 'residential',
    tags: ['RO Installation', 'Kitchen Setup', 'Under-sink', 'Premium'],
    rating: 5,
    views: 245,
    likes: 32,
    location: 'Raipur',
    date: '2024-01-15',
    customerName: 'Rajesh Sharma'
  },
  {
    id: '2',
    title: 'Commercial RO Plant Setup',
    description: 'Large-scale commercial RO plant installation for office building with 500+ employees.',
    imageUrl: img2,
    category: 'commercial',
    tags: ['Commercial', 'Large Scale', 'Office Building', 'High Capacity'],
    rating: 5,
    views: 189,
    likes: 28,
    location: 'Raipur Chattishgarh',
    date: '2024-01-20',
    customerName: 'Tech Solutions Pvt Ltd'
  },
  {
    id: '3',
    title: 'Industrial Water Treatment',
    description: 'Industrial-grade water treatment system for manufacturing facility with advanced filtration.',
    imageUrl: img3,
    category: 'industrial',
    tags: ['Industrial', 'Manufacturing', 'Advanced Filtration', 'Heavy Duty'],
    rating: 5,
    views: 156,
    likes: 21,
    location: 'Ujjain, MP',
    date: '2024-01-25',
    customerName: 'Mahakal Industries'
  },
  {
    id: '4',
    title: 'Routine Maintenance Service',
    description: 'Regular maintenance and filter replacement service ensuring optimal water quality.',
    imageUrl: img4,
    category: 'maintenance',
    tags: ['Maintenance', 'Filter Replacement', 'Service', 'Quality Check'],
    rating: 5,
    views: 203,
    likes: 35,
    location: 'Raipur C.G',
    date: '2024-02-01',
    customerName: 'Priya Patel'
  },
  {
    id: '5',
    title: 'Water Quality Testing',
    description: 'Comprehensive water quality analysis using advanced testing equipment and TDS meters.',
    imageUrl: img5,
    category: 'testing',
    tags: ['Water Testing', 'TDS Check', 'Quality Analysis', 'Lab Testing'],
    rating: 5,
    views: 178,
    likes: 24,
    location: 'Raipur C.G',
    date: '2024-02-05',
    customerName: 'Dr. Amit Verma'
  },
  {
    id: '6',
    title: 'Expert Technician Team',
    description: 'Our certified technicians working on complex RO system installation and setup.',
    imageUrl: img6,
    category: 'team',
    tags: ['Expert Team', 'Certified', 'Professional', 'Installation'],
    rating: 5,
    views: 234,
    likes: 41,
    location: 'Raipur C.G',
    date: '2024-02-10',
    customerName: 'Team Showcase'
  },
  {
    id: '7',
    title: 'Apartment Complex Installation',
    description: 'Multi-unit RO system installation for apartment complex serving 50+ families.',
    imageUrl: img7,
    category: 'residential',
    tags: ['Apartment', 'Multi-unit', 'Community', 'Large Scale'],
    rating: 5,
    views: 167,
    likes: 29,
    location: 'Raipur C.G',
    date: '2024-02-15',
    customerName: 'Green Valley Apartments'
  },
  {
    id: '8',
    title: 'Restaurant RO System',
    description: 'High-capacity RO system for restaurant ensuring pure water for cooking and drinking.',
    imageUrl: img8,
    category: 'commercial',
    tags: ['Restaurant', 'Food Service', 'High Capacity', 'Pure Water'],
    rating: 5,
    views: 145,
    likes: 19,
    location: 'Raipur C.G',
    date: '2024-02-20',
    customerName: 'Spice Garden Restaurant'
  },
  {
    id: '9',
    title: 'School Water Purification',
    description: 'Safe drinking water solution for school with child-friendly dispensers and safety features.',
    imageUrl: img9,
    category: 'institutional',
    tags: ['School', 'Child Safety', 'Educational', 'Community Service'],
    rating: 5,
    views: 198,
    likes: 37,
    location: 'Raipur C.G',
    date: '2024-02-25',
    customerName: 'Bright Future School'
  },
  {
    id: '10',
    title: 'Hospital Grade Purification',
    description: 'Medical-grade water purification system for hospital with ultra-pure water requirements.',
    imageUrl: img10,
    category: 'institutional',
    tags: ['Hospital', 'Medical Grade', 'Ultra Pure', 'Healthcare'],
    rating: 5,
    views: 176,
    likes: 26,
    location: 'Bhopal, MP',
    date: '2024-03-01',
    customerName: 'City General Hospital'
  },
  {
    id: '11',
    title: 'Emergency Repair Service',
    description: 'Quick emergency repair service for RO system breakdown with same-day resolution.',
    imageUrl: img11,
    category: 'maintenance',
    tags: ['Emergency', 'Quick Repair', 'Same Day', 'Breakdown'],
    rating: 5,
    views: 134,
    likes: 22,
    location: 'Raipur C.G',
    date: '2024-03-05',
    customerName: 'Suresh Kumar'
  },
  {
    id: '12',
    title: 'Premium Filter Replacement',
    description: 'High-quality filter replacement with genuine parts ensuring maximum purification efficiency.',
    imageUrl: img12,
    category: 'maintenance',
    tags: ['Filter Replacement', 'Genuine Parts', 'Premium', 'Efficiency'],
    rating: 5,
    views: 189,
    likes: 31,
    location: 'Raipur C.G',
    date: '2024-03-10',
    customerName: 'Meera Joshi'
  },
  {
    id: '13',
    title: 'Factory Water Treatment',
    description: 'Complete water treatment solution for textile factory with pre-treatment and RO systems.',
    imageUrl: img13,
    category: 'industrial',
    tags: ['Factory', 'Textile', 'Pre-treatment', 'Complete Solution'],
    rating: 5,
    views: 143,
    likes: 18,
    location: 'Raipur C.G',
    date: '2024-03-15',
    customerName: 'Textile Mills Ltd'
  },
  {
    id: '14',
    title: 'Home Kitchen Installation',
    description: 'Elegant under-counter RO installation in modern home kitchen with space-saving design.',
    imageUrl: img14,
    category: 'residential',
    tags: ['Home Kitchen', 'Under-counter', 'Space Saving', 'Modern'],
    rating: 5,
    views: 212,
    likes: 38,
    location: 'Ujjain, MP',
    date: '2024-03-20',
    customerName: 'Anita Gupta'
  },
  {
    id: '15',
    title: 'Office Water Cooler System',
    description: 'Integrated RO system with water cooler for office providing hot and cold pure water.',
    imageUrl: img15,
    category: 'commercial',
    tags: ['Office', 'Water Cooler', 'Hot Cold', 'Integrated'],
    rating: 5,
    views: 167,
    likes: 25,
    location: 'Raipur C.G',
    date: '2024-03-25',
    customerName: 'Digital Solutions Inc'
  },
  {
    id: '16',
    title: 'Community Water Project',
    description: 'Large community water purification project serving entire neighborhood with central system.',
    imageUrl: img16,
    category: 'community',
    tags: ['Community', 'Neighborhood', 'Central System', 'Social Service'],
    rating: 5,
    views: 198,
    likes: 42,
    location: 'Raipur C.G',
    date: '2024-03-30',
    customerName: 'Residents Welfare Association'
  },
  {
    id: '17',
    title: 'Advanced Testing Laboratory',
    description: 'State-of-the-art water testing laboratory with latest equipment for comprehensive analysis.',
    imageUrl: img17,
    category: 'testing',
    tags: ['Laboratory', 'Advanced Testing', 'Equipment', 'Analysis'],
    rating: 5,
    views: 156,
    likes: 23,
    location: 'Raipur C.G',
    date: '2024-04-01',
    customerName: 'Water Quality Lab'
  },
  {
    id: '18',
    title: 'Customer Satisfaction Story',
    description: 'Happy customer family enjoying pure, safe drinking water from our premium RO system.',
    imageUrl: img18,
    category: 'testimonial',
    tags: ['Customer', 'Satisfaction', 'Family', 'Pure Water'],
    rating: 5,
    views: 223,
    likes: 45,
    location: 'Raipur C.G',
    date: '2024-04-05',
    customerName: 'The Sharma Family'
  }
];

export const categories = [
  { id: 'all', name: 'All Projects', count: galleryData.length },
  { id: 'residential', name: 'Residential', count: galleryData.filter(item => item.category === 'residential').length },
  { id: 'commercial', name: 'Commercial', count: galleryData.filter(item => item.category === 'commercial').length },
  { id: 'industrial', name: 'Industrial', count: galleryData.filter(item => item.category === 'industrial').length },
  { id: 'institutional', name: 'Institutional', count: galleryData.filter(item => item.category === 'institutional').length },
  { id: 'maintenance', name: 'Maintenance', count: galleryData.filter(item => item.category === 'maintenance').length },
  { id: 'testing', name: 'Testing', count: galleryData.filter(item => item.category === 'testing').length },
  { id: 'team', name: 'Our Team', count: galleryData.filter(item => item.category === 'team').length },
  { id: 'community', name: 'Community', count: galleryData.filter(item => item.category === 'community').length },
  { id: 'testimonial', name: 'Testimonials', count: galleryData.filter(item => item.category === 'testimonial').length }
];

export default galleryData;