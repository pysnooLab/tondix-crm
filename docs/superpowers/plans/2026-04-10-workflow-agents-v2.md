# Workflow Agents v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer le workflow multi-agents Tondix CRM avec du multi-model routing, des scripts d'infrastructure SPIN/MERGE/CLEAN, et une boucle d'apprentissage REFLECTION.md.

**Architecture:** Trois modifications indépendantes — ajout de cibles Makefile dans `makefile`, mise à jour de `AGENTS.md` avec le nouveau workflow et le routing de modèles, création d'un répertoire `docs/reflections/` avec un template.

**Tech Stack:** Bash/Makefile, GitHub CLI (`gh`), Markdown.

---

## Carte des fichiers

### Créer
- `docs/reflections/TEMPLATE.md` — template standard pour les réflexions JEROME

### Modifier
- `makefile` — ajouter les cibles `spin`, `merge`, `clean`
- `AGENTS.md` — ajouter la section Agent Team (workflow, routing, REFLECTION.md, règles)

---

## TASK-A : Cibles SPIN / MERGE / CLEAN dans le makefile

**Fichiers :**
- Modifier : `makefile`

- [ ] **Étape 1 : Ajouter `spin merge clean` à la ligne `.PHONY`**

Dans `makefile`, ligne 1, remplacer :
```makefile
.PHONY: build help
```
par :
```makefile
.PHONY: build help spin merge clean
```

- [ ] **Étape 2 : Ajouter la cible `spin` à la fin du fichier**

Ajouter à la fin de `makefile` :
```makefile
spin: ## create worktree + branch + node_modules symlink (TASK=XXX NAME=branch-name)
	@test -n "$(TASK)" || (echo "❌ Usage: make spin TASK=XXX NAME=yyy" && false)
	@test -n "$(NAME)" || (echo "❌ Usage: make spin TASK=XXX NAME=yyy" && false)
	git worktree add worktrees/TASK-$(TASK) -b feat/TASK-$(TASK)-$(NAME)
	ln -s $(PWD)/node_modules worktrees/TASK-$(TASK)/node_modules
	@echo "✓ Worktree TASK-$(TASK) prêt. Dispatch JEROME."
```

- [ ] **Étape 3 : Ajouter la cible `merge` à la fin du fichier**

Ajouter à la fin de `makefile` :
```makefile
merge: ## rebase on master, push branch, open PR (TASK=XXX)
	@test -n "$(TASK)" || (echo "❌ Usage: make merge TASK=XXX" && false)
	cd worktrees/TASK-$(TASK) && git fetch origin && git rebase origin/master
	cd worktrees/TASK-$(TASK) && git push -u origin HEAD
	cd worktrees/TASK-$(TASK) && gh pr create \
		--title "[TASK-$(TASK)] $$(git log --oneline -1 | sed 's/^[a-f0-9]* //')" \
		--body "Closes TASK-$(TASK)" \
		--base master
```

- [ ] **Étape 4 : Ajouter la cible `clean` à la fin du fichier**

Ajouter à la fin de `makefile` :
```makefile
clean: ## remove finished worktree after merge (TASK=XXX NAME=branch-name)
	@test -n "$(TASK)" || (echo "❌ Usage: make clean TASK=XXX NAME=yyy" && false)
	@test -n "$(NAME)" || (echo "❌ Usage: make clean TASK=XXX NAME=yyy" && false)
	git worktree remove worktrees/TASK-$(TASK) --force
	git branch -d feat/TASK-$(TASK)-$(NAME) 2>/dev/null || true
	@echo "✓ Worktree TASK-$(TASK) supprimé."
```

- [ ] **Étape 5 : Vérifier que `make help` liste les nouvelles cibles**

```bash
make help
```

Résultat attendu : les lignes `spin`, `merge`, `clean` apparaissent avec leur description.

- [ ] **Étape 6 : Vérifier que `spin` échoue proprement sans arguments**

```bash
make spin
```

Résultat attendu :
```
❌ Usage: make spin TASK=XXX NAME=yyy
make: *** [makefile:...] Error 1
```

- [ ] **Étape 7 : Commit**

```bash
git add makefile
git commit -m "feat: add spin/merge/clean makefile targets for worktree management"
```

---

## TASK-B : Mettre à jour AGENTS.md avec le nouveau workflow

**Fichiers :**
- Modifier : `AGENTS.md`

- [ ] **Étape 1 : Ajouter les cibles spin/merge/clean dans la section Development Commands**

Dans `AGENTS.md`, après le bloc `### Registry (Shadcn Components)`, ajouter :

```markdown
### Worktree Management (Agent Workflow)

```bash
make spin TASK=XXX NAME=branch-name  # Créer worktree + branche + symlink node_modules
make merge TASK=XXX                  # Rebase sur master + push + ouverture PR (nécessite gh CLI)
make clean TASK=XXX NAME=branch-name # Supprimer le worktree après merge confirmé
```
```

- [ ] **Étape 2 : Ajouter la section Agent Team à la fin de AGENTS.md**

À la fin de `AGENTS.md`, ajouter :

```markdown
## Agent Team

### Workflow par ticket

```
make spin TASK=XXX NAME=yyy
  → ERWAN [Sonnet]  — validation spec
  → JEROME [Opus]   — plan de code (fichiers, interfaces, découpage)
  → ERWAN [Sonnet]  — plan approval (✗ refus → JEROME révise)
  → JEROME [Opus]   — implémentation (commits atomiques par étape)
      ↓ (en parallèle)
  JIBE [Sonnet]        FRANCIS [Sonnet]     GUILLAUME [Haiku]    ALEXANDRA [Haiku]
  code + spec          sécurité             tests verts           UI/UX
      ↓
  Tous verts ? ✗ conflit → BENOIT [Sonnet] arbitre
  → JEROME [Opus]  — écrit docs/reflections/TASK-XXX-reflection.md
  → JULIEN [Haiku] — confirme merge
make merge TASK=XXX
make clean TASK=XXX NAME=yyy
```

### Multi-model routing

| Agent    | Modèle                     | Rôle                                           |
|----------|----------------------------|------------------------------------------------|
| ERWAN    | claude-sonnet-4-6          | Validation spec + plan approval                |
| JEROME   | claude-opus-4-6            | Implémentation code                            |
| JIBE     | claude-sonnet-4-6          | Review code + conformité spec                  |
| FRANCIS  | claude-sonnet-4-6          | Review sécurité                                |
| GUILLAUME| claude-haiku-4-5-20251001  | Validation tests                               |
| ALEXANDRA| claude-haiku-4-5-20251001  | Validation UI/UX                               |
| BENOIT   | claude-sonnet-4-6          | Arbitrage PM (uniquement si conflit)           |
| JULIEN   | claude-haiku-4-5-20251001  | Merge (si toutes reviews vertes)               |

### REFLECTION.md — Boucle d'apprentissage

Après avoir reçu toutes les reviews, JEROME écrit `docs/reflections/TASK-XXX-reflection.md` (voir `docs/reflections/TEMPLATE.md`).

**Règle de relecture :** le prompt de dispatch JEROME inclut la liste des fichiers `docs/reflections/` du même domaine (frontend, backend, DB...) à relire avant d'implémenter.

### Règles transverses

- **Circuit-breaker :** agent bloqué après 3 itérations sur la même erreur → tuer et réassigner
- **Plan approval :** ERWAN valide le plan JEROME avant tout code (évite l'accumulation de code mal orienté)
- **Reviews parallèles :** JIBE, FRANCIS, GUILLAUME, ALEXANDRA travaillent simultanément
- **BENOIT :** intervient uniquement sur conflit entre reviewers ou décision PM, pas sur chaque ticket
- **REFLECTION.md :** écrite après les reviews (pas avant merge) pour capitaliser sur tous les retours
```

- [ ] **Étape 3 : Vérifier que AGENTS.md est syntaxiquement correct**

```bash
npx markdownlint-cli2 AGENTS.md 2>/dev/null || echo "markdownlint not available, check manually"
```

- [ ] **Étape 4 : Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md with v2 workflow — routing, parallel reviews, reflection loop"
```

---

## TASK-C : Créer le template REFLECTION.md

**Fichiers :**
- Créer : `docs/reflections/TEMPLATE.md`

- [ ] **Étape 1 : Créer le dossier et le template**

Créer `docs/reflections/TEMPLATE.md` avec le contenu suivant :

```markdown
# TASK-XXX — Reflection

> Écrit par JEROME après réception de toutes les reviews (JIBE + FRANCIS + GUILLAUME + ALEXANDRA).
> Copier ce fichier en TASK-XXX-reflection.md avant de remplir.

## Ce que j'ai appris
<!--
Points techniques ou organisationnels découverts pendant l'implémentation.
Ex: useFieldArray sans passer `control` si on est dans un FormProvider
-->
-

## Ce qui était tricky
<!--
Difficultés rencontrées, pièges évités, comportements inattendus.
Ex: le transform doit stripper les lignes AVANT envoi Supabase, pas après
-->
-

## Ce que j'aurais fait différemment
<!--
Décisions à réviser si c'était à refaire.
Ex: aurais commité par étape logique plutôt qu'en un bloc
-->
-

## Patterns à réutiliser
<!--
Syntaxes, conventions, patterns applicables à d'autres tickets.
Ex: `deal_id@in` → syntaxe '(1,2,3)' avec parenthèses dans la string
-->
-
```

- [ ] **Étape 2 : Vérifier que le fichier existe**

```bash
cat docs/reflections/TEMPLATE.md
```

Résultat attendu : le contenu du template s'affiche sans erreur.

- [ ] **Étape 3 : Commit**

```bash
git add docs/reflections/TEMPLATE.md
git commit -m "docs: add REFLECTION.md template for JEROME's learning loop"
```
