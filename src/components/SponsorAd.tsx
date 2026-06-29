import { useEffect, useRef } from 'react';

export default function SponsorAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://adm.shinobi.jp/o/7782b8af3fc6cbc27156ec26038e53a1';
      script.async = true;
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

