---
name: agent-team
description: Multi-agent team workflow for implementing tickets. Use when dispatching agents, reviewing PRs, arbitrating conflicts, or following the ticket lifecycle (spec → impl → review → merge).
---

## Workflow par ticket

```
make spin TASK=XXX NAME=yyy
  → ERWAN [Sonnet]  — validation spec
  → JEROME [Opus]   — plan de code (fichiers, interfaces, découpage)
  → ERWAN [Sonnet]  — plan approval (✗ refus → JEROME révise)
  → JEROME [Opus]   — implémentation (commits atomiques par étape)
      ↓ (en parallèle)
  JIBE [Sonnet]        FRANCIS [Sonnet]     GUILLAUME [Haiku]    ALEXANDRA [Haiku]
  code + spec          sécurité             tests verts           UI/UX démo visuelle
      ↓
  Tous verts ? ✗ conflit → BENOIT [Sonnet] arbitre
  → JEROME [Opus]  — écrit docs/reflections/TASK-XXX-reflection.md
  → JULIEN [Haiku] — make merge TASK=XXX TITLE="feat: <description>"
  → JULIEN [Haiku] — gh pr merge --squash --auto <N>
  → JULIEN [Haiku] — gh pr checks <N> --watch
      ✓ exit 0 → auto-merge se déclenchera, envoie résumé au team-lead
      ✗ exit 1 → rapport détaillé au team-lead → JEROME corrige → JULIEN re-surveille
make clean TASK=XXX NAME=yyy
```

## Routing des modèles

| Agent    | Modèle                     | Rôle                                           |
|----------|----------------------------|-------------------------------------------------|
| ERWAN    | claude-sonnet-4-6          | Validation spec + plan approval                |
| JEROME   | claude-opus-4-6            | Implémentation code                            |
| JIBE     | claude-sonnet-4-6          | Review code + conformité spec                  |
| FRANCIS  | claude-sonnet-4-6          | Review sécurité                                |
| GUILLAUME| claude-haiku-4-5-20251001  | Validation tests (unit + e2e)                  |
| ALEXANDRA| claude-haiku-4-5-20251001  | Validation UI/UX — Playwright headless screenshots en mode démo |
| BENOIT   | claude-sonnet-4-6          | Arbitrage PM (uniquement si conflit)           |
| JULIEN   | claude-haiku-4-5-20251001  | make merge + gh pr merge --auto + watch CI     |

## Spawn des agents (tmux visible)

```js
// 1. Créer l'équipe (une par session de travail)
TeamCreate({ team_name: "project-phase1", description: "..." })

// 2. Créer et assigner les tâches
TaskCreate({ subject: "...", description: "..." })
TaskUpdate({ taskId: "1", owner: "JEROME-009", status: "in_progress" })

// 3. Spawner en parallèle (chacun dans sa fenêtre tmux)
Agent({ name: "JEROME-009", team_name: "project-phase1", model: "opus", prompt: "..." })
Agent({ name: "JIBE-009", team_name: "project-phase1", model: "sonnet", prompt: "..." })
```

**Convention fin de prompt :** chaque prompt agent doit terminer par :
> "Après avoir envoyé ton résumé au team-lead, n'effectue plus aucune action — le team-lead enverra un shutdown_request."

**Shutdown :** toujours manuel — envoyer `{"type":"shutdown_request"}` après réception du message de fin.

## REFLECTION.md — Boucle d'apprentissage

JEROME écrit `docs/reflections/TASK-XXX-reflection.md` après toutes les reviews (voir `docs/reflections/TEMPLATE.md`).

Structure : Ce que j'ai appris / Ce qui était tricky / Ce que j'aurais fait différemment / Patterns à réutiliser.

**Relecture :** le prompt JEROME inclut les fichiers `docs/reflections/` du même domaine à relire avant d'implémenter.

## Règles transverses

- **Circuit-breaker :** agent bloqué après 3 itérations → tuer et réassigner
- **Plan approval :** ERWAN valide le plan JEROME avant tout code
- **Reviews parallèles :** JIBE, FRANCIS, GUILLAUME, ALEXANDRA simultanément
- **BENOIT :** uniquement sur conflit entre reviewers, pas sur chaque ticket
- **Titre PR :** JULIEN passe `TITLE="feat/fix: <description>"` à `make merge` — jamais le message du dernier commit
- **Tests e2e obligatoires :** toute tâche UI/filtre/formulaire/interaction doit inclure un test e2e dans `e2e/`. Si vraiment non testable (CSS pur, migration DB seule), le noter explicitement dans `acceptance_criteria`
- **ALEXANDRA validation démo :** démarrer démo sur port non-conflictuel, naviguer via Playwright headless, screenshots, vérifier vs mockups. Tout écart visuel signalé même si le code est correct
- **Mode silencieux :** Playwright `--headless`, Vite sans `--open`, Vitest sans `browser.ui: true` — le hook `silent-mode-check` bloque automatiquement les violations
- **CI obligatoire :** branch protection bloque côté serveur. `--auto` + `gh pr checks --watch` = double verrou
- **TeammateIdle hook :** désactivé (exit 0) — le shutdown reste manuel pour éviter d'interrompre les agents multi-étapes

## Worktree Management

```bash
make spin TASK=XXX NAME=branch-name  # Crée worktree + branche + symlink node_modules
make merge TASK=XXX TITLE="feat: …"  # Rebase master + push + PR (nécessite gh CLI)
make clean TASK=XXX NAME=branch-name # Supprime le worktree après merge confirmé
```
