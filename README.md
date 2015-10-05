# noisy: html5 media player for the fools

## install

```
npm install
```

Add grunt globally:

```
npm install -g grunt
```

NB: **phantomjs** & **jasmine** might need to be installed globally also.

## Coding

To watch the file system, run a localhost express server on port 9001 (serving assets/ and dist/ directory)

```
grunt dev
```

## Committing

Use [AngularJS](https://github.com/ajoslin/conventional-changelog/blob/master/conventions/angular.md) syntax for commits (it gets added to the CHANGELOG.md nicely) with grunt.

If the prefix is **feat**, **fix** or **perf**, it will always appear in the changelog.

Other prefixes are up to your discretion. Suggested prefixes are **chore**, **style**, **refactor**, and **test** for non-changelog related tasks.

Appears under "Features" header, pencil subheader:

```
feat(pencil): add 'graphiteWidth' option
```

Appears under "Bug Fixes" header, graphite subheader, with a link to issue #28 (this will close issue #28 automagically in gitlab...):

```
fix(graphite): stop graphite breaking when width < 0.1

Closes #28
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```
perf(pencil): remove graphiteWidth option

BREAKING CHANGE: The graphiteWidth option has been removed. The default
graphite width of 10mm is always used for performance reason.

```

The following commit and commit `667ecc1` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```
revert: feat(pencil): add 'graphiteWidth' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

## Releasing

To release, bump version number, update changelog, tag & push...

```
grunt release
```
