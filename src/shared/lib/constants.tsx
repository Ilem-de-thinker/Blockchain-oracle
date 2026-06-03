
import { Course } from './types';

export const COLORS = {
  primary: '#008751', // Nigerian Green
  secondary: '#87CEEB', // Sky Blue (Cross River)
  accent: '#6B2FB3', // Purple (Brand)
  dark: '#060807',
  light: '#f3f4f6'
};

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Blockchain Fundamentals for Africa',
    description: 'Solve local financial inclusion challenges using decentralized ledgers. This course covers everything from basic cryptography to P2P networking in a local context.',
    instructor: 'Ayo Alphar',
    price: 49.99,
    duration: '10 Weeks',
    level: 'Beginner',
    category: 'Protocol',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    enrollmentCount: 1250,
    modules: [
      { 
        id: 'm1', 
        title: 'Foundations of Trust', 
        lessons: [
          { id: 'l1', title: 'The Philosophy of Decentralization', duration: '15m', type: 'text', content: '# The Philosophy of Decentralization\n\nBlockchain is more than just code; it is a shift in how we perceive trust. In the African context, where centralized institutions sometimes face transparency challenges, decentralized protocols offer a new highway for economic interaction.\n\n## Key Concepts\n- **Trustlessness**: Not the absence of trust, but the distribution of it.\n- **Immutability**: Once written, the record stays forever.\n- **Sovereignty**: Owning your own data and value.' },
          { id: 'l2', title: 'Evolution of Money in Africa', duration: '12m', type: 'video', videoUrl: 'https://example.com/v1' },
          { id: 'l3', title: 'Cryptography 101: Hashing', duration: '20m', type: 'text', content: '## Cryptographic Hashing\n\nA hash function is any function that can be used to map data of arbitrary size to fixed-size values. The values returned by a hash function are called hash values, hash codes, digests, or simply hashes.\n\n### Properties of SHA-256\n1. **Deterministic**: Same input always yields same output.\n2. **Quick Computation**: Efficient for network nodes.\n3. **Pre-image Resistance**: Hard to reverse.' }
        ] 
      },
      {
        id: 'm2',
        title: 'P2P Networks',
        lessons: [
          { id: 'l4', title: 'Nodes and Consensus', duration: '45m', type: 'video', videoUrl: 'https://example.com/v2' },
          { id: 'l5', title: 'The Double Spend Problem', duration: '30m', type: 'text', content: 'The double-spending problem is a potential flaw in a digital cash scheme in which the same single digital token can be spent more than once.' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Advanced Smart Contract Security',
    description: 'Master Solidity and learn to write production-ready, secure smart contracts with focus on Reentrancy, Overflow, and Logic vulnerabilities.',
    instructor: 'Dr. John Stone',
    price: 99.99,
    duration: '12 Weeks',
    level: 'Advanced',
    category: 'Development',
    thumbnail: 'https://images.unsplash.com/photo-1642104704074-907c0698bcd9?auto=format&fit=crop&q=80&w=800',
    enrollmentCount: 450,
    modules: [
      { id: 'm2-1', title: 'Solidity Deep Dive', lessons: [{ id: 'l2-1', title: 'Memory vs Storage', duration: '25m', type: 'text', content: 'Detailed analysis of EVM memory management.' }] }
    ]
  },
  {
    id: '3',
    title: 'Ecosystem Trading Strategy',
    description: 'The AlpharKing framework for long-term digital asset management and market psychology analysis tailored for the emerging markets.',
    instructor: 'Sarah King',
    price: 149.99,
    duration: '8 Weeks',
    level: 'Intermediate',
    category: 'Finance',
    thumbnail: 'https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&q=80&w=800',
    enrollmentCount: 890,
    modules: [
      { id: 'm3-1', title: 'Market Psychology', lessons: [{ id: 'l3-1', title: 'The Cycle of Emotions', duration: '40m', type: 'video', videoUrl: 'https://example.com/v3' }] }
    ]
  }
];

export const MOCK_BLOGS = [
  {
    id: 'b1',
    title: 'The Rise of Stablecoins in Nigeria',
    excerpt: 'How digital dollars are becoming a hedge against inflation for SMEs.',
    author: 'Ayo Alphar',
    date: 'May 12, 2025',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'b2',
    title: 'Layer 2 Solutions for Supply Chain',
    excerpt: 'Improving transparency in West African cocoa exports with Polygon.',
    author: 'Chinelo Okafor',
    date: 'June 01, 2025',
    category: 'Case Study',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'Web3 Africa Summit 2025',
    date: 'Oct 15, 2025',
    type: 'In-person',
    price: 0,
    isPaid: false,
    location: 'Lagos, Nigeria',
    thumbnail: 'https://images.unsplash.com/photo-1540575861501-7ad058df3212?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'e2',
    title: 'DeFi & Stablecoins Masterclass',
    date: 'Nov 02, 2025',
    type: 'Webinar',
    price: 25,
    isPaid: true,
    thumbnail: 'https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800'
  }
];
