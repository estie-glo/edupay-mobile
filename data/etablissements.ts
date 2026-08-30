export type Etablissement = {
  nom: string;
  ville: string;
  type: string;
};

// Pas de route /etablissements/search dans l'API annoncée par le backend : on
// reprend la liste réellement affichée sur edupay.mekontso.gsi2026.com (capture
// du 30/08/2026) plutôt que de laisser ces sections vides.
export const ETABLISSEMENTS: Etablissement[] = [
  { nom: 'Collège la dignite', ville: 'Yaoundé', type: 'Maternelle' },
  { nom: 'Collège Sainte-Marie', ville: 'Yaoundé', type: 'Collège' },
  { nom: 'Lycée Bilingue de Melen', ville: 'Yaoundé', type: 'Lycée général' },
  { nom: "Lycée d'éligibilité essono", ville: 'Yaoundé', type: 'Lycée général' },
  { nom: "lycee d'estelle", ville: 'yaounde', type: 'Maternelle' },
  { nom: 'lycee de KL', ville: 'yaounde', type: 'Lycée technique' },
  { nom: 'SAR/SM batcham', ville: 'Batcham ville', type: 'Lycée technique' },
];

export const TYPES_ETABLISSEMENT = ['Maternelle', 'Collège', 'Lycée général', 'Lycée technique'];
