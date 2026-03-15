import Pusher from 'pusher'

if (!process.env.PUSHER_APP_ID) {
  console.warn('[Pusher] PUSHER_APP_ID not set – real-time events will be disabled.')
}

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
})
