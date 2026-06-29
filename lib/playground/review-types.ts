// Re-export shim — types live in domain/snapshots.ts.
// Kept for backward compatibility; update imports to domain/snapshots when convenient.
export type {
  InlineComment,
  ReviewDecision,
  ReviewSnapshot,
  BugFixSnapshot,
  TestingSnapshot,
  GitBlockResolution,
  GitSnapshot,
  DocsSnapshot,
} from "./domain/snapshots"
