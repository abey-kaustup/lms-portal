'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEmployeeCertificate } from '@/actions/certificate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Download, ArrowLeft, Printer } from 'lucide-react';

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
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${certData.employee.employeeId}.pdf`);

      showToast('Executive Certificate PDF downloaded successfully!', 'success');
    } catch (err: any) {
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
          <p className="text-xs font-semibold text-slate-500">Loading Executive Certificate...</p>
        </div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-soft-xs max-w-xl mx-auto space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Certificate Pending</h3>
        <p className="text-xs text-slate-500 font-medium">
          Your official certificate will be issued automatically once you pass the final induction assessment.
        </p>
        <Link href="/employee/assessment">
          <Button variant="primary">
            Go to Assessment
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft-xs">
        <Link href="/employee/dashboard">
          <Button variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="secondary" size="sm" icon={Download} loading={downloading} onClick={handleDownloadPDF}>
            Download PDF (A4)
          </Button>
        </div>
      </div>

      {/* Minimal Executive Corporate Certificate with Larger Typography & Completion/Passing Metrics */}
      <div
        ref={certRef}
        className="w-full bg-[#FFFFFF] relative overflow-hidden shadow-soft-xl rounded-xl p-8 sm:p-14 md:p-16 text-[#444444] border-3 border-[#1B2A49] select-none font-sans"
        style={{ aspectRatio: '1.414 / 1' }}
      >
        {/* Subtle Light Gray Paper Grain Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.9px,transparent_0.9px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Thin Gold Inner Border Frame */}
        <div className="absolute inset-3.5 border-2 border-[#C9A227] pointer-events-none rounded-lg" />

        {/* MAIN CERTIFICATE LAYOUT */}
        <div className="relative z-10 flex flex-col justify-between h-full text-center space-y-6 px-4 sm:px-12 py-3">
          
          {/* TOP SECTION */}
          <div className="space-y-3 pt-2">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#444444]">
              OFFICIAL CERTIFICATE OF COMPLETION
            </p>

            {/* Thin Gold Accent Line */}
            <div className="h-[1.5px] w-24 bg-[#C9A227] mx-auto" />

            {/* Main Title (Larger Typography) */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1B2A49] tracking-tight font-serif pt-1">
              CERTIFICATE OF COMPLETION
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-[#444444] italic font-serif pt-1">
              This certificate is proudly presented to
            </p>
          </div>

          {/* RECIPIENT SECTION */}
          <div className="space-y-3 py-1">
            {/* Large Recipient Name */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1B2A49] tracking-wide font-serif">
              {fullName}
            </h2>

            {/* Employee Information */}
            <p className="text-sm sm:text-base font-semibold text-[#444444] pt-1">
              {certData.employee.department} <span className="text-[#C9A227] font-black mx-1.5">●</span> {certData.employee.designation} <span className="text-[#C9A227] font-black mx-1.5">●</span> ID: {certData.employee.employeeId}
            </p>

            {/* Thin Elegant Divider */}
            <div className="h-[1.5px] w-56 sm:w-80 bg-[#C9A227] mx-auto mt-2" />
          </div>

          {/* BODY TEXT, COURSE TITLE & COMPLETION/ASSESSMENT METRICS */}
          <div className="space-y-4 max-w-3xl mx-auto py-1">
            <p className="text-sm sm:text-base text-[#444444] leading-relaxed font-normal">
              This certifies that the above employee has successfully completed all mandatory induction and onboarding requirements and has demonstrated commitment to the organization&apos;s standards, values, and learning objectives.
            </p>

            {/* Course Title (Large) */}
            <h3 className="text-xl sm:text-3xl font-bold text-[#1B2A49] font-serif pt-1">
              {certData.course.title || 'Employee Induction & Onboarding Program 2026'}
            </h3>

            {/* Completion % and Assessment Passing % Metric Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-[#1B2A49] shadow-soft-xs mx-auto">
              <span>Curriculum Completion: <strong className="text-emerald-700 font-bold">100%</strong></span>
              <span className="text-[#C9A227] font-bold">●</span>
              <span>Assessment Passing Score: <strong className="text-[#1B2A49] font-bold">{passingScore}%</strong></span>
              <span className="text-[#C9A227] font-bold">●</span>
              <span>Score Achieved: <strong className="text-blue-700 font-bold">{achievedScore}%</strong></span>
            </div>
          </div>

          {/* BOTTOM SECTION (THREE COLUMNS WITH LARGER TEXT) */}
          <div className="pt-8 border-t border-[#E8E8E8] grid grid-cols-3 gap-6 items-end text-center">
            
            {/* LEFT COLUMN: CERTIFICATE NUMBER */}
            <div className="flex flex-col items-center sm:items-start text-left space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#444444]">
                CERTIFICATE NUMBER
              </p>
              <p className="text-sm sm:text-base font-mono font-bold text-[#1B2A49]">
                {certData.certificateNumber}
              </p>
            </div>

            {/* CENTER COLUMN: AUTHORIZED SIGNATORY */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-40 border-b-2 border-[#1B2A49] mb-1.5" />
              <p className="text-sm sm:text-base font-bold text-[#1B2A49]">
                Authorized Signatory
              </p>
              <p className="text-xs sm:text-sm text-[#444444] font-medium">
                HR Operations Lead
              </p>
            </div>

            {/* RIGHT COLUMN: COMPLETION DATE */}
            <div className="flex flex-col items-center sm:items-end text-right space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#444444]">
                COMPLETION DATE
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#1B2A49]">
                {issueDateFormatted}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
