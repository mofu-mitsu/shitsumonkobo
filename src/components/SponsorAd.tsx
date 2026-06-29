import { useEffect, useRef } from 'react';

export default function SponsorAd() {
  return (
    <div style={{ textAlign: 'center', margin: '40px auto' }}>
      <p style={{ fontSize: '0.7em', color: '#ccc', marginBottom: '5px' }}>SPONSOR</p>
      {/* admax */}
      <iframe src="/admax.html" style={{ width: '100%', height: '250px', border: 'none', overflow: 'hidden' }} title="Sponsor Ad" scrolling="no" />
      {/* admax */}
    </div>
  );
}

