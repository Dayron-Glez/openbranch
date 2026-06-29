import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"

export default tseslint.config(
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [".next/**", "node_modules/**", ".source/**", "content/playground/templates/**"],
  },
  {
    // Dependency-direction guard: lib/ must not import from components/.
    // Domain contracts belong in lib/playground/domain/ (see docs/architecture/01-assessment-report.md §4.5).
    // Severity is "warn" until the existing DiffFile inversion is fixed in Phase 1, then bumped to "error".
    files: ["lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/components/**"],
              message:
                "lib/ must not import from components/ — move the type to lib/playground/domain/ instead (docs/architecture §4.5).",
            },
          ],
        },
      ],
    },
  }
)
