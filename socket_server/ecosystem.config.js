module.exports = {
    apps: [
        {
            name: 'socket_server',
            script: 'src/index.js',
            exec_mode: 'cluster',
            instances: 8
        }
    ]
};
