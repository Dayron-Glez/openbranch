import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"

const oldPathRule = {
  group: [
    "@/components/docs/**",
    "@/components/home/**",
    "@/components/nav/**",
    "@/components/shared/**",
    "@/lib/hooks/**",
    "@/lib/playground/**",
  ],
  message:
    "Pre-refactor path removed in the feature-first migration (#97). Use @/features/* or @/shared/*.",
}

const crossFeature = (blocked) => ({
  group: blocked,
  message:
    "Cross-feature import. A feature must not depend on a sibling feature — promote shared code to @/shared/ or @/components/ui/ (Phase 7c, P5).",
})

export default tseslint.config(
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [".next/**", "node_modules/**", ".source/**", "content/playground/templates/**"],
  },
  {
    // Global: no one may resurrect a pre-refactor import path.
    rules: { "no-restricted-imports": ["error", { patterns: [oldPathRule] }] },
  },
  {
    // lib/ is the lowest layer: no UI, no shared, no features.
    files: ["lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            oldPathRule,
            {
              group: ["@/components/**", "@/shared/**", "@/features/**"],
              message:
                "lib/ must not import from UI/shared/features — it is the lowest layer (docs/architecture §4.5).",
            },
          ],
        },
      ],
    },
  },
  {
    // shared/ must stay a leaf — never import a feature (DI via props instead).
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            oldPathRule,
            {
              group: ["@/features/**"],
              message:
                "shared/ must stay a leaf — inject feature components via props (see I18nRootProvider).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["features/docs/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [oldPathRule, crossFeature(["@/features/home/**", "@/features/playground/**"])],
        },
      ],
    },
  },
  {
    files: ["features/home/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [oldPathRule, crossFeature(["@/features/docs/**", "@/features/playground/**"])],
        },
      ],
    },
  },
  {
    files: ["features/playground/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [oldPathRule, crossFeature(["@/features/docs/**", "@/features/home/**"])] },
      ],
    },
  }
)
