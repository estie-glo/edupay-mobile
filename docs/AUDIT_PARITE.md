# Audit de parité web ↔ mobile

Dernier audit complet : **27/09/2026**, contre le backend
`stevetelecom/edupay-cameroun` (commit `3b3321b`, tous les commits
"audit" D à U + tous les commits suivants vérifiés individuellement).

## Audit exhaustif des routes (27/09/2026)

Comparaison complète de `routes/api.php` (toutes les routes, avec leur
préfixe exact résolu manuellement) contre chaque appel de
`services/api.ts`, plutôt que de se fier aux vérifications ponctuelles
précédentes. Trois routes entières jamais câblées trouvées et comblées :

- `POST /etablissement/frais/{id}/dupliquer` + `POST /etablissement/
  frais/purger-annees-passees` — dupliquer une catégorie de frais (+
  échéanciers, décalés d'un an) vers l'année suivante, et purger
  définitivement les années passées. Testé en réel (duplication +
  purge de 6 catégories de test confirmées).
- `PUT /apprenants/{id}` (`ApprenantController::updateInfo`) — un parent
  peut modifier prénom/nom/classe/matricule de son enfant ; le web a la
  page dédiée (`/mes-apprenants/{id}/modifier`), le mobile n'avait que
  rattacher/détacher. Testé en réel.
- `GET /frais-apprenants/{id}` (`Api\FraisController::show`) — détail
  d'un dossier de frais + historique de ses paiements, équivalent web
  `/paiement/{fraisApprenant}`. Ajouté à `PaiementScreen` en best-effort
  (n'empêche jamais de payer si l'appel échoue). Testé en réel avec et
  sans historique.

Route `GET /apprenants/mes-enfants` (`mesEnfants`) : délibérément non
câblée — `GET /dashboard` (déjà utilisée) couvre le même besoin en plus
riche (est_solo, premier_frais_impaye_solo). Pas un écart, un doublon
évité.

## Re-vérification écran par écran (27/09/2026, en attendant un retour)

Pendant l'attente d'un retour de Steve, re-vérification systématique de
chaque écran contre le contrôleur réel actuel (pas seulement les écrans
touchés par un commit visible) — deux bugs de plus trouvés, indépendants
des correctifs récents :

| Écran | Bug | Détail |
|-------|-----|--------|
| `ReclamationsScreen` | Style "rejetee" (double e) ne correspondait jamais à l'enum réel `rejete` | Toute réclamation rejetée retombait sur le style générique. |
| `ReclamationsScreen` | Lisait `r.reponse`/`r.motif_rejet`, aucun des deux n'existe dans `ReclamationResource` (le vrai champ est `reponse_admin`, unique) | La réponse d'un admin n'était **jamais** affichée au payeur, quel que soit le statut. |
| `ProfilScreen` (payeur) | Changer le mot de passe révoque désormais tous les tokens Sanctum côté serveur (y compris celui de la requête) — correctif sécurité non annoncé | L'app restait "connectée" avec un token mort après un changement de mot de passe réussi, cassant silencieusement tout appel suivant. Corrigé (signOut() après succès). Confirmé en réel (401 si l'ancien token est réutilisé). |
| `EcoleProfilScreen` | Regex de mot de passe mobile sans exigence de minuscule, alors que le serveur école l'exige | Un mot de passe valide pour le payeur pouvait être rejeté côté école sans que le mobile l'anticipe. Corrigé. **Point notable** : côté école, le changement de mot de passe NE révoque PAS les tokens (vérifié en réel, contrairement au payeur) — aucun signOut() ajouté là, ce serait une déconnexion inutile. |

Écrans re-vérifiés sans écart trouvé : `EcoleUtilisateursScreen` (invitation
+ changement de rôle + suppression, testés en réel de bout en bout),
`EcoleRapportsScreen` (export PDF + "Excel" confirmés — ce dernier est en
réalité un CSV, déjà correctement nommé `.csv` côté mobile), `EcoleParametresScreen`.

Derniers commits vérifiés sans impact mobile : double enregistrement
d'abonnement à la création (intégrité serveur pure), i18n super admin +
modales abonnements web (hors périmètre mobile), nettoyage de fichiers
`.bak`, ancre de scroll sur la landing web. Le correctif sur les durées/
montants d'abonnement, lui, ajoute des champs consommés côté mobile
(`duree_mois`, `montant_mensuel`, `montant_total` sur `GET /etablissement/
abonnement`) — affichés dans `EcoleAbonnementScreen`, vérifié en réel.

## À savoir pour le futur chantier de traduction FR/EN

Deux commits i18n (`64e58b4`, `e2a7552`) sont sans impact mobile — le
2e ne touche que des vues Blade web ; le 1er ajoute des messages
d'erreur API traduits FR/EN (401/403/404/422/429), **mais uniquement si
le client signale explicitement une langue** (`?lang=en`, session ou
cookie `locale` — jamais `Accept-Language`, exprès pour ne rien changer
aux clients existants). Vérifié en réel : sans ce signal, le mobile
reçoit toujours le français, mot pour mot, comme avant.

Point utile pour le chantier de traduction reporté (voir README) :
le rétablissement mobile pourrait profiter de messages d'erreur en
anglais gratuitement en ajoutant `?lang=en` à ses requêtes quand la
préférence de langue est EN — sans attendre une traduction complète de
l'UI. Ne couvre que les messages d'erreur, pas les données.

## Test en conditions réelles (27/09/2026)

Le flux de paiement corrigé (voir plus bas) a été testé en direct contre la
production (`https://edupay.mekontso.gsi2026.com`), avec le compte de test
`690001122` / `TestClaude@2026` (id=41) :

- Rattachement d'un apprenant réel (mode matricule et mode recherche) : OK.
- `POST /paiements/initier` avec `mode_paiement` + `type_paiement` (les
  champs corrigés) : **201, statut `en_attente`**, message de confirmation
  USSD — la requête n'échoue plus en 422.
- Montant client falsifié : rejeté ou ignoré selon le cas, le serveur
  calcule toujours le montant réel côté serveur (reste_du) — le paiement est
  transmis à l'agrégateur avec le bon montant, jamais celui envoyé par le
  client.
- `POST /paiements/{id}/verifier` (polling) : fonctionne, statut `echoue`
  correctement affiché sans crash (numéro de test sans solde réel côté
  agrégateur — comportement attendu, pas un bug mobile).

À cette occasion, un nouvel écart introduit par un correctif backend plus
récent que le dernier audit (sécurité "audit T", cloisonnement du
rattachement par établissement) a été trouvé et corrigé : le rattachement
en mode recherche exige désormais `nom` obligatoirement (avant, `prénom`
seul suffisait). Confirme, une fois de plus, qu'il faut réauditer après
chaque vague de correctifs backend plutôt que de supposer une stabilité.

**Annulation de paiement** (`POST /paiements/{id}/annuler`) testée le
27/09/2026 avec un paiement `en_attente` réel (créé puis annulé
immédiatement, avant que l'agrégateur ne le résolve lui-même — les
paiements de test se résolvent en `echoue` en quelques secondes) :
succès (200, statut `annulé`), 2e tentative correctement rejetée (422,
idempotent), l'historique reflète bien le nouveau statut.

**Audit complet des 8 commits "audit" du backend** (D, E-F, G-H, I-J-K,
L-M-N-O, Q-R, T, U — pas seulement les 3 premiers) : 2 bugs
supplémentaires trouvés, préexistants et indépendants de ces correctifs :

| Écran | Bug | Impact |
|-------|-----|--------|
| `EcoleSitesScreen` | Création/édition d'un site sans `email` ni les 3 champs `directeur_*` (obligatoires — créer un site crée aussi un compte directeur), `adresse` au lieu de `quartier` | Toute création de site échouait en 422 |
| `EcoleRemboursementsScreen` | "Refuser" un remboursement n'envoyait jamais de motif, obligatoire côté API (audit N) | Tout refus échouait en 422 (corrigé par un formulaire inline — `Alert.alert` ne permet pas de saisie sur Android) |

Corrections mineures liées à l'audit U (traçabilité + anti-spam des
relances) : ajout de `force` pour retenter après un 429 "déjà relancé
dans les 24h", et correction du texte "SMS" en "email" (les relances
partent bien par email).

**Relances et remboursements testés en réel (27/09/2026)**, avec le
compte directeur de seed (`677000001` / `password`, Lycée Bilingue de
Melen — la seule paire d'identifiants côté établissement disponible ;
aucun compte de test directeur/comptable n'existait avant, découvert
dans `database/seeders/DatabaseSeeder.php` du backend) :

- Relance individuelle et groupée : `422` tant que le parent n'a pas
  d'email (comportement correct, pas un bug) ; `200` une fois un email
  renseigné sur le compte payeur de test, `derniere_relance` correctement
  renseignée ensuite (`{date, canal: "email"}`, confirmant l'audit U).
- Anti-spam 24h : `429` confirmé sur une 2e relance immédiate, `force:
  true` confirmé pour l'outrepasser — les deux chemins fonctionnent tels
  qu'implémentés côté mobile.
- Demande de remboursement : bug réel trouvé et corrigé (`montant`
  obligatoire jamais envoyé, 422 systématique) — voir tableau plus haut.
  Une fois corrigé, la requête passe la validation ; seule la règle
  métier "paiement validé requis" bloque ensuite.
- **Limite du test** : impossible de tester le cycle complet approuver/
  refuser un remboursement — aucun paiement de test n'atteint jamais le
  statut `valide` dans le bac à sable de l'agrégateur (les numéros
  fictifs résolvent systématiquement en `echoue`). Le code d'approbation/
  refus (motif obligatoire, formulaire inline) a été vérifié par lecture
  du contrôleur réel, mais pas exécuté de bout en bout avec un vrai
  paiement validé.

## Méthode

Le backend évolue vite (plusieurs commits par jour). Ne jamais se fier à une
doc de planification (`docs/DOCUMENTATION_API.md` sur le backend — c'est un
CDC de juin 2026, largement dépassé par l'implémentation réelle) ni à une
lecture ancienne de ce dépôt. Avant de conclure quoi que ce soit :

1. `git pull` le backend cloné localement, regarder `git log --oneline -30`
   pour repérer les commits `fix(api)`, `fix(audit...)` récents.
2. Pour chaque route utilisée par `services/api.ts`, relire le contrôleur
   réel (`routes/api.php` → classe → méthode) et comparer champ par champ
   avec le type TypeScript et le rendu de l'écran qui la consomme.
3. Ne jamais supposer qu'une forme de réponse est stable — le backend a déjà
   changé la forme de `GET /etablissement/dashboard` et `GET /etablissement/
   impayes` en cours de session sans changer l'URL.

## Bugs critiques trouvés et corrigés (27/09/2026)

Causés par 3 commits backend du jour même (`ca20bcb`, `53c5b85`, `7808b55`)
qui ont changé la forme de réponses déjà consommées par le mobile :

| Écran | Bug | Impact |
|-------|-----|--------|
| `PaiementScreen` | `initierPaiement` envoyait `mode` au lieu de `mode_paiement` | **Tout paiement échouait en 422**, quel que soit le mode |
| `PaiementScreen` | `type_paiement` jamais envoyé | Choisir "Tranche suivante" aurait débité le solde total une fois le bug ci-dessus corrigé |
| `BackOfficeScreen` | lisait `total_encaisse`/`nb_apprenants`/`nb_dossiers_impayes`/`nom_etablissement` à plat, en réalité sous `data.kpis.*` / `data.etablissement.nom` | 4 KPI toujours à 0, titre toujours vide |
| `BackOfficeScreen` | liste des impayés passée de `{synthese, frais_impayes, pagination}` à un tableau plat `{apprenant_id, nom, montant_du, dernier_paiement, telephone_parent}` | **Crash certain** dès qu'un établissement a un impayé (`imp.montant` n'existe plus) |

Tous corrigés dans le commit `487127c`.

## Améliorations backend suivies (audit E-F, déjà réconciliées)

- `ApprenantResource` expose désormais `statut` (`en_attente`/`valide`/`actif`,
  dérivé de `Apprenant::statutRattachement()` — pas de valeur `rejete`, le
  rejet supprime l'apprenant) et `total_du`/`total_paye`/`solde_du`.
- Mobile mis à jour pour lire `statut` directement (au lieu d'inférer via
  `valide_par_etablissement`) et afficher le reste dû sur la liste apprenants.

## Écarts de parité comblés (audit du 26-27/09/2026)

- Rattachement d'un enfant : mode "recherche" (nom/prénom/classe, avec
  désambiguïsation) ajouté en plus du mode matricule exact.
- Fiche établissement publique (`EtablissementPublicScreen`, logo/description/
  contact/catégories de frais) — câblée depuis les cartes enfants.
- Édition d'un site multi-établissements (create+delete → create+edit+delete).
- Écran Paramètres, Abonnement (paywall), Aide établissement, Reçus &
  certificats, notifications cliquables, dashboard payeur vue Solo.
- Fiche apprenant détaillée + suppression en masse.
- Filtres serveur (recherche, classe, statut de paiement) + pagination sur la
  liste des apprenants établissement (remplace un filtrage 100% client limité
  aux 20 premiers résultats).
- Édition complète des frais + échéanciers (create+delete → create+edit+delete),
  et deux bugs 422 systématiques corrigés (`annee_scolaire` et `nb_tranches_max`
  manquants à la création, `date_echeance` manquant à l'ajout d'échéance).

## Limites résolues depuis (27/09/2026, commit backend `026c131`)

Les deux premières limites listées ci-dessous ont été corrigées côté backend
puis câblées côté mobile le même jour, testées en réel :

- **Export PDF de l'historique** : `GET /paiements/export` (jeton payeur,
  filtres `du`/`au` optionnels) — câblé dans `HistoriqueScreen`, testé
  (PDF A4 valide reçu, vérifié avec `pdfinfo`).
- **Activer/désactiver une catégorie de frais** (`actif`) : accepté sur
  `POST`/`PUT /etablissement/frais/{id}` — toggle ajouté dans `EcoleFraisScreen`
  (création + édition) avec badge "Désactivée" sur les catégories inactives
  (l'API ne les distingue pas dans la liste). Testé en réel (bascule
  true→false→true confirmée persistée).

## Limites backend connues (pas des bugs mobile — vérifié dans le vrai code)

| Sujet | Détail |
|-------|--------|
| Annuaire public d'établissements | Aucune route API ne liste tous les établissements sans authentification (seul `GET /etablissements/{code}`, un seul, existe). Le commit `026c131` a corrigé la recherche/pagination de l'annuaire, mais uniquement sur la page web (`Public/LandingController`, vue Blade) — aucune route API ajoutée. La recherche d'école sur la landing mobile utilise donc toujours une liste statique (`data/etablissements.ts`). **Fix web testé en réel le 27/09/2026** (page `/`) : recherche par nom, ville et code exact toutes exactes (1, 6, 1 résultat respectivement sur les cas testés), compteur "X établissement(s) trouvé(s)" fiable, message "Aucun établissement trouvé" distinct, filtre `type` correct (2 résultats sur `lycee_general`), joker LIKE (`%`) correctement échappé (0 résultat, pas "tout"). Pagination au-delà de 12 non testable : seulement 7 établissements actifs existent en prod actuellement. |
| Deux adresses de contact | `contact@edupay.cm` (public/payeur) vs `contact@mekontso.gsi2026.com` (page Aide établissement) — fait réel du backend, à clarifier avec l'équipe backend si c'est une erreur de leur côté, pas un bug mobile. |
| Traduction FR/EN (UI) | Le web bascule côté session Laravel (`resources/lang/{fr,en}`). Le mobile n'a aucune couche de traduction de l'UI — reporté (voir README). Les messages d'erreur API sont déjà traduisibles via `?lang=en` (voir plus haut) — l'UI elle-même ne l'est pas encore. |

## Écrans retirés (décision produit, pas un écart technique)

`SimulateurScreen`, `FonctionnalitesScreen`, `CommentScreen` — aucun
équivalent sur le site web, retirés du mobile le 26/09/2026.
