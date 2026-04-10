# TASK-002 — Reflection

> Écrit par JEROME après réception de toutes les reviews (JIBE approuvé après correction).

## Ce que j'ai appris
- Les types DB du projet utilisent `& Pick<RaRecord, "id">` pour fournir l'`id` — ne pas redéclarer `id: Identifier` dans le corps du type, c'est redondant et incohérent avec les conventions existantes (Sale, Company, Contact, etc. ne le font pas)
- `DealProductLine` et `DealServiceLine` sont des types de formulaire (react-hook-form), pas des records DB : pas de `& Pick<RaRecord, "id">`, pas de champ `id`
- Les tests de type avec `expectTypeOf` de vitest sont des assertions compile-time — ils passent via le typecheck mais ne s'exécutent pas dans le browser runner du projet

## Ce qui était tricky
- Distinguer les types "record DB" (qui ont un id en base) des types "virtuels formulaire" (qui n'ont pas d'id) — la distinction est fonctionnelle, pas juste stylistique
- Penser à la symétrie des tests : si on teste `DealProductLine` sans id, tester aussi `DealServiceLine` sans id

## Ce que j'aurais fait différemment
- Aurais regardé les types existants (Sale, Company) avant d'écrire les nouveaux, pour détecter le pattern `& Pick<RaRecord, "id">` sans `id` dans le corps dès le départ

## Patterns à réutiliser
- Types DB Tondix : `export type Foo = { champs... } & Pick<RaRecord, "id">` — sans redéclarer `id` dans le corps
- Types formulaires Tondix : `export type FooLine = { champs... }` — sans `id`, sans `& Pick<RaRecord, "id">`
- Test de type union : `expectTypeOf<Foo["status"]>().toEqualTypeOf<"active" | "expired">()`
- Toujours mettre à jour `interface Db` dans `dataGenerator/types.ts` pour chaque nouvelle resource FakeRest
