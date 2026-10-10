import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Hero } from './components/Hero';
import { InvitationMessage } from './components/InvitationMessage';
import { FamilyDetails } from './components/FamilyDetails';
import { MusicControl } from './components/MusicControl';
import { ScratchCardSection } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { Events } from './components/Events';
import { Timeline } from './components/Timeline';
import { Venue } from './components/Venue';
import { RSVP } from './components/RSVP';
import { ClosingMessage } from './components/ClosingMessage';
import { Footer } from './components/Footer';
import { Preloader } from './components/Preloader';
import { getWeddingData, getLocalCachedWeddingData } from './services/db';
import { WeddingData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { FallingPetals } from './components/FallingPetals';
import { FadeInSection } from './components/FadeInSection';

function PublicView() {
  const [data, setData] = useState<WeddingData>(getLocalCachedWeddingData);
  const [isPreloading, setIsPreloading] = useState(true);
  const [isScratched, setIsScratched] = useState(false);
  const [isHeroEnded, setIsHeroEnded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const dbData = await getWeddingData();
      if (!isMounted) return;
      
      // Clean up broken pixabay links that might be cached in Firestore
      if (dbData.heroVideoUrl?.includes("pixabay.com")) dbData.heroVideoUrl = "";
      if (dbData.musicUrl?.includes("pixabay.com")) dbData.musicUrl = "";
      
      setData(dbData);
    }
    loadData();

    const handleUpdate = (e: any) => {
      if (e.detail && isMounted) {
        setData(e.detail);
      }
    };
    window.addEventListener('weddingDataUpdated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('weddingDataUpdated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (data?.ogImageUrl) {
      // Find or create og:image meta tag
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', data.ogImageUrl);
      
      // Some platforms also use twitter:image
      let twImageMeta = document.querySelector('meta[name="twitter:image"]');
      if (!twImageMeta) {
        twImageMeta = document.createElement('meta');
        twImageMeta.setAttribute('name', 'twitter:image');
        document.head.appendChild(twImageMeta);
      }
      twImageMeta.setAttribute('content', data.ogImageUrl);
    }
  }, [data]);

  if (!data) {
    return <div className="min-h-screen bg-blush-main flex items-center justify-center font-serif text-wine-dark">Loading...</div>;
  }

  return (
    <div className="w-full bg-blush-main relative mx-auto max-w-md shadow-2xl overflow-hidden sm:my-0 min-h-[100svh]">
      {/* High performance Preloader System that downloads hero video & assets before entering */}
      {isPreloading && (
        <Preloader data={data} onComplete={() => setIsPreloading(false)} />
      )}

      {/* Falling Flower Petals Ambient Overlay throughout the entire app */}
      <FallingPetals />

      {/* Website Background Music with instant user control */}
      <MusicControl musicUrl={data.musicUrl} shouldPlay={!isPreloading} />

      {/* Main Website Content - Pre-mounted so video decoders warm up for zero lag */}
      <main className="w-full min-h-[100svh] bg-blush-main relative overflow-hidden">
        <Hero data={data} shouldPlayVideo={!isPreloading} onVideoEnd={() => setIsHeroEnded(true)} />
        
        <FadeInSection threshold={0.08} rootMargin="0px 0px -30px 0px">
          <InvitationMessage message={data.invitationMessage} isHeroEnded={isHeroEnded} />
        </FadeInSection>

        <ScratchCardSection data={data} onReveal={() => setIsScratched(true)} />

        {/* Family Blessings details section rearranged JUST BELOW the scratch heart */}
        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <FamilyDetails data={data} />
        </FadeInSection>

        {isScratched && <Countdown targetDate={data.weddingDate} />}
        
        {/* Main Wedding Sections with IntersectionObserver fade-in animations */}
        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <Events events={data.events} />
        </FadeInSection>

        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <Timeline events={data.events} timeline={data.timeline} />
        </FadeInSection>

        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <Venue venue={data.venue} />
        </FadeInSection>

        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <RSVP data={data} />
        </FadeInSection>

        <FadeInSection threshold={0.05} rootMargin="0px 0px -30px 0px">
          <ClosingMessage data={data} />
        </FadeInSection>

        <Footer data={data} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}


