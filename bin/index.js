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

async function getShouldEnable(name) {
  const shouldEnable = await askQuestion(`Enable "${name}"`, "yes");
  return shouldEnable === "yes";
}

/** @typedef {Object} ApiExpressConfig
 *  @property {?string} libImportPath
 */

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} libImportPath
 *  @property {string} schemaPath
 *  @property {string} entityPath
 *  @property {?string[]} [augmentors]
 *  @property {?Template[]} [templates]
 *  @property {?ApiExpressConfig} apiExpress
 */

const PROJECT_PATH = process.cwd();
const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");

const AIRENT_API_EXPRESS_RESOURCES_PATH =
  "node_modules/@airent/api-express/resources";
const API_EXPRESS_AUGMENTOR_PATH = `${AIRENT_API_EXPRESS_RESOURCES_PATH}/augmentor.js`;
const API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH = `${AIRENT_API_EXPRESS_RESOURCES_PATH}/routes-template.ts.ejs`;

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const augmentors = config.augmentors ?? [];
  const templates = config.templates ?? [];
  return { ...config, augmentors, templates };
}

async function configure() {
  const config = await loadConfig();
  const { augmentors, templates } = config;
  const isAugmentorEnabled = augmentors.includes(API_EXPRESS_AUGMENTOR_PATH);
  const apiExperessServerRoutesTemplate = templates.find(
    (t) => t.name === API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH
  );
  const isApiExpressEnabled =
    isAugmentorEnabled || apiExperessServerRoutesTemplate !== undefined;
  const shouldEnableApiExpress = isApiExpressEnabled
    ? true
    : await getShouldEnable("Api Express");
  if (!shouldEnableApiExpress) {
    return;
  }
  if (!isAugmentorEnabled) {
    augmentors.push(API_EXPRESS_AUGMENTOR_PATH);
  }

  config.apiExpress = config.apiExpress ?? {};
  config.apiExpress.routesFilePath = await askQuestion(
    "Express Api Routes Output File Path",
    config.apiExpress.routeFilePath ?? "./src/airent-routes.ts"
  );
  if (apiExperessServerRoutesTemplate === undefined) {
    templates.push({
      name: API_EXPRESS_SERVER_ROUTES_TEMPLATE_PATH,
      outputPath: "{apiExpress.routesFilePath}",
      skippable: false,
    });
  }

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
