---
name: agent-team
description: Multi-agent team workflow for implementing tickets. Use when dispatching agents, reviewing PRs, arbitrating conflicts, or following the ticket lifecycle (spec → impl → review → merge).
---

## Workflow par ticket

```
make spin TASK=XXX NAME=yyy
  → ERWAN   — validation spec            @.claude/agents/ERWAN.md
  → JEROME  — plan de code               @.claude/agents/JEROME.md
  → ERWAN   — plan approval
  → JEROME  — implémentation
      ↓ (en parallèle)
  JIBE          FRANCIS         GUILLAUME       ALEXANDRA
  code+spec     sécurité        tests verts     UI/UX démo visuelle
      ↓
  Conflit ? → BENOIT arbitre    @.claude/agents/BENOIT.md
  → JEROME  — docs/reflections/TASK-XXX-reflection.md
  → JULIEN  — make merge + gh pr merge --auto + gh pr checks --watch
make clean TASK=XXX NAME=yyy
```

## Routing des modèles

| Agent    | Modèle                    | Définition                        |
|----------|---------------------------|-----------------------------------|
| ERWAN    | claude-sonnet-4-6         | @.claude/agents/ERWAN.md          |
| JEROME   | claude-opus-4-6           | @.claude/agents/JEROME.md         |
| JIBE     | claude-sonnet-4-6         | @.claude/agents/JIBE.md           |
| FRANCIS  | claude-sonnet-4-6         | @.claude/agents/FRANCIS.md        |
| GUILLAUME| claude-haiku-4-5-20251001 | @.claude/agents/GUILLAUME.md      |
| ALEXANDRA| claude-haiku-4-5-20251001 | @.claude/agents/ALEXANDRA.md      |
| BENOIT   | claude-sonnet-4-6         | @.claude/agents/BENOIT.md         |
| JULIEN   | claude-haiku-4-5-20251001 | @.claude/agents/JULIEN.md         |

## Spawn des agents (tmux visible)

```js
TeamCreate({ team_name: "project-phase1", description: "..." })
TaskCreate({ subject: "TASK-XXX: ...", description: "..." })
TaskUpdate({ taskId: "N", owner: "JEROME-XXX", status: "in_progress" })

// Lire le fichier agent et l'inclure dans le prompt
Agent({ name: "JEROME-XXX", team_name: "project-phase1", model: "opus",
  prompt: `[contenu de .claude/agents/JEROME.md]\n\nContexte du ticket:\n...` })
```

**Shutdown :** toujours manuel — `{"type":"shutdown_request"}` après réception du message de fin.

## Règles globales

- **Circuit-breaker :** agent bloqué après 3 itérations → tuer et réassigner
- **Plan approval :** ERWAN valide AVANT que JEROME code
- **Reviews parallèles :** JIBE, FRANCIS, GUILLAUME, ALEXANDRA simultanément
- **BENOIT :** uniquement sur conflit, pas sur chaque ticket
- **Reflection :** après les reviews, pas avant merge
- **CI :** branch protection + `--auto` + `--watch` = double verrou
- **Titre PR :** sujet de la tâche, jamais le message du dernier commit
- **Tests e2e :** obligatoires pour toute tâche UI/filtre/interaction (sauf si noté dans acceptance_criteria)
- **Mode silencieux :** enforced par `.claude/hooks/silent-mode-check.sh`
