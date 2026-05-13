import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const savings = req.nextUrl.searchParams.get('savings') ?? '0'
  const annual = String(Number(savings) * 12)

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: '#0f172a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', padding: '80px'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '28px', 
          marginBottom: '24px', letterSpacing: '4px' }}>
          SPENDLENS AI SPEND AUDIT
        </div>
        <div style={{ color: 'white', fontSize: '56px', 
          fontWeight: '700', marginBottom: '16px' }}>
          You could save
        </div>
        <div style={{ color: '#16a34a', fontSize: '112px', 
          fontWeight: '800', lineHeight: '1' }}>
          ${savings}/mo
        </div>
        <div style={{ color: '#64748b', fontSize: '36px', 
          marginTop: '16px' }}>
          ${annual}/year
        </div>
        <div style={{ color: '#475569', fontSize: '24px', 
          marginTop: '48px' }}>
          Free audit at spendlens.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
