/// <reference lib="webworker" />

/**
 * Vérifie si un numéro de déclaration est valide
 * en fonction du code postal de Paris (75xxx).
 *
 * - L'ID doit commencer par "75" et avoir 13 chiffres.
 * - L'arrondissement est extrait à la fois de l'ID et du code postal,
 *   puis comparé.
 */
const isIdNumberValid = (id: string, postalCode: string | null = null): [boolean, 'format' | 'code postal' | null] => {
  if (!/^75\d{11}$/.test(id)) return [false, 'format'];

  if (!postalCode) return [true, null]

  // Extraire l'arrondissement depuis l'ID (4e et 5e chiffre)
  const arrondissementFromId = id.substring(3, 5);

  // Le code postal doit être de la forme 750xx
  if (!/^750\d{2}$/.test(postalCode)) return [false, 'code postal'];

  // Extraire l'arrondissement depuis le code postal
  const arrondissementFromPostal = postalCode.substring(3, 5);

  // Les arrondissements doivent correspondre
  const postalCodeError = arrondissementFromId === arrondissementFromPostal;
  return postalCodeError ? [false, 'code postal'] : [true, null]
};

/**
 * Traitement principal du Web Worker
 * Analyse le dataset reçu et le compare au téléservice.
 *
 * - Détecte les doublons dans le fichier
 * - Détecte les IDs inconnus du téléservice
 * - Détecte les IDs invalides par rapport au code postal
 */
self.onmessage = (event) => {
  const { source, inactiveSource, dataset, idCol, postalCodeCol, streetNumberCol, streetNameCol } = event.data;

  // Ensemble des IDs valides connus dans le téléservice
  const sourceIds = new Set(source.map((t: Record<string, unknown>) => t.numero_declaration?.toString()));

  // Suivi des occurrences d’IDs pour détecter les doublons
  const idCounts = new Map<string, number>();
  const firstOccurrence = new Map<string, Record<string, unknown>>();

  // Résultats de l’analyse
  let duplicateNights: Record<string, unknown>[] = [];
  let unknownNights: Record<string, unknown>[] = [];
  const invalidNights: Record<string, unknown>[] = [];

  const inactiveSourceIds: Set<string> = inactiveSource ?
    new Set(inactiveSource.map((inactive: { 'Numéro Meuble': string }) => inactive['Numéro Meuble'].toString())) :
    new Set([])

  for (const item of dataset) {
    const id = item[idCol]?.toString();
    const postalCode = item[postalCodeCol]?.toString();

    if (!id) continue;

    // Vérification des doublons
    const count = (idCounts.get(id) ?? 0) + 1;
    idCounts.set(id, count);
    if (count > 1) {
      duplicateNights.push(item);
      if (count === 2) {
        duplicateNights.push(firstOccurrence.get(id)!)
      }
    } else {
      firstOccurrence.set(id, item);
    }

    // Vérification de la présence dans le téléservice
    const matched = sourceIds.has(id);

    // Vérification de la validité ID + code postal
    const [isValid, errorType] = isIdNumberValid(id, postalCode)

    if (!matched) unknownNights.push(item);
    if (!isValid) invalidNights.push({
      'ERROR TYPE': errorType,
      ...item,
    });
  }

  const addressesById = duplicateNights.reduce<Record<string, Set<string>>>((acc, item) => {
    const id = item[idCol]?.toString();
    const postalCode = item[postalCodeCol]?.toString();
    const streetNumber = item[streetNumberCol]?.toString();
    const streetName = item[streetNameCol]?.toString();

    const address = `${streetNumber}${streetName}${postalCode}`.toLowerCase();

    if (!acc[id!]) {
      acc[id!] = new Set();
    }
    acc[id!].add(address);

    return acc;
  }, {});

  duplicateNights = duplicateNights.map((night) => {
    const id: string = night[idCol]?.toString() as string;

    return {
      'COUNT': idCounts.get(id),
      'DIFFERENT ADDRESSES': addressesById[id!].size,
      ...night,
    }
  })

  unknownNights = unknownNights.map((night) => {
    const id: string = night[idCol]?.toString() as string;

    return {
      'IS INACTIVE': inactiveSourceIds.has(id) ? 'Oui' : 'Non',
      ...night,
    }
  })

  // On renvoie les résultats au thread principal
  self.postMessage({ unknownNights, duplicateNights, invalidNights, raw: dataset });
};
