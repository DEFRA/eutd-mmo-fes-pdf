#/bin/bash
export LANG=C.UTF-8
curl -O https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz
tar -xf node-v22.13.1-linux-x64.tar.xz --directory /tmp
export PATH="/tmp/node-v22.13.1-linux-x64/bin:$PATH"
rm node-v22.13.1-linux-x64.tar.xz
echo "[INFO] npm ci"
npm ci > /tmp/mmo-cc-pdf-npmci.log 2>&1
echo "[INFO] npm run test-vstack"
npm run test-vstack > /tmp/mmo-cc-pdf-npmtest.log 2>&1
rm -rf /tmp/node-v22.13.1-linux-x64
