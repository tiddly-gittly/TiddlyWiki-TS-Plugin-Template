# Typescript plugin template for TiddlyWiki5

## What need to change after apply the template

### Basic

1. update `author`, `name`, `url` and `description` in the [package.json](package.json).
1. write your plugin code in the [src/](src/) directory, use `index.ts` as your ts code's entry point.
1. other tid files just put in the src directory, they will be copy to the plugin automatically

### Publish

Enable github action in your repo, and when you tagging a new version `vx.x.x` in a git commit and push, it will automatically publish to the github release.
