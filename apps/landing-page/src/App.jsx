import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { Footer } from './components/layout/Footer';
import { ContactModal } from './components/ui/ContactModal';

function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const openContact = () => setIsContactOpen(true);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-white">
      <Navbar onContactClick={openContact} />
      <main>
        <Hero onContactClick={openContact} />
        <Features />
        <HowItWorks />
        <Pricing onContactClick={openContact} />
      </main>
      <Footer />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}

export default App
