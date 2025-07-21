import { NextResponse } from 'next/server';

export const runtime = 'edge';

const testimonials = [
  {
    id: '1',
    content: "Revolutionary AI insights with 2M thinking tokens. Game-changing for our analytics pipeline.",
    author: "Alex Morgan",
    role: "VP Engineering, DataFlow",
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    content: "Candlefish AI doesn't just implement AI—they transform how we think about intelligence.",
    author: "Dr. Priya Patel",
    role: "Chief Data Scientist",
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    content: "400% productivity increase. The consciousness-aligned approach makes all the difference.",
    author: "James Liu",
    role: "Innovation Director",
    timestamp: new Date().toISOString()
  }
];

export async function GET() {
  // Simulate live data by randomizing order
  const shuffled = [...testimonials].sort(() => Math.random() - 0.5);
  
  return NextResponse.json({
    testimonials: shuffled,
    lastUpdated: new Date().toISOString()
  });
}