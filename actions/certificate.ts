'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import QRCode from 'qrcode';

export async function issueCertificate(employeeId: string, courseId: string) {
  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: {
      employeeId_courseId: {
        employeeId,
        courseId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  // Generate unique certificate number & verification code
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const certificateNumber = `CERT-IND-2026-${randomHex}`;
  const qrVerificationCode = `VERIFY-${certificateNumber}-${Date.now()}`;

  const cert = await prisma.certificate.create({
    data: {
      employeeId,
      courseId,
      certificateNumber,
      qrVerificationCode,
    },
  });

  return cert;
}

export async function getEmployeeCertificate() {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    throw new Error('Unauthorized');
  }

  const certificate = await prisma.certificate.findFirst({
    where: { employeeId: session.id },
    include: {
      employee: true,
      course: true,
    },
  });

  if (!certificate) {
    return null;
  }

  // Generate Data URL for QR Code
  const qrDataUrl = await QRCode.toDataURL(
    `https://lms.corporate.internal/verify?cert=${certificate.certificateNumber}&code=${certificate.qrVerificationCode}`
  );

  return {
    ...certificate,
    qrDataUrl,
  };
}

export async function getCertificateByNumber(certificateNumber: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber },
    include: {
      employee: true,
      course: true,
    },
  });

  if (!certificate) return null;

  const qrDataUrl = await QRCode.toDataURL(
    `https://lms.corporate.internal/verify?cert=${certificate.certificateNumber}&code=${certificate.qrVerificationCode}`
  );

  return {
    ...certificate,
    qrDataUrl,
  };
}
