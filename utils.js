var path = require('path');
var fs = require('fs');

const ensureDirectoryExistence = (filePath) => {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

const makeLog = (dir, fileName, logs) => {
    const filePath = `${dir}/${fileName}`;
    ensureDirectoryExistence(filePath);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
};

const getLogFolderPathFromOrderId = orderId => `logs/errors/${orderId}`;

const trackingNumberExists = trackingNumber => trackingNumber !== '' && trackingNumber !== undefined && trackingNumber !== null;

module.exports = {
    trackingNumberExists,
    makeLog,
    getLogFolderPathFromOrderId,
};