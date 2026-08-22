# ChoreoLab — Project Overview

## Purpose

ChoreoLab is a web platform for **rhythmic gymnastics coaches**. It helps coaches build competition routines that comply with the **FIG Code of Points (CoP)**.

While a coach builds a routine, the system continuously:

- Calculates **DB** (Body Difficulty)
- Calculates **DA** (Apparatus Difficulty)
- Validates Code of Points requirements
- Displays missing or unmet requirements
- Updates all scores and validation in real time as the routine changes

## Audience

**Coaches only.** There is no gymnast-facing interface, judge interface, or public viewer in the initial product scope.

## Core Value Proposition

| Problem                                                     | ChoreoLab Solution                                  |
| ----------------------------------------------------------- | --------------------------------------------------- |
| Manual score calculation is error-prone                     | Automatic DB/DA calculation on every change         |
| CoP rules are complex and apparatus-specific                | Built-in validation engine with clear feedback      |
| Routine planning is scattered across notes and spreadsheets | Structured timeline builder with persistent storage |
| Coaches need confidence before competition                  | Live validation panel shows exactly what is missing |

## Tech Stack

| Layer               | Technology                                                  |
| ------------------- | ----------------------------------------------------------- |
| Frontend            | React, TypeScript, Apollo Client, React Router, Material UI |
| Backend             | Node.js, TypeScript, Apollo Server, Mongoose                |
| Database            | MongoDB Atlas                                               |
| Authentication      | JWT, bcrypt                                                 |
| Frontend deployment | Vercel                                                      |
| Backend deployment  | Render                                                      |
| Database hosting    | MongoDB Atlas                                               |

## Repository Structure

```
ChoreoLab/
├── client/          React SPA
├── server/          GraphQL API
├── docs/            Project documentation (source of truth)
└── .cursor/rules/   AI assistant rules
```

## Main User Flow

```
Open website
    ↓
Login / Sign Up
    ↓
Dashboard
    ├── Create Routine
    ├── My Routines
    └── Profile
    ↓
Create Routine (gymnast name, age category, apparatus)
    ↓
Routine Builder
    ├── Add / remove / reorder items
    ├── Live DB, DA, validation
    └── Save routine
    ↓
My Routines (open, edit, delete)
```

## Main Entities

| Entity            | Collection           | Description                                  |
| ----------------- | -------------------- | -------------------------------------------- |
| Coach             | `coaches`            | User account                                 |
| Routine           | `routines`           | Coach-owned routine with timeline and scores |
| RoutineItem       | embedded             | One timeline entry                           |
| BodyElement       | `bodyelements`       | Body difficulty reference                    |
| Base              | `bases`              | DA mastery base                              |
| DACriteria        | `dacriteria`         | DA criterion                                 |
| RCriteria         | `rcriteria`          | Risk criteria                                |
| Rotation          | `rotations`          | Rotation groups (v1–v3, acro-1…13)           |
| ArtistryComponent | `artistrycomponents` | Artistry reference                           |
| Requirement       | `requirements`       | Age-category limits (DB, DA, A)              |

Risk and Mastery are compositions embedded in `RoutineItem`, not separate collections.

## Scoring Domains

### DB — Body Difficulty

Body elements and risks carry difficulty values. The system tracks:

- Element count (minimum / maximum)
- Required categories
- Risk count requirements

### DA — Apparatus Difficulty

Masteries are composed of **bases** and **criteria**. Valid combinations:

- 1 base + 2 criteria
- 2 bases (one must be _Catch From High Throw_) + 1 criterion

Each apparatus supports different bases; each base supports different criteria. Acrobatic rotations have apparatus-specific maximums.

### Artistry

Numerical requirements tracked alongside body and apparatus difficulty.

## Current State

The application is **functional through Milestone 5**:

- Authentication, profile, password reset (Resend email)
- Dashboard, routine CRUD, My Routines list
- Reference data seeded and queryable (163 body elements, bases, criteria, risks, rotations, artistry)
- **Routine Builder** — inventory panel, timeline drag-and-drop, all four item types, risk/mastery composition validation
- MUI theme, React Router, layered server services

**Not yet implemented:** automated tests (M8), UI polish (M9), deployment (M10).

**Implemented:** live DB/DA scoring recalculates on every timeline change (M6).

See [ROADMAP.md](./ROADMAP.md) for the milestone plan.

## Documentation Index

| Document                                         | Description                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| [README.md](./README.md)                         | Docs index, editing workflow, confirmed decisions |
| [ARCHITECTURE.md](./ARCHITECTURE.md)             | System design, layers, folder structure           |
| [DATABASE.md](./DATABASE.md)                     | Collections, schemas, relationships               |
| [API.md](./API.md)                               | GraphQL schema conventions and operations         |
| [CODE_OF_POINTS.md](./CODE_OF_POINTS.md)         | CoP overview and domain doc index                 |
| [domains/DB.md](./domains/DB.md)                 | Body elements and risks                           |
| [domains/DA.md](./domains/DA.md)                 | Masteries, bases, criteria                        |
| [domains/ARTISTRY.md](./domains/ARTISTRY.md)     | Artistry components                               |
| [domains/VALIDATION.md](./domains/VALIDATION.md) | Validation rules                                  |
| [UI_UX.md](./UI_UX.md)                           | Design system, layouts, components                |
| [ROADMAP.md](./ROADMAP.md)                       | Milestone plan                                    |
| [AI_RULES.md](./AI_RULES.md)                     | Rules for AI-assisted development                 |
