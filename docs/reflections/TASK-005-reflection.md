# TASK-005 — Reflection

> Ecrit par JEROME apres reception de toutes les reviews (JIBE + FRANCIS + GUILLAUME + ALEXANDRA).

## Ce que j'ai appris
- Les routes react-admin sont basees sur le `name` de la Resource, pas sur un path parent : `/products` et `/services`, pas `/catalogue/products` — le DropdownMenu doit pointer vers ces URLs directement
- `matchPath("/catalogue/*")` ne matche pas `/products` ni `/services` puisque ces routes vivent a la racine — il faut tester chaque route individuellement avec `matchPath("/products/*")` et `matchPath("/services/*")`
- Un fichier `index.ts` de Resource doit avoir un export default (l'objet avec list, show, edit, etc.) pour que le pattern `<Resource {...products} />` fonctionne — les named exports seuls ne suffisent pas

## Ce qui etait tricky
- Le highlight du menu Catalogue dans le Header : comme les routes `/products` et `/services` ne partagent pas de prefixe commun avec `/catalogue`, il faut une logique custom qui teste les deux paths pour determiner si le dropdown doit etre actif
- L'export default manquant dans `services/index.ts` : le spread `{...services}` passait silencieusement `undefined` pour toutes les props — pas d'erreur explicite, juste une Resource vide sans list/show/edit

## Ce que j'aurais fait differemment
- Aurais verifie des le depart comment react-admin gere les routes des Resources plutot que de supposer un prefixe `/catalogue/*` — une lecture rapide de la doc aurait evite le bug matchPath
- Aurais systematiquement verifie les exports de chaque fichier index.ts avant d'enregistrer les Resources — un `console.log(services)` aurait immediatement revele le probleme

## Patterns a reutiliser
- DropdownMenu Shadcn pour navigation groupee : `DropdownMenu > DropdownMenuTrigger > DropdownMenuContent > DropdownMenuItem` avec des `<Link>` a l'interieur
- Detection d'item actif multi-routes : `const isActive = matchPath("/route-a/*", pathname) || matchPath("/route-b/*", pathname)` quand plusieurs routes logiquement groupees n'ont pas de prefixe commun
- Export default pour Resource : toujours `export default { list: XxxList, show: XxxShow, edit: XxxEdit, create: XxxCreate }` dans les fichiers index.ts de resource
