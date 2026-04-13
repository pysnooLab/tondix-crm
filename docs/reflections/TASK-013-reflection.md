# TASK-013 — Reflection

> Ecrit par JEROME apres reception de toutes les reviews (JIBE + GUILLAUME + ALEXANDRA).

## Ce que j'ai appris
- JSX distingue deux types de noeuds enfants : `JSXText` (texte brut entre balises) et `JSXExpressionContainer` (expressions entre `{}`). Les sequences `\uXXXX` dans un `JSXText` sont rendues **litteralement** comme `\u00e0` a l'ecran car le parser JSX ne les interprete pas comme des echappements unicode. En revanche dans un `JSXExpressionContainer` comme `{"\u2014"}`, c'est le moteur JS qui parse la string et produit le caractere correct.
- Un template literal `` `Expir\u00e9 il y a ${-d}j` `` est egalement correct car `\u00e9` est interprete par le moteur JS au parse time — il produit `e` (e accent aigu) et non la sequence litterale.
- L'AST ESLint expose deux proprietes sur les noeuds `JSXText` : `raw` (fidele au code source, contient `\u00e0` tel quel) et `value` (la valeur decodee, contient le caractere unicode). Le selecteur `JSXText[raw=/\\u[0-9a-fA-F]{4}/]` cible bien le source brut, ce qui est exactement ce qu'on veut pour detecter les echappements dans le code source.

## Ce qui etait tricky
- La distinction entre contextes ou `\uXXXX` est un bug (JSXText) et contextes ou c'est correct (JSXExpressionContainer, template literal). Le premier commit qui avait tout remplace sans discernement a du etre revert — il fallait une analyse noeud par noeud de l'AST.
- ALEXANDRA avait signale la ligne 84 (template literal `` `Expir\u00e9 il y a ${-d}j` ``) comme un bug residuel, mais son analyse etait incorrecte : dans un template literal, `\u00e9` est interprete par JS et produit `e` correctement. JIBE a tranche dans le bon sens. Lecon : pour ces questions de parsing, il faut raisonner en termes d'AST et de moteur d'execution, pas en regardant le code source visuellement.

## Ce que j'aurais fait differemment
- Aurais ajoute la regle ESLint **avant** le fix, pas apres — ca aurait immediatement montre quelles lignes etaient concernees via `npm run lint`, au lieu de scanner visuellement le fichier
- Aurais documente dans le message de commit pourquoi les expressions `{}` et template literals sont preserves, pour eviter qu'un futur contributeur les "corrige" par erreur

## Patterns a reutiliser
- Regle ESLint `no-restricted-syntax` avec selecteur AST : `"JSXText[raw=/\\\\u[0-9a-fA-F]{4}/]"` — pattern generique pour interdire des motifs dans des types de noeuds specifiques. Peut s'appliquer a d'autres validations de contenu JSX (ex: interdire certains caracteres speciaux, forcer l'utilisation de composants de traduction)
- Quand un bug touche a l'encodage ou au parsing, toujours raisonner en termes de "qui interprete cette sequence" (parser JSX vs moteur JS vs navigateur) plutot qu'en termes de "ce que je vois dans le code source"
- Pour les garde-fous sur la qualite du code source (pas du runtime), privilegier une regle de lint automatique plutot qu'une convention documentee — un `npm run lint` en CI est plus fiable qu'une review manuelle pour detecter des regressions de ce type
