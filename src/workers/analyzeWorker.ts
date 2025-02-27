/// <reference lib="webworker" />

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

self.onmessage = (event) => {
  const { source, dataset, idCol, postalCodeCol } = event.data;

  const sourceIds = new Set(source.map((t: Record<string, unknown>) => t.numero_declaration?.toString()));
  const seenIds = new Set<string>();
  const duplicateNights: Record<string, unknown>[] = [];
  const unknownNights: Record<string, unknown>[] = [];
  const invalidNights: Record<string, unknown>[] = [];

  for (const item of dataset) {
    const id = item[idCol]?.toString();
    const postalCode = item[postalCodeCol]?.toString();

    if (!id) continue;

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

  self.postMessage({ unknownNights, duplicateNights, invalidNights });
};
