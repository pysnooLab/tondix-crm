# TASK-007 — Reflection

> Écrit par JEROME après réception de toutes les reviews (JIBE + FRANCIS + GUILLAUME + ALEXANDRA).

## Ce que j'ai appris
- Le filtre `stage: "won"` doit être dans `useGetList` côté serveur, pas un `.filter()` côté JS — sinon on récupère tous les deals pour rien et on expose des données non pertinentes
- Le filtre `@in` de ra-data-postgrest attend le format `(id1,id2,id3)` avec parenthèses dans la string : `{ "deal_id@in": \`(\${dealIds.join(",")})\` }`
- Les sections "état vide" doivent toujours afficher un message explicite (pas `return null`) — l'utilisateur doit voir que la section existe même sans données, sinon il peut croire à un bug de chargement
- Le statut d'un contrat de maintenance se calcule sur `end_date > now()`, pas sur le champ `status` de la table — c'est la date qui fait foi, le champ `status` peut être désynchronisé
- Point FRANCIS (sécurité) : les filtres frontend (`stage: "won"`, `company_id`) ne suffisent pas comme garantie de sécurité — il faut vérifier que les RLS Supabase empêchent l'accès à des données hors périmètre. À traiter côté backend dans un ticket dédié

## Ce qui était tricky
- La chaîne de requêtes dépendantes : `wonDeals` → `dealIds` → `dealProducts` → `productIds` → `products` — chaque étape doit attendre la précédente via `enabled` guards, sinon on déclenche des requêtes avec des paramètres vides
- Le groupement des deal_products par `product_id` avec somme des quantités et collecte des noms de deals associés — nécessite une Map intermédiaire et la résolution des noms depuis deux sources (products + deals)
- Les titres de section avec emojis et Badge : première implémentation trop austère (simple `<h3>` avec count entre parenthèses), corrigée après retour ALEXANDRA pour être cohérente avec le design system
- Séparer "Période" en deux colonnes "Début" / "Fin" plutôt qu'une seule colonne fusionnée — plus lisible mais pas évident au premier passage

## Ce que j'aurais fait différemment
- Aurais commencé par les états vides dès la première implémentation — c'est un pattern systématique dans ce projet, pas un nice-to-have
- Aurais consulté les conventions UI existantes (emojis, Badge) avant de coder les titres, plutôt que d'improviser un `<h3>` basique
- Aurais séparé les colonnes de dates dès le départ — une colonne "Période" fusionnée est un raccourci qui nuit à la lisibilité

## Patterns à réutiliser
- Filtre `@in` avec guard : `{ "field@in": \`(\${ids.join(",")})\` }` + `{ enabled: ids.length > 0 }` — pattern obligatoire pour toute requête dépendante d'une liste d'IDs
- Chaîne useGetList → useGetMany : récupérer les IDs dans une première requête, puis résoudre les noms/détails avec `useGetMany` sur la resource cible
- État vide de section : toujours rendre le conteneur avec titre + message "Aucun X" plutôt que `return null`
- Badge pour les counts dans les titres de section : `<Badge variant="secondary">{count}</Badge>`
- Dates en français : `new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long" }).format(new Date(dateStr))`
- Statut calculé sur date : `new Date(end_date) > new Date()` pour actif/expiré, ne pas se fier au champ `status`
