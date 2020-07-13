const path = require('path');
const {verifyConditions, prepare} = require('@semantic-release/git');
const resolveConfig = require('@semantic-release/git/lib/resolve-config');
const {isNil, uniq, forEach} = require('lodash');
const debug = require('debug')('semantic-release:monnorepo-git');

async function prepareAll(pluginConfig, context) {
  const {options: {versionMode}, logger, pkgContexts} = context;

  if (isNil(pluginConfig.assets)) {
    // Add "package.json" and "CHANGELOG.md" in package directories
    const {assets} = resolveConfig(pluginConfig, logger);
    pluginConfig.assets = uniq(assets.concat(pluginConfig.packages.map(pkg => [
      path.join(pkg, 'package.json'),
      path.join(pkg, 'composer.json'),
      path.join(pkg, 'CHANGELOG.md'),
    ]).flat()));

    debug('Use default assets: %O', pluginConfig.assets);
  }

  // NOTE: generate placeholder variables for git plugin, may by remove in the future
  context.branch = Object.values(pkgContexts)[0].branch;

  const notes = [];
  const versions = [];
  forEach(pkgContexts, ({name, nextRelease}) => {
    if (!nextRelease) {
      return;
    }
    notes.push(`# ${name}\n\n${nextRelease.notes}`);
    versions.push(nextRelease.gitTag);
  });

  context.nextRelease = {
    version: uniq(versions).join(', '),
    notes: notes.join('\n\n'),
  }

  await prepare(pluginConfig, context);
}

module.exports = {verifyConditionsAll: verifyConditions, prepareAll};