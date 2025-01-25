const path = require("path");
const utils = require("airent/resources/utils.js");

function buildRelativePath(sourcePath, targetPath) /* string */ {
  const rawRelativePath = path
    .relative(sourcePath, targetPath)
    .replaceAll("\\", "/");
  return rawRelativePath.startsWith(".")
    ? rawRelativePath
    : `./${rawRelativePath}`;
}

function buildRelativeFull(sourcePath, targetPath, config) /* string */ {
  if (!targetPath.startsWith(".")) {
    return targetPath;
  }
  const suffix = utils.getModuleSuffix(config);
  const relativePath = buildRelativePath(sourcePath, targetPath);
  return `${relativePath}${suffix}`;
}

function augmentConfig(config) {
  config._packages.apiExpress = {
    handlerToLibFull: config.apiExpress.libImportPath
      ? buildRelativeFull(
          path.join(config.generatedPath, "handlers"),
          config.apiExpress.libImportPath,
          config
        )
      : "@airent/api-express",
    handlerToHandlerConfigFull: buildRelativeFull(
      path.join(config.generatedPath, "handlers"),
      config.apiExpress.handlerConfigImportPath,
      config
    ),
  };
}

function augmentOne(entity, config) {
  if (!entity.api) {
    return;
  }

  entity._packages.apiExpress = {
    routesToHandlerFull: buildRelativePath(
      path.dirname(config.apiExpress.routesFilePath),
      path.join(config.generatedPath, "handlers", entity._strings.moduleName),
      config
    ),
    handlerToDispatcherFull: buildRelativePath(
      path.join(config.generatedPath, "handlers"),
      path.join(config.generatedPath, "dispatchers", entity._strings.moduleName)
    ),
  };
}

function augment(data) {
  const { entityMap, config } = data;
  augmentConfig(config);
  Object.values(entityMap).forEach((entity) => augmentOne(entity, config));
}

module.exports = { augment };
