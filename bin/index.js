#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and store the answer in the config object
function askQuestion(question, defaultAnswer) {
  return new Promise((resolve) =>
    rl.question(`${question} (${defaultAnswer}): `, resolve)
  ).then((a) => (a?.length ? a : defaultAnswer));
}

async function getShouldEnable(name, isEnabled) {
  if (isEnabled) {
    return false;
  }
  const shouldEnable = await askQuestion(`Enable "${name}"`, "yes");
  return shouldEnable === "yes";
}

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} airentPackage
 *  @property {string} schemaPath
 *  @property {string} entityPath
 *  @property {?string[]} [augmentors]
 *  @property {?Template[]} [templates]
 *  @property {?string} airentApiPackage
 *  @property {string} requestContextImport
 */

const PROJECT_PATH = process.cwd();
const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");

const AIRENT_API_EXPRESS_RESOURCES_PATH =
  "node_modules/airent-api-express/resources";
const API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH = `${AIRENT_API_EXPRESS_RESOURCES_PATH}/routes.ts.ejs`;

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const augmentors = config.augmentors ?? [];
  const templates = config.templates ?? [];
  return { ...config, augmentors, templates };
}

async function configure() {
  const config = await loadConfig();
  const { templates } = config;
  const isApiExpressEnabled = templates.find(
    (t) => t.name === API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH
  );
  const shouldEnableApiExpress = await getShouldEnable(
    "Api Express",
    isApiExpressEnabled
  );
  if (!shouldEnableApiExpress) {
    return;
  }

  const outputPath = await askQuestion(
    "Express Api Routes Output File Path",
    "src/airent-routes.ts"
  );
  templates.push({
    name: API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH,
    outputPath,
    skippable: false,
  });

  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT-API-EXPRESS/INFO] Package configured.`);
}

async function main() {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      throw new Error(
        '[AIRENT-API-EXPRESS/ERROR] "airent.config.json" not found'
      );
    }

    await configure();
  } finally {
    rl.close();
  }
}

main().catch(console.error);
