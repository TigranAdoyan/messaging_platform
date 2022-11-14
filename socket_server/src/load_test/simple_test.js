try {
    const {io} = require('socket.io-client');

    const events = {
        'client:sync_app': 'client:sync_app',
        'client:send_message': 'client:send_message',
        'server:sync_app': 'server:sync_app',
        'server:send_message': 'server:send_message',
    };


    const socket = io(`http://localhost:3334/message`, {
        transports: ["polling", "websocket"],
        auth: {
            username: "some_username",
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY2ODQxNzk0OX0.G3PJ41WQEOLYPumTIDhrqBlH3pDBX4aerla_d9F9cx8'
        },
        authConnect: true,
    });

    socket.on('error', console.log);

    socket.emit(events["client:sync_app"]);

    socket.on(events["server:sync_app"], data => {
        console.log(JSON.parse(data));
    });
} catch (e) {
    console.log(e);
}