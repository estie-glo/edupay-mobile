import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import api from './api';

// Télécharge un fichier binaire authentifié (PDF, CSV...) vers le cache local
// puis ouvre la feuille de partage système — c'est ainsi qu'un utilisateur
// "enregistre" un fichier sur mobile (pas de téléchargement navigateur).
export async function telechargerEtPartager(url: string, nomFichier: string): Promise<string> {
  const response = await api.get(url, { responseType: 'arraybuffer' });
  const file = new File(Paths.cache, nomFichier);
  file.write(new Uint8Array(response.data));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
  return file.uri;
}
