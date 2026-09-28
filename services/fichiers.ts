import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from './api';

// Télécharge un fichier binaire authentifié (PDF, CSV...) vers le cache local
// puis ouvre la feuille de partage système — c'est ainsi qu'un utilisateur
// "enregistre" un fichier sur mobile (pas de téléchargement navigateur).
// `nomFichier` ne doit contenir aucune donnée personnelle (nom d'élève...) :
// ce nom est visible par l'app cible dans la feuille de partage, et le
// fichier reste dans le cache après déconnexion tant qu'il n'est pas supprimé
// ci-dessous (audit point 8, 28/09/2026).
export async function telechargerEtPartager(url: string, nomFichier: string): Promise<string> {
  const response = await api.get(url, { responseType: 'arraybuffer' });
  const file = new File(Paths.cache, nomFichier);
  file.write(new Uint8Array(response.data));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
  try {
    file.delete();
  } catch {
    // Le fichier a pu être déplacé/consommé par l'app cible du partage — non bloquant
  }
  return file.uri;
}
