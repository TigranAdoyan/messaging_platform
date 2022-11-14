const path = require('path');
const { promises: Fs } = require('fs');

function getAbsoluteFilePath(pathFromRoot) {
    return path.join(__dirname, `../../${pathFromRoot}`);
}

async function isFileExist(filePath) {
    try {
        await Fs.access(getAbsoluteFilePath(filePath));
    } catch {
        return false;
    }
}

module.exports.getAbsoluteFilePath = getAbsoluteFilePath;
module.exports.isFileExist = isFileExist;
