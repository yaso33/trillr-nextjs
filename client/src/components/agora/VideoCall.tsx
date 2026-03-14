import {
  AgoraRTCProvider,
  type IAgoraRTCClient,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from 'agora-rtc-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import * as AgoraRTC from 'agora-rtc-sdk-ng'
import { Mic, MicOff, Phone, Video, VideoOff } from 'lucide-react'

const client = AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' })

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || ''
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || null

function VideoCall({ channelName, onEndCall }: { channelName: string; onEndCall: () => void }) {
  const [micOn, setMic] = useState(true)
  const [cameraOn, setCamera] = useState(true)

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)

  useJoin({ appid: APP_ID, channel: channelName, token: TOKEN })
  usePublish([localMicrophoneTrack, localCameraTrack])

  const remoteUsers = useRemoteUsers()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 grid grid-cols-2 gap-4">
        {/* Local User Video */}
        <div className="relative border rounded-lg overflow-hidden">
          <div className="absolute top-2 left-2 z-10 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
          {cameraOn ? (
            <LocalVideoTrack
              track={localCameraTrack}
              play={true}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <VideoOff className="text-white" size={48} />
            </div>
          )}
        </div>

        {/* Remote Users Video */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative border rounded-lg overflow-hidden">
            <div className="absolute top-2 left-2 z-10 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {user.uid}
            </div>
            <RemoteUser
              user={user}
              playVideo={true}
              playAudio={true}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="py-4 px-6 bg-gray-800 flex justify-center items-center gap-4">
        <Button
          onClick={() => setMic((a) => !a)}
          variant={micOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-12 h-12"
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          onClick={onEndCall}
          variant="destructive"
          size="icon"
          className="rounded-full w-16 h-16 mx-4"
        >
          <Phone className="transform -scale-x-100" />
        </Button>
        <Button
          onClick={() => setCamera((a) => !a)}
          variant={cameraOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-12 h-12"
        >
          {cameraOn ? <Video /> : <VideoOff />}
        </Button>
      </div>
    </div>
  )
}

const AgoraWrapper = ({
  channelName,
  onEndCall,
}: { channelName: string; onEndCall: () => void }) => {
  return (
    <AgoraRTCProvider client={client as unknown as IAgoraRTCClient}>
      <VideoCall channelName={channelName} onEndCall={onEndCall} />
    </AgoraRTCProvider>
  )
}

export default AgoraWrapper
