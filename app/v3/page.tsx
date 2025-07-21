import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import './styles/globals.css';

export default function CandlefishV3() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Testimonials />
      <Pricing />
    </main>
  );
}