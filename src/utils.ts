const isIdNumberValid = (id: string, postalCode: string): boolean => {
  if (!/^75\d{11}$/.test(id)) return false;

  // Extraire l'arrondissement depuis l'ID (4e et 5e chiffre)
  const arrondissementFromId = id.substring(3, 5);

  // Vérifier que le code postal commence par "750" et se termine par l'arrondissement
  if (!/^750\d{2}$/.test(postalCode)) return false;

  // Extraire l'arrondissement depuis le code postal (derniers 2 chiffres)
  const arrondissementFromPostal = postalCode.substring(3, 5);

  // Comparer les arrondissements
  return arrondissementFromId === arrondissementFromPostal;
};

export const analyzeData = (
  source: Record<string, unknown>[],
  dataset: Record<string, unknown>[],
  idCol: string,
  postalCodeCol: string
): { unknownNights: Record<string, unknown>[], duplicateNights: Record<string, unknown>[], invalidNights: Record<string, unknown>[] } => {
  if (!source || !dataset) {
    return {
      unknownNights: [],
      duplicateNights: [],
      invalidNights: [],
    };
  }

  const sourceIds = new Set(source.map((t) => t.numero_declaration?.toString()));
  const seenIds = new Set<string>();
  const duplicateNights: Record<string, unknown>[] = [];
  const unknownNights: Record<string, unknown>[] = [];
  const invalidNights: Record<string, unknown>[] = [];

  for (const item of dataset) {
    const id = item[idCol]?.toString();
    const postalCode = item[postalCodeCol]?.toString();

    if (!id) continue; // Ignore les entrées sans ID valide

    // Détection des doublons en une seule passe
    if (seenIds.has(id)) {
      duplicateNights.push(item);
    } else {
      seenIds.add(id);
    }

    const matched = sourceIds.has(id);
    const isValid = postalCode ? isIdNumberValid(id, postalCode) : true;

    if (!matched) unknownNights.push(item);
    if (!isValid) invalidNights.push(item);
  }

  return {
    unknownNights,
    duplicateNights,
    invalidNights,
  };
};
