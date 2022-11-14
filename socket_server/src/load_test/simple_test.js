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
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY2ODQ1ODI4M30.5Jf1WusfJ4-oH0HnEMQhDB_7g75JLXvlVCUAGhM_ZfY'
        },
        authConnect: true,
    });

    socket.on('error', console.log);

    socket.emit(events["client:sync_app"]);

    socket.on(events["server:sync_app"], data => {
        console.log(data);
    });
} catch (e) {
    console.log(e);
}