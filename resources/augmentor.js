const path = require("path");
const utils = require("airent/resources/utils.js");

function enforceRelativePath(relativePath) /* string */ {
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
}

function joinRelativePath(...elements) /* string */ {
  return enforceRelativePath(path.join(...elements).replaceAll("\\", "/"));
}

function buildRelativePackage(sourcePath, targetPath, config) /* string */ {
  if (!targetPath.startsWith(".")) {
    return targetPath;
  }
  const suffix = utils.getModuleSuffix(config);
  const relativePath = enforceRelativePath(
    path.relative(sourcePath, targetPath).replaceAll("\\", "/")
  );
  return `${relativePath}${suffix}`;
}

function augmentOne(entity, config, utils) {
  if (!entity.api) {
    return;
  }

  entity.api.strings.airentApiHandlerPackage = buildRelativePackage(
    path.dirname(config.apiExpress.routesFilePath),
    joinRelativePath(
      config.entityPath,
      "generated",
      `${utils.toKababCase(entity.name)}-handlers`
    ),
    config
  );
}

function augment(data) {
  const { entityMap, config, utils } = data;
  Object.values(entityMap).forEach((entity) =>
    augmentOne(entity, config, utils)
  );
}

module.exports = { augment };
