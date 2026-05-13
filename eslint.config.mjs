import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored UI primitives — third-party code we don't maintain:
    "components/ai-elements/**",
    "components/ui/carousel.tsx",
    ".agents/**",
    ".claude/**",
  ]),
  {
    // PDF templates target @react-pdf/renderer (non-DOM JSX), so the
    // unescaped-entities rule doesn't apply — quotes and apostrophes
    // pass straight through to the PDF text layer.
    files: ["scripts/pdf/**/*.tsx", "scripts/generate-pdfs.tsx"],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
