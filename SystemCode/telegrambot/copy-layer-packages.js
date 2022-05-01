const fs = require('fs');

fs.copyFile('./package.json', './src/layer/nodejs/package.json', (err) => {
    if (err) throw err;
    console.log('copied package.json');
});
