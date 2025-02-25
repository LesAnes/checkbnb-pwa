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
  if (!source) {
    return {
      unknownNights: [],
      duplicateNights: [],
      invalidNights: [],
    }
  }

  // Fusion des données avec la source (ex: teleservice)
  const merged = dataset.map((item) => ({
    ...item,
    matched: source.some((t) => t.numero_declaration!.toString() === item[idCol]!.toString()),
    isValid: isIdNumberValid(item[idCol]!.toString(), item[postalCodeCol]!.toString()),
  }));

  // Nuitées inconnues (ID non trouvé dans la source)
  const unknownNights = merged.filter((item) => !item.matched);

  // Nuitées en double
  const duplicateNights = dataset.filter(
    (item, index, arr) => arr.findIndex((i) => i[idCol]!.toString() === item[idCol]!.toString()) !== index
  );

  // Nuitées invalides (ID mal formé ou code postal incorrect)
  const invalidNights = merged.filter((item) => !item.isValid);

  return {
    unknownNights,
    duplicateNights,
    invalidNights,
  };
};
