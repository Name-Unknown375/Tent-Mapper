import jsPDF from 'jspdf';
import Konva from 'konva';
import { CANVAS_WIDTH_PX, CANVAS_HEIGHT_PX, PIXELS_PER_FOOT } from '../types';

export const exportToImage = async (
  stageRef: React.RefObject<Konva.Stage | null>,
  filename: string = 'tent-layout.png'
): Promise<void> => {
  if (!stageRef.current) return;

  const stage = stageRef.current;

  // Store current state
  const oldScale = stage.scaleX();
  const oldPosition = { x: stage.x(), y: stage.y() };

  // Reset to export full canvas
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();

  // Export
  const dataURL = stage.toDataURL({
    x: 0,
    y: 0,
    width: CANVAS_WIDTH_PX,
    height: CANVAS_HEIGHT_PX,
    pixelRatio: 2,
    mimeType: 'image/png',
  });

  // Restore state
  stage.scale({ x: oldScale, y: oldScale });
  stage.position(oldPosition);
  stage.batchDraw();

  // Download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (
  stageRef: React.RefObject<Konva.Stage | null>,
  layoutName: string = 'Tent Layout',
  guestCount: number = 0,
  filename: string = 'tent-layout.pdf'
): Promise<void> => {
  if (!stageRef.current) return;

  const stage = stageRef.current;

  // Store current state
  const oldScale = stage.scaleX();
  const oldPosition = { x: stage.x(), y: stage.y() };

  // Reset to export full canvas
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
  stage.batchDraw();

  // Get data URL
  const dataURL = stage.toDataURL({
    x: 0,
    y: 0,
    width: CANVAS_WIDTH_PX,
    height: CANVAS_HEIGHT_PX,
    pixelRatio: 2,
    mimeType: 'image/png',
  });

  // Restore state
  stage.scale({ x: oldScale, y: oldScale });
  stage.position(oldPosition);
  stage.batchDraw();

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFillColor(40, 79, 63); // brand-green
  pdf.rect(0, 0, pageWidth, 25, 'F');

  pdf.setTextColor(254, 250, 246); // brand-cream
  pdf.setFontSize(20);
  pdf.text(layoutName, 15, 16);

  // Guest count badge
  pdf.setFillColor(235, 192, 207); // brand-pink
  pdf.roundedRect(pageWidth - 60, 7, 50, 12, 3, 3, 'F');
  pdf.setTextColor(40, 79, 63);
  pdf.setFontSize(10);
  pdf.text(`${guestCount} Guests`, pageWidth - 55, 14);

  // Canvas image
  const imgWidth = pageWidth - 30;
  const imgHeight = (CANVAS_HEIGHT_PX / CANVAS_WIDTH_PX) * imgWidth;
  const maxImgHeight = pageHeight - 45;
  const finalImgHeight = Math.min(imgHeight, maxImgHeight);
  const finalImgWidth = (finalImgHeight / imgHeight) * imgWidth;

  const imgX = (pageWidth - finalImgWidth) / 2;
  pdf.addImage(dataURL, 'PNG', imgX, 30, finalImgWidth, finalImgHeight);

  // Border around image
  pdf.setDrawColor(40, 79, 63);
  pdf.setLineWidth(0.5);
  pdf.rect(imgX, 30, finalImgWidth, finalImgHeight);

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100);
  const date = new Date().toLocaleDateString();
  pdf.text(`Generated on ${date} | Forever Party Rentals | Tent Mapper`, 15, pageHeight - 10);

  // Scale info
  pdf.text(`Scale: 1 inch = ${Math.round(CANVAS_WIDTH_PX / finalImgWidth / 25.4 * PIXELS_PER_FOOT)} feet`, pageWidth - 60, pageHeight - 10);

  // Save
  pdf.save(filename);
};

export const generateShareLink = (layoutId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/embed/${layoutId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};
