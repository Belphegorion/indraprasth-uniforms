import { ISchool } from '@indraprasth/shared';

export interface SchoolLogoMeta {
  code: string;
  shortName: string;
  logoUrl: string;
  fallbackUrl: string;
}

/**
 * High-resolution, optimized school logos for Bhopal partner institutions.
 */
export const SCHOOL_LOGO_MAP: Record<string, SchoolLogoMeta> = {
  bhis: {
    code: 'BHIS',
    shortName: 'Billabong High',
    logoUrl: '/school-logos/bhis.webp',
    fallbackUrl: '/school-logos/bhis.jpg',
  },
  'billabong-high-international-school': {
    code: 'BHIS',
    shortName: 'Billabong High',
    logoUrl: '/school-logos/bhis.webp',
    fallbackUrl: '/school-logos/bhis.jpg',
  },
  dps: {
    code: 'DPS',
    shortName: 'DPS Bhopal',
    logoUrl: '/school-logos/dps.webp',
    fallbackUrl: '/school-logos/dps.png',
  },
  'dps-bhopal': {
    code: 'DPS',
    shortName: 'DPS Bhopal',
    logoUrl: '/school-logos/dps.webp',
    fallbackUrl: '/school-logos/dps.png',
  },
  'dps kolar': {
    code: 'DPS KOLAR',
    shortName: 'DPS Kolar',
    logoUrl: '/school-logos/dps.webp',
    fallbackUrl: '/school-logos/dps.png',
  },
  'dps-kolar': {
    code: 'DPS KOLAR',
    shortName: 'DPS Kolar',
    logoUrl: '/school-logos/dps.webp',
    fallbackUrl: '/school-logos/dps.png',
  },
  ies: {
    code: 'IES',
    shortName: 'IES Public',
    logoUrl: '/school-logos/ies.webp',
    fallbackUrl: '/school-logos/ies.png',
  },
  'ies-public-school': {
    code: 'IES',
    shortName: 'IES Public',
    logoUrl: '/school-logos/ies.webp',
    fallbackUrl: '/school-logos/ies.png',
  },
  sps: {
    code: 'SPS',
    shortName: 'Sagar Public',
    logoUrl: '/school-logos/sps.webp',
    fallbackUrl: '/school-logos/sps.png',
  },
  'sps-bhopal': {
    code: 'SPS',
    shortName: 'Sagar Public',
    logoUrl: '/school-logos/sps.webp',
    fallbackUrl: '/school-logos/sps.png',
  },
  tsvs: {
    code: 'TSVS',
    shortName: 'Sanskaar Valley',
    logoUrl: '/school-logos/tsvs.webp',
    fallbackUrl: '/school-logos/tsvs.png',
  },
  'the-sanskaar-valley-school': {
    code: 'TSVS',
    shortName: 'Sanskaar Valley',
    logoUrl: '/school-logos/tsvs.webp',
    fallbackUrl: '/school-logos/tsvs.png',
  },
  jss: {
    code: 'JSS',
    shortName: "St. Joseph's",
    logoUrl: '/school-logos/jss.webp',
    fallbackUrl: '/school-logos/jss.png',
  },
  stj: {
    code: 'STJ',
    shortName: "St. Joseph's",
    logoUrl: '/school-logos/jss.webp',
    fallbackUrl: '/school-logos/jss.png',
  },
  'st-joseph-higher-secondary-school': {
    code: 'JSS',
    shortName: "St. Joseph's",
    logoUrl: '/school-logos/jss.webp',
    fallbackUrl: '/school-logos/jss.png',
  },
  'st-josephs-coed': {
    code: 'STJ',
    shortName: "St. Joseph's",
    logoUrl: '/school-logos/jss.webp',
    fallbackUrl: '/school-logos/jss.png',
  },
};

/**
 * Returns the best available logo URL for a school.
 * Checks the curated local logo map first for authentic Bhopal institutions,
 * then falls back to school.logoUrl if set and not a placeholder or product image.
 */
export function getSchoolLogoUrl(school?: Partial<ISchool> | null): string | undefined {
  if (!school) return undefined;

  const codeKey = school.code?.toLowerCase().trim() || '';
  const slugKey = school.slug?.toLowerCase().trim() || '';
  const nameKey = school.name?.toLowerCase().trim() || '';

  // 1. Direct match in curated logo map
  let meta = SCHOOL_LOGO_MAP[codeKey] || SCHOOL_LOGO_MAP[slugKey];

  // 2. Fuzzy match based on canonical school identifiers
  if (!meta && nameKey) {
    if (nameKey.includes('billabong')) meta = SCHOOL_LOGO_MAP['bhis'];
    else if (nameKey.includes('sanskaar')) meta = SCHOOL_LOGO_MAP['tsvs'];
    else if (nameKey.includes('kolar')) meta = SCHOOL_LOGO_MAP['dps-kolar'];
    else if (nameKey.includes('delhi public') || nameKey.includes('dps')) meta = SCHOOL_LOGO_MAP['dps'];
    else if (nameKey.includes('sagar')) meta = SCHOOL_LOGO_MAP['sps'];
    else if (nameKey.includes('ies')) meta = SCHOOL_LOGO_MAP['ies'];
    else if (nameKey.includes('joseph')) meta = SCHOOL_LOGO_MAP['jss'];
  }

  if (meta?.logoUrl) {
    return meta.logoUrl;
  }

  // 3. Fallback to school record if valid
  if (
    school.logoUrl &&
    school.logoUrl.trim().length > 0 &&
    !school.logoUrl.includes('placeholder') &&
    !school.logoUrl.includes('/products/')
  ) {
    return school.logoUrl;
  }

  return meta?.fallbackUrl || undefined;
}

/**
 * Returns a concise institution name (e.g. "Sanskaar Valley", "Billabong High", "DPS Bhopal")
 * prioritizing institution identity over raw acronyms.
 */
export function getSchoolShortLabel(school?: Partial<ISchool> | null): string {
  if (!school) return '';
  const codeKey = school.code?.toLowerCase().trim() || '';
  const slugKey = school.slug?.toLowerCase().trim() || '';
  const nameKey = school.name?.toLowerCase().trim() || '';

  let meta = SCHOOL_LOGO_MAP[codeKey] || SCHOOL_LOGO_MAP[slugKey];
  if (!meta && nameKey) {
    if (nameKey.includes('billabong')) meta = SCHOOL_LOGO_MAP['bhis'];
    else if (nameKey.includes('sanskaar')) meta = SCHOOL_LOGO_MAP['tsvs'];
    else if (nameKey.includes('kolar')) meta = SCHOOL_LOGO_MAP['dps-kolar'];
    else if (nameKey.includes('delhi public') || nameKey.includes('dps')) meta = SCHOOL_LOGO_MAP['dps'];
    else if (nameKey.includes('sagar')) meta = SCHOOL_LOGO_MAP['sps'];
    else if (nameKey.includes('ies')) meta = SCHOOL_LOGO_MAP['ies'];
    else if (nameKey.includes('joseph')) meta = SCHOOL_LOGO_MAP['jss'];
  }

  return meta?.shortName || school.name || '';
}


