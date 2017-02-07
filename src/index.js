const async = require('async');
const fs    = require('fs');
const path  = require('path');

const DEFAULT_MONITOR_INTERVAL = 5000;
const schedule = (porla, folders) => setTimeout(
        checkMonitoredFolders.bind(undefined, porla, folders),
        DEFAULT_MONITOR_INTERVAL);

let history = [];

function getFilesInFolders(folders, completionCallback) {
    async.map(folders, (folder, callback) => {
        let folderPath = '';

        if (typeof folder === 'string') {
            folderPath = folder;
        } else if (typeof folder === 'object') {
            folderPath = folder.path;
        } else {
            throw new Error('unknown folder path');
        }

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return callback(err);
            }

            return callback(null, {
                folder: folder,
                files: files
            });
        });
    }, completionCallback);
}

function checkMonitoredFolders(porla, folders) {
    getFilesInFolders(folders, (err, results) => {
        if (err) {
            porla.log('error', 'Error when getting files: %s', err);
            return schedule(porla, folders);
        }

        async.each(results, (result, callback) => {
            if (!result.files || result.files.length === 0) {
                return callback();
            }

            for (const file of result.files) {
                if (typeof result.folder === 'string') {
                    const filePath = path.join(result.folder, file);
                    const extension = path.extname(filePath);

                    if (extension !== '.torrent' || history.includes(filePath)) {
                        return callback();
                    }

                    porla.addTorrent(filePath);
                    history.push(filePath);
                } else if (typeof result.folder === 'object') {
                    const filePath = path.join(result.folder.path, file);
                    const extension = path.extname(filePath);
                    const savePath = result.folder.savePath || porla.config.get([ 'defaultSavePath' ], '');

                    if (history.includes(filePath)) {
                        continue;
                    }

                    if (typeof result.folder.filter === 'string') {
                        const expression = new RegExp(result.folder.filter, 'i');

                        if (expression.test(file)) {
                            porla.addTorrent(filePath, { savePath: savePath });
                            history.push(filePath);
                        }
                    } else {
                        if (extension === '.torrent') {
                            porla.addTorrent(filePath, { savePath: savePath });
                            history.push(filePath);
                        }
                    }
                } else {
                    porla.log('error', 'Invalid folder type: %s', typeof result.folder)
                }
            }

            return callback();
        }, (err) => {
            if (err) {
                porla.log('error', 'Error when iterating files: %s', err);
            }

            return schedule(porla, folders);
        });
    });
}

module.exports = (porla) => {
    const folders = porla.config.get([ 'autoadd', 'folders' ], []);
    porla.log('info', 'Monitoring %d folder(s)', folders.length);

    schedule(porla, folders);
};
