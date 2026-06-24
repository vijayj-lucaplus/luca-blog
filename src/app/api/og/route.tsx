import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') ?? 'LucaPlus Blog').slice(0, 120);
  const category = (searchParams.get('cat') ?? '').slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #203060 0%, #159b7d 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: 3, color: '#ffffff' }}>
          LUCA<span style={{ color: '#5fd3b8' }}>PLUS</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {category ? (
            <div style={{ display: 'flex', fontSize: 24, color: '#5fd3b8', marginBottom: 16 }}>
              {category}
            </div>
          ) : null}
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.8)' }}>
          blog.lucaplus.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    },
  );
}
