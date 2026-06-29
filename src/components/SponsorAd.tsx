import { useEffect, useRef } from 'react';

export default function SponsorAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://adm.shinobi.jp/st/auto.js';
      script.async = true;
      script.setAttribute('data-admax-id', '97c9ec170549cc20f63d95c78dd0c110');
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '40px auto' }}>
      <p style={{ fontSize: '0.7em', color: '#ccc', marginBottom: '5px' }}>SPONSOR</p>
      <div ref={adRef}></div>
    </div>
  );
}

