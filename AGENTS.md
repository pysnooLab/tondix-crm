# AGENTS.md

## Project Overview

Atomic CRM is a full-featured CRM built with React, shadcn-admin-kit, and Supabase. It provides contact management, task tracking, notes, email capture, and deal management with a Kanban board.

## Development Commands

### Setup
```bash
make install          # Install dependencies (frontend, backend, local Supabase)
make start            # Start full stack with real API (Supabase + Vite dev server)
make stop             # Stop the stack
make start-demo       # Start full-stack with FakeRest data provider
```

### Testing and Code Quality

```bash
make test             # Run unit tests (vitest)
make typecheck        # Run TypeScript type checking
make lint             # Run ESLint and Prettier checks
```

### Building

```bash
make build            # Build production bundle (runs tsc + vite build)
```

### Database Management

The database schema is defined declaratively in `supabase/schemas/` (source of truth). Migrations in `supabase/migrations/` are auto-generated and should generally not be edited directly — but sometimes manual adjustment is needed (e.g., replacing a DROP+CREATE with an ALTER TABLE RENAME for column renames). Function definitions in `02_functions.sql` must use the exact `pg_dump` format (run `npx supabase db dump --local --schema public`) to avoid phantom diffs.

```bash
npx supabase db diff --local -f <name>  # Generate migration from schema changes
npx supabase migration up --local       # Apply migrations locally
npx supabase db push                    # Push migrations to remote
npx supabase db reset --local           # Reset local database (destructive)
```

### Registry (Shadcn Components)

```bash
make registry-gen     # Generate registry.json (runs automatically on pre-commit)
make registry-build   # Build Shadcn registry
```

### Worktree Management (Agent Workflow)

```bash
make spin TASK=XXX NAME=branch-name  # Créer worktree + branche + symlink node_modules
make merge TASK=XXX                  # Rebase sur master + push + ouverture PR (nécessite gh CLI)
make clean TASK=XXX NAME=branch-name # Supprimer le worktree après merge confirmé
```

## Architecture

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Application Logic**: shadcn-admin-kit + ra-core (react-admin headless)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + REST API + Auth + Storage + Edge Functions)
- **Testing**: Vitest

### Directory Structure

```
src/
├── components/
│   ├── admin/              # Shadcn Admin Kit components (mutable dependency)
│   ├── atomic-crm/         # Main CRM application code (~15,000 LOC)
│   │   ├── activity/       # Activity logs
│   │   ├── companies/      # Company management
│   │   ├── contacts/       # Contact management (includes CSV import/export)
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── deals/          # Deal pipeline (Kanban)
│   │   ├── filters/        # List filters
│   │   ├── layout/         # App layout components
│   │   ├── login/          # Authentication pages
│   │   ├── misc/           # Shared utilities
│   │   ├── notes/          # Note management
│   │   ├── providers/      # Data providers (Supabase + FakeRest)
│   │   ├── root/           # Root CRM component
│   │   ├── sales/          # Sales team management
│   │   ├── settings/       # Settings page
│   │   ├── simple-list/    # List components
│   │   ├── tags/           # Tag management
│   │   └── tasks/          # Task management
│   ├── supabase/           # Supabase-specific auth components
│   └── ui/                 # Shadcn UI components (mutable dependency)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── App.tsx                 # Application entry point

supabase/
├── functions/              # Edge functions (user management, inbound email)
├── migrations/             # Database migrations (auto-generated, do not edit directly)
└── schemas/                # Declarative schema (source of truth for DB structure)
```

### Key Architecture Patterns

For more details, check out the doc/src/content/docs/developers/architecture-choices.mdx document.

#### Mutable Dependencies

The codebase includes mutable dependencies that should be modified directly if needed:
- `src/components/admin/`: Shadcn Admin Kit framework code
- `src/components/ui/`: Shadcn UI components

#### Configuration via `<CRM>` Component

The `src/App.tsx` file renders the `<CRM>` component, which accepts props for domain-specific configuration:
- `contactGender`: Gender options
- `companySectors`: Company industry sectors
- `dealCategories`, `dealStages`, `dealPipelineStatuses`: Deal configuration
- `noteStatuses`: Note status options with colors
- `taskTypes`: Task type options
- `logo`, `title`: Branding
- `lightTheme`, `darkTheme`: Theme customization
- `disableTelemetry`: Opt-out of anonymous usage tracking

#### Database Views

Complex queries are handled via database views to simplify frontend code and reduce HTTP overhead. For example, `contacts_summary` provides aggregated contact data including task counts.

#### Database Triggers

User data syncs between Supabase's `auth.users` table and the CRM's `sales` table via triggers (see `supabase/schemas/04_triggers.sql`).

#### Edge Functions

Located in `supabase/functions/`:
- User management (creating/updating users, account disabling)
- Inbound email webhook processing

#### Data Providers

Two data providers are available:
1. **Supabase** (default): Production backend using PostgreSQL
2. **FakeRest**: In-browser fake API for development/demos, resets on page reload

When using FakeRest, database views are emulated in the frontend. Test data generators are in `src/components/atomic-crm/providers/fakerest/dataGenerator/`.

#### Filter Syntax

List filters follow the `ra-data-postgrest` convention with operator concatenation: `field_name@operator` (e.g., `first_name@eq`). The FakeRest adapter maps these to FakeRest syntax at runtime.

## Development Workflows

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json` and `components.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/components/ui` → `src/components/ui`

### Adding Custom Fields

When modifying contact or company data structures:
1. Edit the relevant schema file in `supabase/schemas/` (table in `01_tables.sql`, views in `03_views.sql`, etc.)
2. Generate a migration: `npx supabase db diff --local -f <name>`
3. Apply it: `npx supabase migration up --local`
4. Update the sample CSV: `src/components/atomic-crm/contacts/contacts_export.csv`
5. Update the import function: `src/components/atomic-crm/contacts/useContactImport.tsx`
6. If using FakeRest, update data generators in `src/components/atomic-crm/providers/fakerest/dataGenerator/`
7. Don't forget to update the related view (`contacts_summary`, `companies_summary`) in `03_views.sql`
8. Don't forget the export functions
9. Don't forget the contact merge logic

### Running with Test Data

Import `test-data/contacts.csv` via the Contacts page → Import button.

### Git Hooks

- Pre-commit: Automatically runs `make registry-gen` to update `registry.json`

### Accessing Local Services During Development

- Frontend: http://localhost:5173/
- Supabase Dashboard: http://localhost:54323/
- REST API: http://127.0.0.1:54321
- Storage (attachments): http://localhost:54323/project/default/storage/buckets/attachments
- Inbucket (email testing): http://localhost:54324/

## Important Notes

- The codebase is intentionally small (~15,000 LOC in `src/components/atomic-crm`) for easy customization
- Modify files in `src/components/admin` and `src/components/ui` directly - they are meant to be customized
- Unit tests can be added in the `src/` directory (test files are named `*.test.ts` or `*.test.tsx`)
- User deletion is not supported to avoid data loss; use account disabling instead
- Filter operators must be supported by the `supabaseAdapter` when using FakeRest

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
  → JULIEN [Haiku] — make merge TASK=XXX TITLE="feat: <description de la tâche>"
  → JULIEN [Haiku] — attend CI verte (gh pr checks <N> --watch)
      ✗ CI rouge → JEROME corrige + push → JULIEN re-vérifie
      ✓ CI verte → gh pr merge --squash <N>
      (la branch protection bloque le merge côté serveur si CI rouge)
make clean TASK=XXX NAME=yyy
```

### Multi-model routing

| Agent    | Modèle                     | Rôle                                           |
|----------|----------------------------|-------------------------------------------------|
| ERWAN    | claude-sonnet-4-6          | Validation spec + plan approval                |
| JEROME   | claude-opus-4-6            | Implémentation code                            |
| JIBE     | claude-sonnet-4-6          | Review code + conformité spec                  |
| FRANCIS  | claude-sonnet-4-6          | Review sécurité                                |
| GUILLAUME| claude-haiku-4-5-20251001  | Validation tests                               |
| ALEXANDRA| claude-haiku-4-5-20251001  | Validation UI/UX                               |
| BENOIT   | claude-sonnet-4-6          | Arbitrage PM (uniquement si conflit)           |
| JULIEN   | claude-haiku-4-5-20251001  | make merge + attente CI + gh pr merge (si CI verte) |

### REFLECTION.md — Boucle d'apprentissage

Après avoir reçu toutes les reviews, JEROME écrit `docs/reflections/TASK-XXX-reflection.md` (voir `docs/reflections/TEMPLATE.md`).

**Règle de relecture :** le prompt de dispatch JEROME inclut la liste des fichiers `docs/reflections/` du même domaine (frontend, backend, DB...) à relire avant d'implémenter.

### Spawn d'agents dans des fenêtres séparées

Pour avoir chaque agent visible dans sa propre fenêtre tmux, utiliser **TeamCreate + Agent avec `team_name`** — ne pas utiliser le tool `Agent` seul (qui tourne en arrière-plan sans fenêtre visible).

```
# 1. Créer l'équipe (une par session de travail)
TeamCreate({ team_name: "tondix-phase2", description: "..." })

# 2. Créer les tâches
TaskCreate({ subject: "...", description: "..." })
TaskUpdate({ taskId: "1", owner: "JEROME-009", status: "in_progress" })

# 3. Spawner les agents en parallèle (chacun dans sa fenêtre)
Agent({ name: "JEROME-009", team_name: "tondix-phase2", model: "opus", prompt: "..." })
Agent({ name: "JEROME-005", team_name: "tondix-phase2", model: "opus", prompt: "..." })
```

Les agents envoient leurs résultats via `SendMessage` au team-lead (toi). Tu es notifié automatiquement quand ils terminent.

**Shutdown semi-automatique via hooks** (configuré dans `.claude/settings.json`) :

- **`TeammateIdle` hook** (`.claude/hooks/teammate-idle.sh`) — actuellement désactivé (exit 0) car l'injection de feedback (exit 2) interrompt les agents en cours de travail multi-étapes. Le shutdown reste manuel : envoyer `shutdown_request` après réception du message de fin de l'agent.

- **`TaskCompleted` hook** (`.claude/hooks/task-completed.sh`) — avant de marquer une tâche completed, vérifie que `npm run typecheck` passe dans le worktree associé (détecté via `TASK-XXX` dans le subject/owner). Bloque avec exit 2 si typecheck échoue.

**Convention dans les prompts agents :** chaque prompt doit terminer par "Après avoir envoyé ton résumé au team-lead, n'effectue plus aucune action — le team-lead enverra un shutdown_request."

### Règles transverses

- **Circuit-breaker :** agent bloqué après 3 itérations sur la même erreur → tuer et réassigner
- **Plan approval :** ERWAN valide le plan JEROME avant tout code (évite l'accumulation de code mal orienté)
- **Reviews parallèles :** JIBE, FRANCIS, GUILLAUME, ALEXANDRA travaillent simultanément
- **BENOIT :** intervient uniquement sur conflit entre reviewers ou décision PM, pas sur chaque ticket
- **REFLECTION.md :** écrite après les reviews (pas avant merge) pour capitaliser sur tous les retours
- **CI obligatoire :** JULIEN ne merge jamais une PR avec CI rouge — il attend avec `gh pr checks <N> --watch` et rapporte les échecs à JEROME. La branch protection bloque le merge côté serveur de toute façon.
- **Titre de PR :** JULIEN passe toujours `TITLE="feat/fix: <description de la tâche>"` à `make merge` — jamais le message du dernier commit. La description vient du sujet de la tâche (TaskGet si besoin).
