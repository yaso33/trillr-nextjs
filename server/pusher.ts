import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2078205',
  key: process.env.PUSHER_KEY || 'b899008fb2257ea055b9',
  secret: process.env.PUSHER_SECRET || '43e6e35fe9fd6c3420f2',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
})
