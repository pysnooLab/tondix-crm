# TASK-003 — Reflection

> Écrit par JEROME après réception de toutes les reviews (JIBE, FRANCIS, GUILLAUME, ALEXANDRA — toutes vertes après correction).

## Ce que j'ai appris
- Les champs monétaires (prix) doivent systématiquement avoir `minValue(0)` — c'est une règle de validation métier non négociable, pas un "nice to have"
- Les champs de quantité doivent avoir `minValue(1)` — une quantité nulle n'a pas de sens métier dans un catalogue produit
- Les patterns CRUD du projet (DataTable/DataTable.Col pour les listes, CreateBase+Form, EditBase+Form, ShowBase) sont cohérents et bien établis — les suivre plutôt que réinventer

## Ce qui était tricky
- L'oubli du `minValue(0)` sur le champ `price` a été détecté en review par JIBE (conformité spec) et FRANCIS (sécurité) — un prix négatif est à la fois un bug fonctionnel et une faille potentielle (remboursements abusifs, manipulation de totaux)
- La correction était triviale mais le fait qu'elle ait été manquée montre qu'il faut une checklist mentale pour les validations numériques, pas se fier à l'intuition

## Ce que j'aurais fait différemment
- Aurais appliqué une checklist de validation systématique avant de soumettre aux reviews : pour chaque champ numérique, vérifier min/max/required — la leçon de TASK-002 (vérifier les conventions existantes avant d'écrire) s'applique aussi aux validations
- Aurais relu la spec une dernière fois en comparant champ par champ avec le formulaire implémenté

## Patterns à réutiliser
- Catalogue produit CRUD : `DataTable` + `DataTable.Col` pour la liste, `CreateBase` + `Form` pour la création, `EditBase` + `Form` pour l'édition, `ShowBase` pour le détail
- Validation numérique systématique : `minValue(0)` sur les prix, `minValue(1)` sur les quantités — à appliquer sans exception sur tout champ monétaire ou de comptage
- Checklist pré-review pour les formulaires : parcourir chaque champ et vérifier que les contraintes métier (min, max, required, format) sont toutes présentes dans les validateurs
