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
    // Domain contracts belong in features/playground/domain/ (see docs/architecture/01-assessment-report.md §4.5).
    files: ["lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/**"],
              message:
                "lib/ must not import from components/ — move the type to features/playground/domain/ instead (docs/architecture §4.5).",
            },
          ],
        },
      ],
    },
  }
)
