const normalizeText = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
};

export const isPublicInstitution = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = normalizeText(value);
    return [
      's',
      'sim',
      'publica',
      'publico',
      'public',
      'true',
      'gratuito',
      'gratuita',
    ].includes(normalized);
  }

  return false;
};

export const getInstitutionTypeLabel = (value: unknown): 'Pública' | 'Privada' => {
  return isPublicInstitution(value) ? 'Pública' : 'Privada';
};

export const matchesInstitutionType = (value: unknown, desiredType: 'Pública' | 'Privada'): boolean => {
  const isPublic = isPublicInstitution(value);
  return desiredType === 'Pública' ? isPublic : !isPublic;
};
