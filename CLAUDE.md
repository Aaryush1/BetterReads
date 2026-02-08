# BetterReads - Agent Guidelines

## Project Overview

BetterReads is a modern Goodreads alternative for avid readers. Fast, beautiful, and focused on the core reading experience — book search, shelves, and a clean UI inspired by Literal and StoryGraph.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase (Auth + Postgres), Google Books API + Open Library API

---

## Development Workflow — MANDATORY FOR ALL AGENTS

Every feature, fix, or significant change follows this strict process. No code is written until Steps 1-3 are complete.

### Step 1: PRD (Product Requirements Document)

**Location:** `docs/<feature-name>/prd.md`

Before any code, create a PRD that captures:

- **Problem Statement** — What user problem are we solving?
- **Goals & Non-Goals** — What's in scope and explicitly out of scope?
- **User Stories** — Who is the user and what do they need?
- **Acceptance Criteria** — How do we know this is done?
- **Open Questions** — Anything unresolved that needs discussion?

The PRD is a conversation with the user. Do NOT assume intent — ask clarifying questions until the PRD is approved.

### Step 2: Technical Plan

**Location:** `docs/<feature-name>/plan.md`

Once the PRD is approved, create a technical plan that includes:

- **Architecture Decisions** — What approach and why (cite industry-standard patterns)
- **Data Model** — Schema changes, API contracts, state shape
- **Component Breakdown** — What gets built, where it lives
- **Dependencies** — New packages, services, or infrastructure needed
- **Risk Assessment** — What could go wrong, mitigation strategies

### Step 3: Phased Task Breakdown

**Location:** `docs/<feature-name>/tasks/`

Break the technical plan into sequential phases. Each phase gets its own file (`phase-01.md`, `phase-02.md`, etc.) with:

```markdown
# Phase X: [Phase Name]

## Status: NOT STARTED | IN PROGRESS | COMPLETE

## Tasks
- [ ] Task description
- [ ] Task description
  - [ ] Sub-task if needed

## Testing Checklist
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manual QA completed
- [ ] Edge cases verified

## Notes
(Any context, blockers, or decisions made during implementation)
```

**Rules:**
- A phase is NOT complete until all testing checklist items are checked
- Agents MUST update checkboxes as they complete work
- Never skip ahead to the next phase until the current phase is fully complete and tested

---

## Docs Folder Structure

```
docs/
├── mvp/                    # First project: MVP
│   ├── prd.md              # Product requirements document
│   ├── plan.md             # Technical architecture & plan
│   └── tasks/              # Phased task breakdown
│       ├── phase-01.md
│       ├── phase-02.md
│       └── ...
├── <next-feature>/         # Future features follow same structure
│   ├── prd.md
│   ├── plan.md
│   └── tasks/
```

---

## Code Standards

- **Framework:** Next.js with App Router (`src/app/`)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Components:** Place in `src/components/`
- **Utilities:** Place in `src/lib/`
- **Types:** Place in `src/types/`

---

## Agent Rules

1. **Always read this file first** at the start of any session.
2. **Follow the PRD → Plan → Tasks workflow.** No exceptions.
3. **Update task checkboxes** in `docs/<feature>/tasks/` as you complete work.
4. **Update this CLAUDE.md** when significant changes are made to the project:
   - New libraries or services added to the stack
   - New folder conventions or patterns established
   - Changes to the development workflow
   - Environment setup changes
   - Major architectural decisions
5. **Never write code without an approved PRD and plan.** If they don't exist yet, create them first and get user approval.
6. **Ask, don't assume.** When requirements are ambiguous, ask the user before proceeding.
7. **Test before marking complete.** Every phase must pass its testing checklist.

---

## Current State

- **Active Project:** MVP (see `docs/mvp/`)
- **Status:** Technical plan complete — ready for Phase 1 implementation
- **Current Phase:** Phase 1 — Foundation (NOT STARTED)
- **Docs:**
  - PRD: `docs/mvp/prd.md` (APPROVED)
  - Design: `docs/mvp/design-vision.html`
  - Plan: `docs/mvp/plan.md`
  - Tasks: `docs/mvp/tasks/phase-01.md` through `phase-06.md`
