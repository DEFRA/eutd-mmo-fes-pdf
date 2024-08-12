# mmo-ecc-pdf-svc

# Things to Consider
* This repository should use GitFlow as a branching strategy.
* <img
    src="docs/images/GitFlow-branching-strategy.png"
    alt="Branching Strategy"
    title="GitFlow"
    style="display: inline-block; margin: 0 auto; max-width: 350px">
* If you won't call your branch as per agreed branching `standards`, the Azure pipeline won't start or may fail to deploy an image.


## Overview

A service that provides pdf related functionality for export catch certificates such as rendering pdfs and storing to 
Azure blob storage.

## Configuration
 - AZURE_STORAGE_CONNECTION_STRING

## Testing

```shell
 $ npm run test:integration
```
