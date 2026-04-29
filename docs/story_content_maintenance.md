# Story Content Maintenance Checklist

Use this checklist when adding or editing affection events.

## Event Definition

- Event id must be unique and stable, for example `hakima_5` or `mira_10`.
- `heroineId` must stay one of the existing heroine ids: `hakima`, `mira`, `dariya`.
- `threshold` must match the unlock tier used by the event system.
- `title` should be short and readable in the Memories screen.
- Keep the normal route text in `text` or `pages`.
- Put IF text in `routePages.long_history` when a route-specific variant is needed.

## Route Mode Rules

- `normal` means the standard route text.
- `long_history` means the alternate route text for the IF route.
- If `routeMode` is missing or invalid, the normal text should still display safely.
- Do not treat `long_history` as the true route, canon route, or main route.
- Do not treat `normal` as an unfinished fallback route.

## Content Safety

- Do not describe heroines as employees, shop staff, or hired help.
- Do not describe Nadir as an employer or a dominating master figure.
- Keep heroine roles as companions, collaborators, or people with a shared bond.
- Do not revive old names such as `Hakima-al-Zafira` or `Dariya-al-Mawt` in normal naming.
- Keep the ids `hakima`, `mira`, `dariya`, and `nader` unchanged.

## Suggested Review Steps

- Confirm the new event has normal text and, if needed, route-specific text.
- Confirm `getEventPages(event, routeMode)` still resolves the correct pages.
- Confirm `activeEvent` and `Backlog` behavior still work.
- Confirm mobile VNBox layout still reads cleanly.
- Add or update a unit test for the new event definition or fallback behavior.
- Add or update an E2E check if the route-specific text is user-facing.

## Minimum Checklist Before Merge

- [ ] Unique event id
- [ ] Correct heroine id
- [ ] Correct threshold
- [ ] Normal text present
- [ ] Long history pages present when needed
- [ ] Fallback behavior verified
- [ ] Backlog entry verified when relevant
- [ ] Active event persistence verified when relevant
- [ ] Unit test updated
- [ ] E2E updated if needed

