const DEFAULT_MONITOR_INTERVAL = 2000;

function checkMonitoredFolders(porla) {
    porla.log('debug', 'Checking monitored folders');
}

module.exports = (porla) => {
    setTimeout(
        checkMonitoredFolders.bind(undefined, porla),
        DEFAULT_MONITOR_INTERVAL);
};
