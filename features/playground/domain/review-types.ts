// Re-export shim: the types live in domain/snapshots.ts. Move imports there.
export type {
  InlineComment,
  ReviewDecision,
  ReviewSnapshot,
  BugFixSnapshot,
  TestingSnapshot,
  GitBlockResolution,
  GitSnapshot,
  DocsSnapshot,
} from "./snapshots"
