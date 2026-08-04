/**
 * Utility functions for Document Viewer in LMS Portal.
 * Supports detection, transformation of SharePoint/Office links, and metadata formatting.
 */

export type FileCategory = 'pdf' | 'ppt' | 'word' | 'excel' | 'image' | 'generic';

export interface FileMetadata {
  category: FileCategory;
  extension: string;
  label: string;
  isOfficeDoc: boolean;
  isSharePoint: boolean;
  isGoogleDoc: boolean;
}

/**
 * Detects the file category and metadata based on a URL or filename.
 */
export function detectFileMetadata(url: string): FileMetadata {
  if (!url) {
    return {
      category: 'generic',
      extension: '',
      label: 'Corporate Resource',
      isOfficeDoc: false,
      isSharePoint: false,
      isGoogleDoc: false,
    };
  }

  const cleanUrl = url.trim().toLowerCase();
  const isSharePoint = cleanUrl.includes('sharepoint.com') || cleanUrl.includes('onedrive.live.com') || cleanUrl.includes('1drv.ms');
  const isGoogleDoc = cleanUrl.includes('docs.google.com') || cleanUrl.includes('drive.google.com');

  // Image formats
  if (/\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?.*)?$/i.test(cleanUrl)) {
    const match = cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp)/i);
    const ext = match ? match[1].toUpperCase() : 'IMAGE';
    return {
      category: 'image',
      extension: ext.toLowerCase(),
      label: `Image File (${ext})`,
      isOfficeDoc: false,
      isSharePoint,
      isGoogleDoc: false,
    };
  }

  // PowerPoint formats
  if (
    /\.(ppt|pptx|pot|potx|pps|ppsx)(\?.*)?$/i.test(cleanUrl) ||
    cleanUrl.includes('docs.google.com/presentation') ||
    (isSharePoint && (cleanUrl.includes(':p:/') || cleanUrl.includes('presentation') || cleanUrl.includes('.pptx')))
  ) {
    const extMatch = cleanUrl.match(/\.(ppt|pptx|pot|potx|pps|ppsx)/i);
    const ext = extMatch ? extMatch[1].toUpperCase() : 'PPTX';
    return {
      category: 'ppt',
      extension: ext.toLowerCase(),
      label: `PowerPoint Presentation (${ext})`,
      isOfficeDoc: true,
      isSharePoint,
      isGoogleDoc: cleanUrl.includes('docs.google.com/presentation'),
    };
  }

  // Word formats
  if (
    /\.(doc|docx|dot|dotx)(\?.*)?$/i.test(cleanUrl) ||
    cleanUrl.includes('docs.google.com/document') ||
    (isSharePoint && (cleanUrl.includes(':w:/') || cleanUrl.includes('.docx')))
  ) {
    const extMatch = cleanUrl.match(/\.(doc|docx|dot|dotx)/i);
    const ext = extMatch ? extMatch[1].toUpperCase() : 'DOCX';
    return {
      category: 'word',
      extension: ext.toLowerCase(),
      label: `Word Document (${ext})`,
      isOfficeDoc: true,
      isSharePoint,
      isGoogleDoc: cleanUrl.includes('docs.google.com/document'),
    };
  }

  // Excel formats
  if (
    /\.(xls|xlsx|csv|xlsm)(\?.*)?$/i.test(cleanUrl) ||
    cleanUrl.includes('docs.google.com/spreadsheets') ||
    (isSharePoint && (cleanUrl.includes(':x:/') || cleanUrl.includes('.xlsx')))
  ) {
    const extMatch = cleanUrl.match(/\.(xls|xlsx|csv|xlsm)/i);
    const ext = extMatch ? extMatch[1].toUpperCase() : 'XLSX';
    return {
      category: 'excel',
      extension: ext.toLowerCase(),
      label: `Excel Spreadsheet (${ext})`,
      isOfficeDoc: true,
      isSharePoint,
      isGoogleDoc: cleanUrl.includes('docs.google.com/spreadsheets'),
    };
  }

  // PDF format
  if (cleanUrl.includes('.pdf') || cleanUrl.endsWith('.pdf')) {
    return {
      category: 'pdf',
      extension: 'pdf',
      label: 'PDF Document',
      isOfficeDoc: false,
      isSharePoint,
      isGoogleDoc: false,
    };
  }

  return {
    category: 'generic',
    extension: '',
    label: 'Corporate Resource',
    isOfficeDoc: false,
    isSharePoint,
    isGoogleDoc,
  };
}

/**
 * Returns optimized embed URL for Microsoft Office files or SharePoint links with full debug logging.
 */
export function getEmbedUrl(url: string, category: FileCategory): string {
  if (!url) return '';
  const clean = url.trim();

  // DEBUG LOG TASK 1 & TASK 9: Original SharePoint URL
  console.log('[DOCUMENT_VIEWER_DEBUG] Task 1 - Original SharePoint URL:', clean);

  // Ensure single encoding validation (Task 3)
  let rawForEncoding = clean;
  try {
    // If URL contains encoded characters, decode once first to prevent double-encoding
    if (rawForEncoding.includes('%3A') || rawForEncoding.includes('%2F')) {
      rawForEncoding = decodeURIComponent(rawForEncoding);
    }
  } catch {
    // Keep raw if decoding fails
  }
  const singleEncodedUrl = encodeURIComponent(rawForEncoding);

  // DEBUG LOG TASK 3 & TASK 9: Single Encoded URL
  console.log('[DOCUMENT_VIEWER_DEBUG] Task 3 - Encoded URL (encodeURIComponent x1):', singleEncodedUrl);

  const calculatedOfficeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${singleEncodedUrl}`;
  console.log('[DOCUMENT_VIEWER_DEBUG] Calculated Office Viewer URL:', calculatedOfficeViewerUrl);

  // 1. Google Docs / Slides / Sheets
  if (clean.includes('docs.google.com')) {
    if (clean.includes('/presentation')) {
      const gSlides = clean.replace(/\/edit.*$/, '/embed').replace(/\/view.*$/, '/embed');
      console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (Google Slides):', gSlides);
      return gSlides;
    }
    if (clean.includes('/document') || clean.includes('/spreadsheets')) {
      const gDoc = clean.replace(/\/edit.*$/, '/preview').replace(/\/view.*$/, '/preview');
      console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (Google Docs):', gDoc);
      return gDoc;
    }
  }

  // 2. SharePoint / OneDrive native embed vs Office Viewer
  if (clean.includes('sharepoint.com') || clean.includes('onedrive.live.com') || clean.includes('1drv.ms')) {
    // If it's already an embed link with action=embedview
    if (clean.includes('action=embedview') || clean.includes('action=interactivepreview')) {
      console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (SharePoint Native Embed):', clean);
      return clean;
    }

    // SharePoint links (e.g. :p:/, :w:/, :x:/ or Doc.aspx) work natively when action=embedview is appended
    const separator = clean.includes('?') ? '&' : '?';
    const spEmbedUrl = `${clean}${separator}action=embedview`;
    console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (SharePoint Embed Action):', spEmbedUrl);
    return spEmbedUrl;
  }

  // 3. Direct Public Office Files (.pptx, .docx, .xlsx) -> Use Office Web Apps Viewer
  if (['ppt', 'word', 'excel'].includes(category) || /\.(doc|docx|ppt|pptx|xls|xlsx)(\?.*)?$/i.test(clean)) {
    console.log('[DOCUMENT_VIEWER_DEBUG] Task 2, 6, 9 - Final Office Viewer iframe src:', calculatedOfficeViewerUrl);
    return calculatedOfficeViewerUrl;
  }

  // 4. PDF
  if (category === 'pdf' || clean.toLowerCase().includes('.pdf')) {
    const pdfEmbed = clean.includes('#') ? clean : `${clean}#toolbar=0`;
    console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (PDF):', pdfEmbed);
    return pdfEmbed;
  }

  console.log('[DOCUMENT_VIEWER_DEBUG] Task 9 - Final iframe src (Generic):', clean);
  return clean;
}

/**
 * Extracts a clean document title or fallback from a URL.
 */
export function extractFilename(url: string, fallback: string): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      return decodeURIComponent(lastPart.split('?')[0]);
    }
  } catch {
    // Fallback if URL parsing fails
  }
  return fallback;
}
