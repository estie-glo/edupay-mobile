# EduPay Cameroun — Mobile

Application mobile (React Native / Expo SDK 54, Expo Router) pour EduPay Cameroun,
plateforme de collecte des frais scolaires connectant établissements et familles
(MTN Mobile Money, Orange Money, carte bancaire).

Ce mobile consomme l'API REST du backend Laravel
[`stevetelecom/edupay-cameroun`](https://github.com/stevetelecom/edupay-cameroun)
(`/api/v1`, auth par token Sanctum) — c'est le même backend que le site web,
la parité fonctionnelle avec le web est l'objectif (hors module SuperAdmin,
jamais porté sur mobile).

## Démarrage

```bash
npm install
cp .env.example .env   # adapter EXPO_PUBLIC_API_URL (voir commentaires du fichier)
npx expo start
```

`EXPO_PUBLIC_API_URL` doit inclure le préfixe `/api/v1`. Par défaut (`.env` absent),
l'app pointe vers la production (`https://edupay.mekontso.gsi2026.com/api/v1`).
Pour un backend local : `http://10.0.2.2:8000/api/v1` (émulateur Android) ou l'IP
LAN de la machine hôte (appareil physique).

## Structure

```
app/
  _layout.tsx              — enregistrement Expo Router de tous les écrans
  screens/
    commun/                — landing, aide, contact, mentions légales, mot de passe oublié...
    parent/                — espace payeur (parent, élève, étudiant)
    ecole/                 — back-office établissement (directeur/comptable/caissier)
    admin/                 — SuperAdminScreen (stub volontaire, hors périmètre)
services/
  api.ts                   — client Axios unique, toutes les fonctions d'appel API
  storage.ts                — abstraction SecureStore (natif) / localStorage (web)
  fichiers.ts               — téléchargement + partage de PDF (expo-file-system SDK54)
context/
  AuthContext.tsx           — état d'authentification global (token, user, refreshUser)
components/                 — composants partagés (nav, header, boutons)
data/etablissements.ts      — annuaire statique de repli (aucune route publique de
                               listing côté backend — voir Limites connues)
```

Chaque écran suit le même patron : `useEffect` de chargement, `ActivityIndicator`
pendant le chargement, `Alert.alert` en cas d'erreur (avec `error.response?.data?.message`
quand disponible), aucun appel `axios` direct hors de `services/api.ts`.

## Conventions du projet

- Icônes : `lucide-react-native` uniquement, jamais d'émoji.
- Couleurs officielles : Navy `#0B2545` (headers), Vert `#0D9E75` (actions payeur),
  Or `#E8A020` (actions établissement) — volontaire, ne pas uniformiser.
- Toute nouvelle route API doit être vérifiée dans le code réel du backend
  (`routes/api.php` + le contrôleur) avant d'être câblée — ne jamais deviner un nom
  de champ ou une forme de réponse.
- Avant d'écrire du code, consulter la doc Expo SDK 54 versionnée (voir `AGENTS.md`) :
  certaines API (fichiers, notifications...) ont changé de forme depuis les
  versions antérieures.

## Limites connues (côté backend, pas des bugs mobile)

- Pas de route publique listant tous les établissements (seul `GET /etablissements/{code}`,
  un établissement à la fois, existe) → la recherche d'école sur la landing page et
  `EcolesScreen` utilisent une liste statique (`data/etablissements.ts`).
- Pas de route d'export PDF de l'historique de paiement.
- Pas de route pour activer/désactiver une catégorie de frais (`actif`).
- Deux adresses de contact différentes selon le contexte (public : `contact@edupay.cm`,
  établissement : `contact@mekontso.gsi2026.com`) — fait réel du backend, pas une
  incohérence à corriger côté mobile.

## Traduction FR/EN

Reportée : le web bascule la langue côté serveur (session Laravel), l'app mobile n'a
aujourd'hui aucune couche de traduction (tous les textes sont écrits en dur en
français dans chaque écran). Un vrai sélecteur FR/EN fonctionnel nécessite d'extraire
les textes des ~40 écrans dans un dictionnaire — chantier à part, pas encore démarré.

## Scripts

```bash
npx tsc --noEmit     # vérification des types
npx expo lint        # lint
npx expo start --web # démarrage web (utile pour régénérer les routes typées Expo Router)
```
