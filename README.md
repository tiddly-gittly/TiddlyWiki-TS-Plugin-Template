# Typescript plugin template for TiddlyWiki5

This template will help you automatically package zipped multiple-file plugin for nodejs wiki, and single file JSON plugin for HTML wiki.

## What need to change after apply the template

### Basic

1. update `author`, `name`, `url` and `description` in the [package.json](package.json).
1. write your plugin code in the [src/](src/) directory, use `index.ts` as your ts code's entry point.
1. other tid files just put in the src directory, they will be copy to the plugin automatically.
    1. You can use folder to organize the files, like `src/filters/` to place the filter tiddlers, and that structure will be preserved in the nodejs multiple-file plugin
    1. In the JSON plugin, the structure will strictly follow the tiddler title.

### Publish

Enable github action in your repo (in your github repo - setting - action - general) if it is not allowed, and when you tagging a new version `vx.x.x` in a git commit and push, it will automatically publish to the github release.

### Examples

- https://github.com/tiddly-gittly/tw-react
- https://github.com/tiddly-gittly/slate-write
