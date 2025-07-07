# Project Management Overview

CIRO Network uses **GitHub Projects (Beta)** as the single source of truth for high-level planning and progress tracking.  The board is lightweight—automation does the busy-work so contributors can focus on code.

## Board Columns

| Column | Purpose |
|--------|---------|
| **Backlog** | All open issues & tasks not yet in active work. |
| **In&nbsp;Progress** | Issues or PRs that have an assignee actively working on them. |
| **Done** | Automatically populated when a pull-request is merged or a linked issue is closed. |

## Automation Rules

1. **Label sync** – Issues opened with the labels `bug`, `feature`, `doc`, etc. are automatically placed in **Backlog**.
2. **PR linkage** – When a pull-request references `closes #<issue-id>` it is shown in **In Progress** and moves to **Done** on merge.
3. **Release-Drafter** – Every merge updates draft release notes based on labels and PR titles (see `.github/release-drafter.yml`).
4. **Stale card cleanup** – Cards automatically archive 30 days after completion to keep the board tidy.

## Working With the Board

* Opening an issue with the correct template is enough—no manual card moves required.
* Keep PR titles concise; they become changelog entries.
* Large features should reference their **Task-Master** ID in the issue body for bidirectional traceability.

_For detailed contribution flow see `CONTRIBUTING.md`._
