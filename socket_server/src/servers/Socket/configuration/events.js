global.socketEvents = {
  client: {
    'sync_app': 'client:sync_app',
    'send_message': 'client:send_message',
    'seen_message': 'client:seen_message',
    'connect_to_chat': 'client:connect_to_chat',
    'typing_status_change': 'client:typing_status_change'
  },
  server: {
    'sync_app': 'server:sync_app',
    'send_message': 'server:send_message',
    'seen_message': 'server:seen_message',
    'session': 'server:session',
    'online_status_change': 'server:online_status_change',
    'typing_status_change': 'server:typing_status_change',
  },
};