// RFC 4180-style escaping: fields containing commas, quotes, or newlines are
// wrapped in double quotes, with inner quotes doubled.
export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}
