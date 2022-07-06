# createsimpleapps

Al[l/most] apps of CreateSimple Inc.

## Create webpart project

Run this in your terminal:
https://docs.microsoft.com/en-us/sharepoint/dev/spfx/toolchain/scaffolding-projects-using-yeoman-sharepoint-generator

Create Web Part

```shell
$ cd $root/projects/02.webparts
$ yo @microsoft/sharepoint --skip-install --component-type webpart --environment spo --no-skip-feature-deployment --no-is-domain-isolated --framework react
```

Create Extension

```shell
$ cd $root/projects/04.extensions
$ yo @microsoft/sharepoint --skip-install --component-type extension --environment spo


 --no-skip-feature-deployment --no-is-domain-isolated --framework react
```

Add code to rush.json

```json
{
  "packageName": "@cs-webparts/project-name",
  "projectFolder": "projects/02.webparts/0x.project-name",
  "reviewCategory": "production",
  "shouldPublish": true
}
```

Update CDN config file `$root/projects/02.webparts/0x.project-name/config/deploy-azure-storage.json`

Sample

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/deploy-azure-storage.schema.json",
  "workingDir": "./temp/deploy/",
  "account": "cdnforspfxwebpart",
  "container": "azurehosted-webpart",
  "accessKey": "b0n4CJipOfUCghfGrnqwgLlp1t5F29f0DZ620SXpOvYJL8xL7Y4StjHJo7KSY3RHRp4YWjq7Xk+MUjGICU8LbQ=="
}
```

Update CDN config file `$root/projects/02.webparts/0x.project-name/config/package-solution.json`

Sample

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "01-intranet-client-side-solution",
    "id": "fe6cd3d2-9cfc-4fe3-8975-2550b1f21235",
    "version": "1.0.0.0",
    "includeClientSideAssets": false,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false
  },
  "paths": {
    "zippedPackage": "solution/01-intranet.sppkg"
  }
}
```

Update CDN config file `$root/projects/02.webparts/0x.project-name/config/write-manifests.json`

Sample

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/write-manifests.schema.json",
  "cdnBasePath": "https://cdnforspfxwebpart.azureedge.net/azurehosted-webpart/"
}
```

## Create project 

yo @microsoft/sharepoint --skip-install --package-manager pnpm

## Create webpart

Run this in your terminal:

```shell
$ cd $root/projects/02.webparts
$ yo @microsoft/sharepoint --skip-install --component-type webpart --framework react
```

gulp serve --max_old_space_size=4000

## Build package

```shell
gulp clean
gulp bundle --ship
gulp bundle --ship --max-old-space-size=8192
gulp deploy-azure-storage
gulp package-solution --ship
rushx repackage
```

gulp clean && gulp bundle --ship && gulp package-solution --ship

## Rush

```
rush update --full --purge
rush update
rush add -p
rushx build
```

## Build Update Core

```
rushx build
```

## prettier - format code and check code

https://prettier.io/docs/en/install.html
https://prettier.io/docs/en/cli.html

Install:

```
rush add -p prettier --dev --exact
```

Check:

```
yarn prettier --write .
```

## Update SPFx & Type Script

https://www.notion.so/createsimpleapps-fed5dfc9494b485cb0a8b08f6fece607
// cd ../01.intranet && rushx build && cd ../02.staffDirectory && gulp serve

## set up and config project

Step 1

## if you installed you can next step

npm install -g @microsoft/rush
npm install gulp yo @microsoft/generator-sharepoint --global

## check the list of installed packages globally

npm list -g --depth=0

Step 2: cd any project and run:
rush update

example cd projects/02.webparts/01.intranet-webpart && rush update

Step 3 :cd projects/01.cs-core/01.common
rushx build

Step 4 cd projects/03.webpart-libraries/01-Library-Common
rushx build

Step 5: cd and project and run :
gulp serve

## Cài các extension mở rộng tăng tốc độ serve

npm install spfx-fast-serve -g
spfx-fast-serve
npm install
// thay thế gulp serve bằng lệnh :
npm run serve
