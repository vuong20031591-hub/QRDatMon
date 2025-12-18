/**
 * Report Export Utilities
 * Supports PDF and Excel export for reports
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { RevenueReport, SalesReport, StaffReport } from '@/types/report';

// Vietnamese font support - using built-in fonts for now
const FONT_SIZE = {
  title: 18,
  subtitle: 14,
  normal: 11,
  small: 9,
};

/**
 * Remove Vietnamese diacritics for PDF compatibility
 * jsPDF default fonts don't support Vietnamese characters
 */
const removeVietnameseDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Format currency for display
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

/**
 * Format date for display
 */
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Get current timestamp for filename
 */
const getTimestamp = (): string => {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
};

// ============ PDF Export Functions ============

/**
 * Export Revenue Report to PDF
 */
export const exportRevenuePDF = (report: RevenueReport, filters?: { startDate?: string; endDate?: string }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(FONT_SIZE.title);
  doc.text('BAO CAO DOANH THU', pageWidth / 2, 20, { align: 'center' });
  
  // Date range
  doc.setFontSize(FONT_SIZE.small);
  const dateRange = filters?.startDate && filters?.endDate 
    ? `Tu ${formatDate(filters.startDate)} den ${formatDate(filters.endDate)}`
    : `Ngay xuat: ${formatDate(new Date())}`;
  doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });

  // Summary section
  doc.setFontSize(FONT_SIZE.subtitle);
  doc.text('Tong quan', 14, 40);
  
  const summaryData = [
    ['Tong doanh thu', formatCurrency(report.totalRevenue)],
    ['Tong don hang', report.totalOrders.toString()],
    ['Gia tri trung binh/don', formatCurrency(report.avgOrderValue)],
  ];

  if (report.comparison) {
    summaryData.push([
      'So voi ky truoc',
      `${report.comparison.changePercent >= 0 ? '+' : ''}${report.comparison.changePercent.toFixed(1)}%`
    ]);
  }

  autoTable(doc, {
    startY: 45,
    head: [['Chi tieu', 'Gia tri']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Revenue by period table
  if (report.revenueByPeriod && report.revenueByPeriod.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
    
    doc.setFontSize(FONT_SIZE.subtitle);
    doc.text('Chi tiet theo thoi gian', 14, finalY + 15);

    const periodData = report.revenueByPeriod.map(item => [
      item.date,
      formatCurrency(item.revenue),
      item.orderCount.toString(),
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Ngay', 'Doanh thu', 'So don']],
      body: periodData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(FONT_SIZE.small);
    doc.text(
      `Trang ${i}/${pageCount} - QRDatMon Web Admin`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`bao-cao-doanh-thu-${getTimestamp()}.pdf`);
};

/**
 * Export Sales Report to PDF
 */
export const exportSalesPDF = (report: SalesReport, filters?: { startDate?: string; endDate?: string }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(FONT_SIZE.title);
  doc.text('BAO CAO BAN HANG', pageWidth / 2, 20, { align: 'center' });
  
  // Date range
  doc.setFontSize(FONT_SIZE.small);
  const dateRange = filters?.startDate && filters?.endDate 
    ? `Tu ${formatDate(filters.startDate)} den ${formatDate(filters.endDate)}`
    : `Ngay xuat: ${formatDate(new Date())}`;
  doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });

  // Top selling items
  if (report.topItems && report.topItems.length > 0) {
    doc.setFontSize(FONT_SIZE.subtitle);
    doc.text('Mon ban chay nhat', 14, 40);

    const itemsData = report.topItems.map((item, index) => [
      (index + 1).toString(),
      removeVietnameseDiacritics(item.name),
      item.category ? removeVietnameseDiacritics(item.category) : '-',
      item.salesCount.toString(),
      formatCurrency(item.revenue),
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['STT', 'Ten mon', 'Danh muc', 'So luong ban', 'Doanh thu']],
      body: itemsData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14, right: 14 },
    });
  }

  // Category performance
  if (report.categoryPerformance && report.categoryPerformance.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
    
    doc.setFontSize(FONT_SIZE.subtitle);
    doc.text('Hieu suat theo danh muc', 14, finalY + 15);

    const categoryData = report.categoryPerformance.map(cat => [
      removeVietnameseDiacritics(cat.name),
      cat.salesCount.toString(),
      formatCurrency(cat.revenue),
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Danh muc', 'So luong ban', 'Doanh thu']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(FONT_SIZE.small);
    doc.text(
      `Trang ${i}/${pageCount} - QRDatMon Web Admin`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`bao-cao-ban-hang-${getTimestamp()}.pdf`);
};

/**
 * Export Staff Report to PDF
 */
export const exportStaffPDF = (report: StaffReport, filters?: { startDate?: string; endDate?: string }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(FONT_SIZE.title);
  doc.text('BAO CAO NHAN VIEN', pageWidth / 2, 20, { align: 'center' });
  
  // Date range
  doc.setFontSize(FONT_SIZE.small);
  const dateRange = filters?.startDate && filters?.endDate 
    ? `Tu ${formatDate(filters.startDate)} den ${formatDate(filters.endDate)}`
    : `Ngay xuat: ${formatDate(new Date())}`;
  doc.text(dateRange, pageWidth / 2, 28, { align: 'center' });

  // Summary
  doc.setFontSize(FONT_SIZE.subtitle);
  doc.text('Tong quan', 14, 40);
  
  const summaryData = [
    ['Tong don xu ly', report.totalOrdersHandled.toString()],
    ['Thoi gian phuc vu TB', `${report.avgServiceTime} phut`],
  ];

  autoTable(doc, {
    startY: 45,
    head: [['Chi tieu', 'Gia tri']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [168, 85, 247] },
    margin: { left: 14, right: 14 },
  });

  // Staff performance
  if (report.staffPerformance && report.staffPerformance.length > 0) {
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 80;
    
    doc.setFontSize(FONT_SIZE.subtitle);
    doc.text('Chi tiet nhan vien', 14, finalY + 15);

    const roleLabels: Record<string, string> = {
      admin: 'Quan tri',
      manager: 'Quan ly',
      cashier: 'Thu ngan',
      waiter: 'Phuc vu',
      kitchen: 'Bep',
    };

    const staffData = report.staffPerformance.map((staff, index) => [
      (index + 1).toString(),
      removeVietnameseDiacritics(staff.name || staff.employeeCode),
      roleLabels[staff.role] || staff.role,
      staff.ordersHandled.toString(),
      `${staff.avgServiceTime} phut`,
      formatCurrency(staff.totalRevenue),
    ]);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['STT', 'Ten', 'Vai tro', 'So don', 'TG phuc vu TB', 'Doanh thu']],
      body: staffData,
      theme: 'striped',
      headStyles: { fillColor: [168, 85, 247] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(FONT_SIZE.small);
    doc.text(
      `Trang ${i}/${pageCount} - QRDatMon Web Admin`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`bao-cao-nhan-vien-${getTimestamp()}.pdf`);
};

// ============ Excel Export Functions ============

/**
 * Export Revenue Report to Excel
 */
export const exportRevenueExcel = (report: RevenueReport, filters?: { startDate?: string; endDate?: string }) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['BÁO CÁO DOANH THU'],
    [filters?.startDate && filters?.endDate 
      ? `Từ ${formatDate(filters.startDate)} đến ${formatDate(filters.endDate)}`
      : `Ngày xuất: ${formatDate(new Date())}`],
    [],
    ['TỔNG QUAN'],
    ['Chỉ tiêu', 'Giá trị'],
    ['Tổng doanh thu', report.totalRevenue],
    ['Tổng đơn hàng', report.totalOrders],
    ['Giá trị trung bình/đơn', report.avgOrderValue],
  ];

  if (report.comparison) {
    summaryData.push(['So với kỳ trước (%)', report.comparison.changePercent]);
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');

  // Detail sheet
  if (report.revenueByPeriod && report.revenueByPeriod.length > 0) {
    const detailData = [
      ['CHI TIẾT THEO THỜI GIAN'],
      [],
      ['Ngày', 'Doanh thu', 'Số đơn'],
      ...report.revenueByPeriod.map(item => [item.date, item.revenue, item.orderCount]),
    ];

    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Chi tiết');
  }

  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `bao-cao-doanh-thu-${getTimestamp()}.xlsx`);
};

/**
 * Export Sales Report to Excel
 */
export const exportSalesExcel = (report: SalesReport, filters?: { startDate?: string; endDate?: string }) => {
  const wb = XLSX.utils.book_new();

  // Top items sheet
  const itemsData = [
    ['BÁO CÁO BÁN HÀNG'],
    [filters?.startDate && filters?.endDate 
      ? `Từ ${formatDate(filters.startDate)} đến ${formatDate(filters.endDate)}`
      : `Ngày xuất: ${formatDate(new Date())}`],
    [],
    ['MÓN BÁN CHẠY NHẤT'],
    ['STT', 'Tên món', 'Danh mục', 'Số lượng bán', 'Doanh thu'],
    ...(report.topItems || []).map((item, index) => [
      index + 1,
      item.name,
      item.category || '-',
      item.salesCount,
      item.revenue,
    ]),
  ];

  const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
  XLSX.utils.book_append_sheet(wb, itemsSheet, 'Món bán chạy');

  // Category sheet
  if (report.categoryPerformance && report.categoryPerformance.length > 0) {
    const categoryData = [
      ['HIỆU SUẤT THEO DANH MỤC'],
      [],
      ['Danh mục', 'Số lượng bán', 'Doanh thu'],
      ...report.categoryPerformance.map(cat => [cat.name, cat.salesCount, cat.revenue]),
    ];

    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Danh mục');
  }

  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `bao-cao-ban-hang-${getTimestamp()}.xlsx`);
};

/**
 * Export Staff Report to Excel
 */
export const exportStaffExcel = (report: StaffReport, filters?: { startDate?: string; endDate?: string }) => {
  const wb = XLSX.utils.book_new();

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị',
    manager: 'Quản lý',
    cashier: 'Thu ngân',
    waiter: 'Phục vụ',
    kitchen: 'Bếp',
  };

  // Staff sheet
  const staffData = [
    ['BÁO CÁO NHÂN VIÊN'],
    [filters?.startDate && filters?.endDate 
      ? `Từ ${formatDate(filters.startDate)} đến ${formatDate(filters.endDate)}`
      : `Ngày xuất: ${formatDate(new Date())}`],
    [],
    ['TỔNG QUAN'],
    ['Tổng đơn xử lý', report.totalOrdersHandled],
    ['Thời gian phục vụ TB (phút)', report.avgServiceTime],
    [],
    ['CHI TIẾT NHÂN VIÊN'],
    ['STT', 'Tên', 'Mã NV', 'Vai trò', 'Số đơn', 'TG phục vụ TB (phút)', 'Doanh thu'],
    ...(report.staffPerformance || []).map((staff, index) => [
      index + 1,
      staff.name || '-',
      staff.employeeCode,
      roleLabels[staff.role] || staff.role,
      staff.ordersHandled,
      staff.avgServiceTime,
      staff.totalRevenue,
    ]),
  ];

  const staffSheet = XLSX.utils.aoa_to_sheet(staffData);
  XLSX.utils.book_append_sheet(wb, staffSheet, 'Nhân viên');

  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `bao-cao-nhan-vien-${getTimestamp()}.xlsx`);
};
