#/bin/bash
export LANG=C.UTF-8
curl -O https://nodejs.org/dist/v24.12.0/node-v24.12.0-linux-x64.tar.xz
tar -xf node-v24.12.0-linux-x64.tar.xz --directory /tmp
export PATH="/tmp/node-v24.12.0-linux-x64/bin:$PATH"
rm node-v24.12.0-linux-x64.tar.xz
echo "[INFO] npm ci"
npm ci > /tmp/mmo-cc-pdf-npmci.log 2>&1
echo "[INFO] npm run test-vstack"
npm run test-vstack > /tmp/mmo-cc-pdf-npmtest.log 2>&1
rm -rf /tmp/node-v24.12.0-linux-x64
