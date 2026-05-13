---
name: prd-to-tasks
description: Break a PRD into independently-grabbable tasks using tracer-bullet vertical slices. Use when user wants to convert a PRD to tasks, create implementation tickets, or break down a PRD into work items. The PRD lives at docs/prd.md and tasks are written to docs/tasks.json.
---

# PRD to Tasks

Break a PRD into independently-grabbable tasks using vertical slices (tracer bullets).

## Process

### 1. Locate the PRD

Read the PRD from `docs/prd.md`.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** tasks. Each task is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other tasks (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any tasks be merged or split further?
- Are the correct tasks marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Write tasks to docs/tasks.json

Once approved, write all tasks to `docs/tasks.json`. Use incrementing integer IDs starting from 1 (or continuing from the highest existing ID if the file already exists). Create tasks in dependency order (blockers first) so IDs are stable for cross-references.

<task-schema>
{
  "tasks": [
    {
      "id": 1,
      "title": "Short descriptive name",
      "type": "AFK | HITL",
      "status": "pending",
      "description": "A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the PRD rather than duplicating content.",
      "acceptance_criteria": [
        "Criterion 1",
        "Criterion 2",
        "Criterion 3"
      ],
      "blocked_by": [],
      "user_stories": [
        "User story 3",
        "User story 7"
      ]
    }
  ]
}
</task-schema>

Field notes:
- **id**: integer, unique, ascending
- **blocked_by**: array of task IDs (integers), or empty array if no blockers
- **status**: always `"pending"` on creation
- **user_stories**: reference by name/number from the PRD

If `docs/tasks.json` already exists, read it first and append new tasks without overwriting existing ones.

Do NOT modify `docs/prd.md`.