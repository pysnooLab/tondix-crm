# Workflow Agents v2 — Design Spec

**Date :** 2026-04-10
**Contexte :** Amélioration du workflow multi-agents Tondix CRM suite à la lecture de [Code Agent Orchestra](https://addyosmani.com/blog/code-agent-orchestra/) par Addy Osmani.
**Objectif :** Introduire le multi-model routing, des scripts d'infrastructure (SPIN/MERGE/CLEAN), et une boucle d'apprentissage (REFLECTION.md) dans le workflow existant.

---

## 1. Multi-model routing

Chaque agent est assigné au modèle le plus adapté à sa charge cognitive. Le modèle est précisé dans le prompt de dispatch de chaque agent.

| Agent | Modèle | Justification |
|-------|--------|---------------|
| ERWAN | claude-sonnet-4-6 | Raisonnement technique pour évaluer et enrichir des specs |
| JEROME | claude-opus-4-6 | Implémentation de code complexe, intégrations, refactoring |
| JIBE | claude-sonnet-4-6 | Review approfondie, conformité spec, détection de régressions |
| FRANCIS | claude-sonnet-4-6 | Analyse de sécurité, raisonnement OWASP |
| GUILLAUME | claude-haiku-4-5-20251001 | Validation mécanique : tests verts ou non |
| ALEXANDRA | claude-haiku-4-5-20251001 | Checklist UI/UX visuelle, pas de raisonnement complexe |
| BENOIT | claude-sonnet-4-6 | Arbitrage PM, synthèse de conflits entre reviewers |
| JULIEN | claude-haiku-4-5-20251001 | Tâche mécanique : merge si tout est vert |

---

## 2. Scripts d'infrastructure

Trois cibles Makefile encapsulent les opérations git répétitives liées à la gestion des worktrees.

### `make spin TASK=XXX NAME=yyy`

Crée le worktree, la branche, et le symlink node_modules. S'exécute avant de dispatcher JEROME.

```makefile
spin:
	git worktree add worktrees/TASK-$(TASK) -b feat/TASK-$(TASK)-$(NAME)
	ln -s $(PWD)/node_modules worktrees/TASK-$(TASK)/node_modules
	@echo "✓ Worktree TASK-$(TASK) prêt. Dispatch JEROME."
```

### `make merge TASK=XXX`

Rebase sur master, pousse la branche, ouvre la PR GitHub. S'exécute après validation par JULIEN que toutes les reviews sont vertes.

```makefile
merge:
	cd worktrees/TASK-$(TASK) && git fetch origin && git rebase origin/master
	cd worktrees/TASK-$(TASK) && git push -u origin HEAD
	gh pr create --title "[TASK-$(TASK)] $$( cd worktrees/TASK-$(TASK) && git log --oneline -1 )" \
	             --body "Closes TASK-$(TASK)"
```

### `make clean TASK=XXX NAME=yyy`

Supprime le worktree et la branche locale après que la PR est mergée sur master. Ne s'exécute qu'après merge confirmé.

```makefile
clean:
	git worktree remove worktrees/TASK-$(TASK) --force
	git branch -d feat/TASK-$(TASK)-$(NAME) 2>/dev/null || true
	@echo "✓ Worktree TASK-$(TASK) supprimé."
```

---

## 3. REFLECTION.md — Boucle d'apprentissage

### Principe

Après avoir reçu toutes les reviews (JIBE + FRANCIS + GUILLAUME + ALEXANDRA), JEROME écrit une réflexion structurée sur le ticket. Ces réflexions sont relues par JEROME au début de tickets du même domaine pour capitaliser sur les apprentissages passés.

### Emplacement

`docs/reflections/TASK-XXX-reflection.md`

### Format

```markdown
# TASK-XXX — Reflection

## Ce que j'ai appris
- Points techniques ou organisationnels découverts pendant l'implémentation

## Ce qui était tricky
- Difficultés rencontrées, pièges évités, comportements inattendus

## Ce que j'aurais fait différemment
- Décisions à réviser si c'était à refaire

## Patterns à réutiliser
- Syntaxes, patterns, conventions applicables à d'autres tickets
```

### Règles d'utilisation

- Le prompt de dispatch JEROME inclut la liste des fichiers `docs/reflections/` pertinents à relire (filtrés par domaine : backend, frontend, DB, etc.)
- BENOIT décide ponctuellement si un pattern issu d'une reflection mérite d'être promu dans AGENTS.md

---

## 4. Workflow complet redessiné

```
┌─────────────────────────────────────────────────────────────┐
│  make spin TASK=XXX NAME=yyy                                │
│  (crée worktree + branche + node_modules)                   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
              ERWAN [Sonnet] — validation spec
                           ▼
              JEROME [Opus] — plan de code
              (fichiers à toucher, interfaces, découpage)
                           ▼
              ERWAN [Sonnet] — plan approval
              ✗ refus → JEROME révise
                           ▼
              JEROME [Opus] — implémentation
              (commits atomiques par étape logique)
                           ▼
         ┌─────────────────┼──────────────┬──────────────────┐
         ▼                 ▼              ▼                  ▼
  JIBE [Sonnet]   FRANCIS [Sonnet]  GUILLAUME [Haiku]  ALEXANDRA [Haiku]
  code + spec     sécurité          tests verts         UI/UX
         └─────────────────┼──────────────┴──────────────────┘
                           ▼
              Tous verts ?
              ✗ conflit → BENOIT [Sonnet] arbitre
                           ▼
              JEROME [Opus] — écrit REFLECTION.md
                           ▼
              JULIEN [Haiku] — confirme merge
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  make merge TASK=XXX  (rebase + push + ouverture PR)        │
│  make clean TASK=XXX NAME=yyy  (suppression worktree)       │
└─────────────────────────────────────────────────────────────┘
```

### Règles transverses

- **Circuit-breaker :** un agent bloqué après 3 itérations sur la même erreur est tué et réassigné.
- **BENOIT :** n'intervient QUE sur conflit entre reviewers ou décision PM — pas systématiquement sur chaque ticket.
- **Plan approval :** ERWAN valide le plan de JEROME avant tout code pour éviter l'accumulation de code mal orienté.
- **Reviews parallèles :** JIBE, FRANCIS, GUILLAUME et ALEXANDRA travaillent simultanément — pas en séquence.
- **REFLECTION.md :** JEROME l'écrit après les reviews, pas avant merge, pour capitaliser sur tous les retours reçus.
