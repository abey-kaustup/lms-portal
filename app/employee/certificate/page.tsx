'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEmployeeCertificate } from '@/actions/certificate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import {
  Download,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  Calendar,
} from 'lucide-react';

export default function EmployeeCertificatePage() {
  const { showToast } = useToast();
  const certRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const loadCert = async () => {
    try {
      const data = await getEmployeeCertificate();
      setCertData(data);
    } catch (err: any) {
      showToast('Failed to load certificate', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCert();
  }, []);

  const handleDownloadPDF = async () => {
    if (!certRef.current || !certData) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: 800,
        height: 1131,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Clean filename format: Firstname_Lastname_Certificate.pdf
      const cleanFirstName = (certData.employee.firstName || 'Employee').replace(/[^a-zA-Z0-9]/g, '');
      const cleanLastName = (certData.employee.lastName || '').replace(/[^a-zA-Z0-9]/g, '');
      const filename = cleanLastName
        ? `${cleanFirstName}_${cleanLastName}_Certificate.pdf`
        : `${cleanFirstName}_Certificate.pdf`;

      pdf.save(filename);

      showToast('Executive Certificate PDF downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('Failed to generate PDF download', 'error');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Official Certificate...</p>
        </div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-soft-xs max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Certificate Pending</h3>
        <p className="text-xs text-slate-500 font-medium">
          Your official corporate certificate will be issued automatically once you pass the final induction assessment.
        </p>
        <Link href="/employee/assessment">
          <Button variant="primary">
            Go to Assessment Test
          </Button>
        </Link>
      </div>
    );
  }

  const fullName = `${certData.employee.firstName} ${certData.employee.middleName ? certData.employee.middleName + ' ' : ''}${certData.employee.lastName}`;
  const issueDateFormatted = new Date(certData.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const passingScore = certData.course?.passingScore || 80;
  const achievedScore = certData.passedAttempt?.score ? Math.round(certData.passedAttempt.score) : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Embedded CSS for perfect A4 Print Layout */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
            background: #ffffff !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-xs gap-3 print:hidden">
        <Link href="/employee/dashboard">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Certificate
          </Button>
          <Button variant="secondary" size="sm" icon={Download} loading={downloading} onClick={handleDownloadPDF}>
            Download PDF (A4)
          </Button>
        </div>
      </div>

      {/* RESPONSIVE SCALING CONTAINER FOR PREVIEW */}
      <div className="w-full flex items-center justify-center overflow-x-auto pb-4">
        {/*
          EXECUTIVE A4 PORTRAIT CERTIFICATE (Fixed 800px x 1131px for 100% pixel-perfect A4 printing & PDF capture)
        */}
        <div
          id="printable-certificate"
          ref={certRef}
          className="w-[800px] h-[1131px] bg-white relative overflow-hidden text-slate-800 shadow-2xl rounded-sm border-[12px] border-[#0F172A] p-12 flex flex-col justify-between select-none font-sans shrink-0"
        >
          {/* Background Subtle Watermark Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Double Gold Inner Border Frame */}
          <div className="absolute inset-4 border-2 border-[#C9A227] pointer-events-none rounded-xs" />
          <div className="absolute inset-6 border border-[#C9A227]/40 pointer-events-none rounded-xs" />

          {/* Four Decorative Gold Corner Accents */}
          <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-[#C9A227] pointer-events-none" />
          <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-[#C9A227] pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-[#C9A227] pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-[#C9A227] pointer-events-none" />

          {/* MAIN CERTIFICATE CONTENT CONTAINER */}
          <div className="relative z-10 flex flex-col justify-between h-full text-center px-6 py-4">

            {/* TOP HEADER SECTION */}
            <div className="space-y-4 pt-4">
              {/* Corporate Logo Badge */}
              <div className="inline-flex items-center justify-center p-3 bg-[#0F172A] text-white rounded-2xl shadow-md border border-[#C9A227]">
                <ShieldCheck className="w-10 h-10 text-[#C9A227]" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#C9A227]">
                  CORPORATE INDUCTION & COMPLIANCE ACADEMY
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-semibold mt-0.5">
                  Official Enterprise Onboarding Credential
                </p>
              </div>

              {/* Decorative Gold Divider */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="h-[1px] w-20 bg-[#C9A227]" />
                <span className="text-[#C9A227] text-xs">◆</span>
                <div className="h-[1px] w-20 bg-[#C9A227]" />
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight font-serif pt-2">
                CERTIFICATE OF COMPLETION
              </h1>

              <p className="text-sm text-slate-600 italic font-serif">
                This official credential is proudly awarded to
              </p>
            </div>

            {/* RECIPIENT NAME & EMPLOYEE METRICS */}
            <div className="space-y-4 py-2">
              <h2 className="text-4xl font-extrabold text-[#0F172A] tracking-wide font-serif border-b-2 border-[#C9A227]/40 pb-3 max-w-xl mx-auto">
                {fullName}
              </h2>

              <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-700">
                <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Department: <strong className="text-[#0F172A]">{certData.employee.department}</strong>
                </span>
                <span className="text-[#C9A227]">●</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Role: <strong className="text-[#0F172A]">{certData.employee.designation}</strong>
                </span>
                <span className="text-[#C9A227]">●</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-mono">
                  ID: {certData.employee.employeeId}
                </span>
              </div>
            </div>

            {/* BODY TEXT & COURSE COMPLETED */}
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                For successfully fulfilling all mandatory requirements, adhering to organizational standards, and demonstrating proficiency in the corporate induction curriculum for:
              </p>

              <h3 className="text-2xl font-bold text-[#0F172A] font-serif bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-soft-xs">
                {certData.course.title || 'Employee Induction & Onboarding Program 2026'}
              </h3>

              {/* Achievement Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-slate-800 shadow-soft-xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Curriculum: <strong className="text-emerald-700 font-bold">100% Completed</strong>
                </span>
                <span className="text-[#C9A227]">●</span>
                <span>
                  Passing Required: <strong>{passingScore}%</strong>
                </span>
                <span className="text-[#C9A227]">●</span>
                <span>
                  Score Achieved: <strong className="text-blue-700 font-bold">{achievedScore}%</strong>
                </span>
              </div>
            </div>

            {/* FOOTER SIGNATURE, SEAL & QR VERIFICATION */}
            <div className="pt-6 border-t-2 border-slate-100 grid grid-cols-3 gap-4 items-end text-center">

              {/* LEFT COLUMN: CERTIFICATE CREDENTIALS */}
              <div className="text-left space-y-1.5 pl-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                  CREDENTIAL IDENTIFIER
                </p>
                <p className="text-xs font-mono font-bold text-[#0F172A]">
                  {certData.certificateNumber}
                </p>

                <div className="pt-2 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    ISSUE DATE
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    {issueDateFormatted}
                  </p>
                </div>
              </div>

              {/* CENTER COLUMN: EMBOSSED GOLD CORPORATE SEAL & SIGNATURE */}
              <div className="flex flex-col items-center justify-center space-y-3">
                {/* Official Gold Seal Badge */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#AA771C] p-1 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-[#593E00] bg-[#0F172A] flex flex-col items-center justify-center text-center p-1">
                    <Sparkles className="w-4 h-4 text-[#FBF5B7]" />
                    <span className="text-[7px] font-extrabold text-[#FBF5B7] uppercase tracking-tighter leading-tight mt-0.5">
                      OFFICIAL SEAL
                    </span>
                    <span className="text-[6px] text-emerald-300 font-bold">VERIFIED</span>
                  </div>
                </div>

                {/* Signature Line */}
                <div className="space-y-0.5 text-center pt-1">
                  <div className="w-36 border-b border-slate-900 mx-auto" />
                  <p className="text-xs font-bold text-[#0F172A] font-serif pt-0.5">
                    Executive HR Operations
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Corporate Onboarding Committee
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: SCANNABLE QR CODE & VERIFICATION LINK */}
              <div className="flex flex-col items-end text-right pr-2 space-y-1">
                {certData.qrDataUrl && (
                  <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-soft-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={certData.qrDataUrl}
                      alt="Certificate Verification QR Code"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                )}
                <p className="text-[9px] font-bold text-slate-500 tracking-tight">
                  Scan to Verify Authentic Credential
                </p>
                <p className="text-[8px] font-mono text-slate-400">
                  /verify?cert={certData.certificateNumber}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
