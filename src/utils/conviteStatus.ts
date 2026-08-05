const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseExpiraEm(expiraEm: string): Date {
  if (DATE_ONLY.test(expiraEm)) {
    const [y, m, d] = expiraEm.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  return new Date(expiraEm);
}

export function isExpirado(expiraEm: string): boolean {
  return parseExpiraEm(expiraEm) < new Date();
}
