#!/usr/bin/env node

import * as p from "@clack/prompts";

p.intro(`Create a Svelte project`);

p.group(
  {
    currentDir: () =>
      p.confirm({
        message: "Create in current directory?",
        initialValue: true,
      }),
    projectName: ({ results }) => {
      if (!results.currentDir) {
        return p.text({
          message: "Enter project name",
        });
      }
    },
    language: () =>
      p.select({
        message: `JavaScript or TypeScript`,
        initialValue: "ts",
        maxItems: 2,
        options: [
          { value: "ts", label: "TypeScript" },
          { value: "js", label: "JavaScript" },
        ],
      }),
    install: () =>
      p.confirm({
        message: "Install dependencies?",
        initialValue: false,
      }),
  },
  {
    onCancel: () => {
      p.cancel("Operation cancelled");
      process.exit(0);
    },
  },
);
