/**
 * Calculate days remaining until a target date
 * @param targetDate - The target date in YYYY-MM-DD format
 * @returns Number of days remaining (negative if past)
 */
export function calcDaysTo(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string (YYYY年MM月DD日)
 */
export function formatJapaneseDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * Get the fiscal year (年度) from a date
 * Japanese fiscal year starts in April
 * @param dateString - ISO date string
 * @returns Fiscal year (e.g., 2024)
 */
export function getFiscalYear(dateString: string): number {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // If month is Jan-Mar, fiscal year is previous year
  return month >= 4 ? year : year - 1;
}

/**
 * Get current fiscal year
 * @returns Current fiscal year
 */
export function getCurrentFiscalYear(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return month >= 4 ? year : year - 1;
}

/**
 * Format relative time (e.g., "2日前", "1週間前")
 * @param dateString - ISO date string
 * @returns Relative time string in Japanese
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;

  return `${Math.floor(diffDays / 365)}年前`;
}
