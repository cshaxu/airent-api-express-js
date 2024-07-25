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
 *  @property {string} handlerConfigImportPath
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

const API_EXPRESS_ROUTES_TEMPLATE_CONFIG = {
  name: `${AIRENT_API_EXPRESS_RESOURCES_PATH}/routes-template.ts.ejs`,
  outputPath: `{apiExpress.routesFilePath}`,
  skippable: false,
};
const API_EXPRESS_HANDLER_TEMPLATE_CONFIG = {
  name: `${AIRENT_API_EXPRESS_RESOURCES_PATH}/handler-template.ts.ejs`,
  outputPath: `{entityPath}/generated/{kababEntityName}-handler.ts`,
  skippable: false,
};

const API_EXPRESS_TEMPLATE_CONFIGS = [
  API_EXPRESS_ROUTES_TEMPLATE_CONFIG,
  API_EXPRESS_HANDLER_TEMPLATE_CONFIG,
];

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const augmentors = config.augmentors ?? [];
  const templates = config.templates ?? [];
  return { ...config, augmentors, templates };
}

function addTemplate(config, draftTemplate) {
  const { templates } = config;
  const template = templates.find((t) => t.name === draftTemplate.name);
  if (template === undefined) {
    templates.push(draftTemplate);
  }
}

async function configure() {
  const config = await loadConfig();
  const { augmentors } = config;
  const isAugmentorEnabled = augmentors.includes(API_EXPRESS_AUGMENTOR_PATH);
  const shouldEnableApiExpress = isAugmentorEnabled
    ? true
    : await getShouldEnable("Api Express");
  if (!shouldEnableApiExpress) {
    return;
  }
  if (!isAugmentorEnabled) {
    augmentors.push(API_EXPRESS_AUGMENTOR_PATH);
  }
  API_EXPRESS_TEMPLATE_CONFIGS.forEach((t) => addTemplate(config, t));

  config.apiExpress = config.apiExpress ?? {};

  config.apiExpress.routesFilePath = await askQuestion(
    "Express Api Routes Output File Path",
    config.apiExpress.routesFilePath ?? "./src/routes.ts"
  );

  config.apiExpress.handlerConfigImportPath = await askQuestion(
    'Import path for "handlerConfig"',
    config.apiExpress.handlerConfigImportPath ?? "./src/framework"
  );

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
