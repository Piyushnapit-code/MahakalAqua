import { endpoints } from './api';
import { storage } from './utils';
import config from '../config/env';

/**
 * Download file from blob
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data to Excel
 */
export const exportToExcel = async (endpoint: string, filename: string) => {
  try {
    const token = storage.get<string>('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    downloadFile(blob, filename);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Export Contacts
 */
export const exportContacts = async () => {
  return exportToExcel(endpoints.exportContacts, `contacts-${Date.now()}.xlsx`);
};

/**
 * Export Enquiries
 */
export const exportEnquiries = async () => {
  return exportToExcel(endpoints.exportEnquiries, `enquiries-${Date.now()}.xlsx`);
};

/**
 * Export Issues
 */
export const exportIssues = async () => {
  return exportToExcel(endpoints.exportIssues, `issues-${Date.now()}.xlsx`);
};

/**
 * Export Services
 */
export const exportServices = async () => {
  return exportToExcel(endpoints.exportServices, `services-${Date.now()}.xlsx`);
};

/**
 * Export RO Parts
 */
export const exportROParts = async () => {
  return exportToExcel(endpoints.exportROParts, `ro-parts-${Date.now()}.xlsx`);
};

/**
 * Export Gallery
 */
export const exportGallery = async () => {
  return exportToExcel(endpoints.exportGallery, `gallery-${Date.now()}.xlsx`);
};

/**
 * Export Visitors
 */
export const exportVisitors = async () => {
  return exportToExcel(endpoints.exportVisitors, `visitors-${Date.now()}.xlsx`);
};

/**
 * Export All Data
 */
export const exportAll = async () => {
  return exportToExcel(endpoints.exportAll, `all-data-${Date.now()}.xlsx`);
};

