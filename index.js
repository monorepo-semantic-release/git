const path = require('path');
const {verifyConditions, prepare} = require('@semantic-release/git');
const resolveConfig = require('@semantic-release/git/lib/resolve-config');
const {isNil, uniq} = require('lodash');


async function verifyConditionsAll(pluginConfig, context) {
  const {logger} = context;

  await verifyConditions(pluginConfig, context);

  if (isNil(pluginConfig.assets)) {
    // Add "package.json" and "CHANGELOG.md" in package directories
    const {assets} = resolveConfig(pluginConfig, logger);
    pluginConfig.assets = uniq(assets.concat(pluginConfig.packages.map(pkg => [
      path.join(pkg, 'package.json'),
      path.join(pkg, 'CHANGELOG.md'),
    ]).flat()));
  }
}

async function prepareAll(pluginConfig, context) {
  // NOTE: generate placeholder variables for git plugin, may by remove in the future

  context.branch = context.pkgContexts[0].branch;

  const notes = [];
  const versions = [];
  context.pkgContexts.forEach(({nextRelease}) => {
    if (!nextRelease) {
      return;
    }
    notes.push('# ' + nextRelease.gitTag + '\n\n' + nextRelease.notes);
    versions.push(nextRelease.gitTag);
  })
  context.nextRelease = {
    version: versions.join(', '),
    notes: notes.join('\n\n')
  }

  await prepare(pluginConfig, context);
}

module.exports = {verifyConditionsAll, prepareAll};