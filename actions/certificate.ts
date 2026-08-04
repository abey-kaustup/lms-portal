'use server';

import { getSession } from '@/lib/auth';
import QRCode from 'qrcode';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function getEmployeeCertificate() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    throw new Error('Unauthorized');
  }

  try {
    const res = await fetch(`${API_BASE}/certificates/my-certificate`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken || ''}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    const cert = json.data;
    if (!cert) return null;

    const qrDataUrl = await QRCode.toDataURL(
      `/verify?cert=${cert.certificateNumber}`,
      {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      }
    );

    return {
      ...cert,
      qrDataUrl,
    };
  } catch (err) {
    console.error('[getEmployeeCertificate] API error:', err);
    return null;
  }
}

export async function getCertificateByNumber(certificateNumber: string) {
  try {
    const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(certificateNumber)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    const cert = json.data;
    if (!cert) return null;

    const qrDataUrl = await QRCode.toDataURL(
      `/verify?cert=${cert.certificateNumber}`,
      {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      }
    );

    return {
      ...cert,
      qrDataUrl,
    };
  } catch (err) {
    console.error('[getCertificateByNumber] API error:', err);
    return null;
  }
}
