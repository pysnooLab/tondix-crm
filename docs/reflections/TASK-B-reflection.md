# TASK-B — Reflection

> Écrit par JEROME après réception de toutes les reviews (JIBE approuvé).

## Ce que j'ai appris
- Il faut lire AGENTS.md en entier avant de modifier pour localiser précisément les sections (Registry est avant Architecture, pas après)
- L'ordre des sections dans AGENTS.md importe : Development Commands → Architecture → Workflows → Notes → Agent Team

## Ce qui était tricky
- Insérer une section au milieu du fichier (après Registry, avant Architecture) sans casser la structure existante
- Le diagramme texte du workflow doit rester lisible en Markdown brut (pas de table, pas de mermaid)

## Ce que j'aurais fait différemment
- Rien de notable — la tâche était bien spécifiée avec les emplacements exacts

## Patterns à réutiliser
- Pour insérer du contenu dans AGENTS.md, identifier la ligne-ancre exacte (`### Registry`) plutôt que de travailler par numéro de ligne (qui change)
