#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

/*
  Updates the `package.json`'s `version` string to be the same value that
  the built assets will have as `Ember.VERSION`.
*/
function updatePackageJSONVersion() {
  let packageJSONPath = path.join(__dirname, '..', 'package.json');
  let VERSION = require('../broccoli/version').VERSION;

  let pkgContents = fs.readFileSync(packageJSONPath, { encoding: 'utf-8' });
  let pkg = JSON.parse(pkgContents);
  pkg._versionPreviouslyCalculated = true;
  pkg._originalVersion = pkg.version;
  pkg.version = VERSION;
  fs.writeFileSync(packageJSONPath, JSON.stringify(pkg, null, 2), { encoding: 'utf-8' });
}

/*
  Updates the version number listed within the docs/data.json file to match
  `Ember.VERSION` and `package.json` version.

  This is needed because ember-cli-yuidoc automatically sets the version string
  property in the generated `docs/data.json` to
`${packageJsonVersion}.${gitSha}`.
*/
function updateDocumentationVersion() {
  let docsPath = path.join(__dirname, '..', 'docs', 'data.json');
  let VERSION = require('../broccoli/version').VERSION;

  let contents = fs.readFileSync(docsPath, { encoding: 'utf-8' });
  let docs = JSON.parse(contents);
  docs.project.version = VERSION;
  fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2), { encoding: 'utf-8' });
}

updatePackageJSONVersion();

// do a production build
execSync('yarn build');

// generate docs
execSync('yarn docs');
updateDocumentationVersion();

// using npm pack here because `yarn pack` does not honor the `package.json`'s `files`
// property properly, and therefore the tarball generated is quite large (~7MB).
execSync('npm pack');
