import { Button } from '@/components/ui/button'
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
import * as AgoraRTC from 'agora-rtc-sdk-ng'
import { Mic, MicOff, Phone, ScreenShare, ScreenShareOff, Video, VideoOff } from 'lucide-react'
import React, { useState } from 'react'

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || ''
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || null

const client = AgoraRTC.createClient({ codec: 'vp8', mode: 'live', role: 'host' })

interface LiveStreamProps {
  channelName: string
  role: 'host' | 'audience'
  onEndStream: () => void
}

const HostView: React.FC<{ channelName: string; onEndStream: () => void }> = ({
  channelName,
  onEndStream,
}) => {
  const [micOn, setMic] = useState(true)
  const [cameraOn, setCamera] = useState(true)

  // Tracks for the host
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)

  // Hook to join the channel
  useJoin({ appid: APP_ID, channel: channelName, token: TOKEN })

  // Hook to publish the host's tracks
  usePublish([localMicrophoneTrack, localCameraTrack])

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-grow p-4 grid grid-cols-1 gap-4">
        <div className="relative border border-blue-500 rounded-lg overflow-hidden">
          <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            You (Host)
          </div>
          {cameraOn ? (
            <LocalVideoTrack
              track={localCameraTrack}
              play={true}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <VideoOff size={48} />
              <p className="absolute bottom-4">Camera is off</p>
            </div>
          )}
        </div>
      </div>
      <div className="py-4 px-6 bg-gray-800 flex justify-center items-center gap-4">
        <Button
          onClick={() => setMic((m) => !m)}
          variant={micOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-12 h-12"
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          onClick={onEndStream}
          variant="destructive"
          size="icon"
          className="rounded-full w-16 h-16 mx-4"
        >
          <Phone className="transform -scale-x-100" />
        </Button>
        <Button
          onClick={() => setCamera((c) => !c)}
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

const AudienceView: React.FC<{ channelName: string; onLeave: () => void }> = ({
  channelName,
  onLeave,
}) => {
  // Join the channel as an audience member
  useJoin({ appid: APP_ID, channel: channelName, token: TOKEN })

  const remoteUsers = useRemoteUsers()
  const host = remoteUsers.find((user) => user.uid === client.uid) // Find the host

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-grow p-4 flex items-center justify-center">
        {host?.hasVideo ? (
          <div className="relative w-full h-full">
            <RemoteUser
              user={host}
              playVideo={true}
              playAudio={true}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              Live Stream
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Waiting for the host to start the stream...</h2>
            <p className="text-gray-400 mt-2">
              The live stream will appear here once the host begins broadcasting.
            </p>
          </div>
        )}
      </div>
      <div className="py-4 px-6 bg-gray-800 flex justify-center items-center">
        <Button onClick={onLeave} variant="destructive">
          Leave Stream
        </Button>
      </div>
    </div>
  )
}

const LiveStream: React.FC<LiveStreamProps> = ({ channelName, role, onEndStream }) => {
  // Ensure role is correctly passed to the client config
  const agoraClient = React.useMemo(() => {
    const config = { codec: 'vp8', mode: 'live', role }
    return AgoraRTC.createClient(config)
  }, [role])

  return (
    <AgoraRTCProvider client={agoraClient as unknown as IAgoraRTCClient}>
      {role === 'host' ? (
        <HostView channelName={channelName} onEndStream={onEndStream} />
      ) : (
        <AudienceView channelName={channelName} onLeave={onEndStream} />
      )}
    </AgoraRTCProvider>
  )
}

export default LiveStream
