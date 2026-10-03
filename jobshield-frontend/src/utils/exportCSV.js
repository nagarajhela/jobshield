/**
 * Utility functions for generating, formatting, and initiating file downloads
 * for CSV reports (e.g. analysis logs, scam reports, audit data).
 */

/**
 * Escapes a single field value according to RFC 4180 CSV specifications.
 * Strings containing quotes, commas, or newlines are quoted, and internal quotes are doubled.
 *
 * @param {any} value - Field value to format
 * @returns {string} Safe CSV cell value
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '""';
  }

  let stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  // If value contains double quotes, commas, or newlines, quote it and escape internal quotes
  if (/[",\r\n]/.test(stringValue)) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of objects into a formatted CSV string.
 * Supports custom headers (as string array or array of { key, label } objects).
 *
 * @param {Array<Record<string, any>>} data - Array of data rows
 * @param {Array<string | { key: string, label: string }>} [headers] - Optional custom headers definition
 * @returns {string} Formatted CSV string with header row
 *
 * @example
 * const items = [
 *   { company: 'Acme Corp', role: 'Engineer', salary: '$100k, remote' }
 * ];
 * const csv = convertToCSV(items);
 * console.log('Generated CSV:\n', csv);
 */
export function convertToCSV(data, headers) {
  if (!Array.isArray(data) || data.length === 0) {
    if (Array.isArray(headers) && headers.length > 0) {
      const headerRow = headers
        .map((h) => escapeCSVValue(typeof h === 'object' && h !== null ? h.label || h.key : h))
        .join(',');
      return headerRow;
    }
    return '';
  }

  let resolvedHeaders = [];

  if (Array.isArray(headers) && headers.length > 0) {
    resolvedHeaders = headers.map((h) => {
      if (typeof h === 'object' && h !== null) {
        return { key: h.key, label: h.label || h.key };
      }
      return { key: String(h), label: String(h) };
    });
  } else {
    // Infer headers from unique keys across objects
    const keySet = new Set();
    data.forEach((row) => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach((k) => keySet.add(k));
      }
    });
    resolvedHeaders = Array.from(keySet).map((key) => ({ key, label: key }));
  }

  const headerRow = resolvedHeaders.map((h) => escapeCSVValue(h.label)).join(',');

  const dataRows = data.map((row) => {
    return resolvedHeaders
      .map((header) => {
        const value = row ? row[header.key] : '';
        return escapeCSVValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Triggers a browser download of a CSV file given blob data or CSV string.
 * Automatically cleans up the created object URL.
 *
 * @param {Blob | string} blobData - CSV data as Blob or plain string
 * @param {string} [filename='export.csv'] - Downloaded file name
 * @returns {void}
 *
 * @example
 * const csvString = "Company,Score\nAcme,12";
 * downloadCSVBlob(csvString, "jobshield-analysis.csv");
 * console.log('Download initiated successfully');
 */
export function downloadCSVBlob(blobData, filename = 'export.csv') {
  if (typeof window === 'undefined') {
    console.warn('downloadCSVBlob: Window object not found. Skipping download.');
    return;
  }

  try {
    const blob = blobData instanceof Blob
      ? blobData
      : new Blob([blobData || ''], { type: 'text/csv;charset=utf-8;' });

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', blobUrl);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Clean up DOM and memory
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('downloadCSVBlob: Error triggering download:', error);
  }
}

export default {
  convertToCSV,
  downloadCSVBlob,
};
