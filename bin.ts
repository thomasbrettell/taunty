#!/usr/bin/env node

import { version } from "./package.json" with { type: "json" };
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import ejs from "ejs";
import { merge } from "lodash";

const __dirname = fileURLToPath(import.meta.url);
const cwd = process.cwd();

const templateDir = path.resolve(__dirname, `../../templates/svelte`);

const templateFiles = new Set(["index.html", "src/components/App.svelte"]);

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

const getInferredProjectName = () => {
  const splits = cwd.split("/");
  return splits[splits.length - 1];
};

function getValidProjectName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

const main = async () => {
  const inferredProjectName = getValidProjectName(getInferredProjectName());
  let projectName = inferredProjectName;
  let projectDir = cwd;

  p.intro(`taunty ${pc.gray(`(v${version})`)}`);

  const result = await p.group(
    {
      currentDir: () =>
        p.confirm({
          message: "Create project in current directory?",
          initialValue: true,
        }),
      projectName: ({ results }) => {
        if (!results.currentDir) {
          return p.text({
            message: "Project name:",
            placeholder: "taunty-project",
            validate: (val) => {
              if (!val) return "Enter a project name";
              projectName = getValidProjectName(val);
              projectDir = path.join(cwd, projectName);
              return undefined;
            },
          });
        }
      },
      emptyCheck: () => {
        if (fs.existsSync(projectDir) && !isEmpty(projectDir)) {
          throw new Error(pc.red("The target directory is not empty. Operation cancelled."));
        }
        return undefined;
      },
      displayProjectName: () => {
        p.log.info(pc.yellow(`Project name is: ${projectName}`));
        return undefined;
      },
      language: () =>
        p.select({
          message: `JavaScript or TypeScript`,
          initialValue: "ts",
          maxItems: 2,
          options: [
            { value: "ts", label: pc.blueBright("TypeScript") },
            { value: "js", label: pc.yellowBright("JavaScript") },
          ],
        }),
      includeD3: () =>
        p.confirm({
          message: "Include D3?",
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

  const { language, currentDir, includeD3 } = result;

  const isTS = language === "ts";

  let templateSubDir = `${templateDir}/base`;
  const write = (file: string) => {
    const filePath = path.join(templateSubDir, file);

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fs.mkdirSync(path.join(projectDir, file), { recursive: true });
      const files = fs.readdirSync(`${templateSubDir}/${file}`);
      files.forEach((_file) => {
        write(`${file}/${_file}`);
      });
    } else {
      let fileName = file;

      if (file === "_gitignore") {
        fileName = ".gitignore";
      }
      if (isTS && file === "src/index.js") {
        fileName = "src/index.ts";
      }

      const targetPath = path.join(projectDir, fileName);

      if (templateFiles.has(file)) {
        const fileContents = fs.readFileSync(filePath, "utf-8");
        const output = ejs.render(fileContents, { isTS });
        fs.writeFileSync(targetPath, output);
      } else if (file === "package.json") {
        let pkg = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        pkg.name = projectName;

        if (includeD3) {
          const d3Deps = JSON.parse(fs.readFileSync(`${templateDir}/additionals/d3.json`, "utf-8"));
          pkg = merge({}, pkg, d3Deps);
        }

        if (isTS) {
          const tsDeps = JSON.parse(fs.readFileSync(`${templateDir}/additionals/ts.json`, "utf-8"));
          pkg = merge({}, pkg, tsDeps);
        }

        fs.writeFileSync(targetPath, JSON.stringify(pkg, null, 2) + "\n");
      } else {
        fs.copyFileSync(filePath, targetPath);
      }
    }
  };

  const templateDirs = [`${templateDir}/base`, `${templateDir}/${isTS ? "ts" : "js"}`];

  templateDirs.forEach((dir) => {
    templateSubDir = dir;
    const files = fs.readdirSync(templateSubDir);
    for (const file of files) {
      write(file);
    }
  });

  p.outro(`
    Done. Now run:\n
    ${!currentDir ? `cd ${projectName}` : ""}
    npm i
    npm run dev
    `);
};

main();
