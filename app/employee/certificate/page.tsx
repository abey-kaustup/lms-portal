'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEmployeeCertificate } from '@/actions/certificate';
import { jsPDF } from 'jspdf';
import { useToast } from '@/components/ui/Toast';
import { Award, Download, ShieldCheck, CheckCircle2, ArrowLeft, Building2, Printer } from 'lucide-react';

export default function EmployeeCertificatePage() {
  const { showToast } = useToast();
  const certRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<any>(null);

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

  const handleDownloadPDF = () => {
    if (!certData) return;

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Background border
      doc.setDrawColor(15, 23, 42); // Slate 900
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);

      doc.setDrawColor(37, 99, 235); // Blue 600
      doc.setLineWidth(0.5);
      doc.rect(14, 14, 269, 182);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 42);
      doc.text('CERTIFICATE OF COMPLETION', 148.5, 45, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('THIS IS PROUDLY PRESENTED TO', 148.5, 60, { align: 'center' });

      // Employee Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(37, 99, 235);
      const fullName = `${certData.employee.firstName} ${certData.employee.middleName ? certData.employee.middleName + ' ' : ''}${certData.employee.lastName}`;
      doc.text(fullName.toUpperCase(), 148.5, 78, { align: 'center' });

      // Designation & Department
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${certData.employee.designation} • ${certData.employee.department} (${certData.employee.employeeId})`,
        148.5,
        86,
        { align: 'center' }
      );

      // Description
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('For successfully completing the mandatory corporate onboarding program:', 148.5, 104, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(certData.course.title, 148.5, 118, { align: 'center' });

      // Certificate Number & Issue Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const issueDate = new Date(certData.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Certificate No: ${certData.certificateNumber}`, 40, 155);
      doc.text(`Issue Date: ${issueDate}`, 40, 162);
      doc.text('Verification: Internal Corporate LMS System', 40, 169);

      // Embed QR Code if available
      if (certData.qrDataUrl) {
        doc.addImage(certData.qrDataUrl, 'PNG', 220, 140, 35, 35);
        doc.setFontSize(8);
        doc.text('Scan to verify', 237.5, 180, { align: 'center' });
      }

      // Save PDF file
      doc.save(`Certificate_${certData.employee.employeeId}.pdf`);
      showToast('Certificate PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to generate PDF download', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Certificate...</p>
        </div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
        <div className="p-4 bg-slate-100 text-slate-500 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Certificate Pending</h3>
        <p className="text-xs text-slate-500">
          Your official certificate will be issued automatically once you pass the final induction assessment.
        </p>
        <Link
          href="/employee/assessment"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <span>Go to Assessment</span>
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link
          href="/employee/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Box */}
      <div
        ref={certRef}
        className="bg-white rounded-3xl p-8 sm:p-12 border-8 border-slate-900 shadow-2xl relative overflow-hidden"
      >
        {/* Inner decorative border */}
        <div className="border-2 border-blue-600 p-8 sm:p-12 rounded-2xl relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-slate-900 text-white rounded-2xl shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Official Certificate of Completion</p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                EMPLOYEE INDUCTION & ONBOARDING
              </h1>
            </div>

            <p className="text-xs text-slate-500 uppercase tracking-widest">This is to certify that</p>

            <div className="py-2 border-b-2 border-slate-200 inline-block px-8">
              <h2 className="text-2xl sm:text-3xl font-black text-blue-600 tracking-wide uppercase">
                {fullName}
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1">
                {certData.employee.designation} • {certData.employee.department} (ID: {certData.employee.employeeId})
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              has successfully completed all required training modules, compliance guidelines, and passed the proctored final assessment for the corporate course:
            </p>

            <h3 className="text-lg font-bold text-slate-900">{certData.course.title}</h3>

            {/* Bottom Metadata & QR Code Grid */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-left border-t border-slate-200">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Certificate Number</p>
                <p className="text-xs font-mono font-bold text-slate-900">{certData.certificateNumber}</p>
                <p className="text-[10px] text-slate-500">Issued: {issueDateFormatted}</p>
              </div>

              <div className="text-center space-y-1">
                <div className="w-24 border-b border-slate-400 mx-auto" />
                <p className="text-[10px] font-bold text-slate-900 uppercase">HR Operations Lead</p>
                <p className="text-[10px] text-slate-400">Corporate Learning & Development</p>
              </div>

              <div className="flex flex-col items-center sm:items-end space-y-1">
                {certData.qrDataUrl && (
                  <img
                    src={certData.qrDataUrl}
                    alt="QR Verification"
                    className="w-20 h-20 border p-1 rounded-lg bg-white"
                  />
                )}
                <span className="text-[10px] text-slate-400 font-mono">Scan to Verify Authenticity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
