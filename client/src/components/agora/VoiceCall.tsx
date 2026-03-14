import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
// Import the type from the wrapper library to help TypeScript
import {
  AgoraRTCProvider,
  type IAgoraRTCClient,
  RemoteUser,
  useJoin,
  useLocalMicrophoneTrack,
  useRemoteUsers,
} from 'agora-rtc-react'
// Import the factory from the core SDK
import * as AgoraRTC from 'agora-rtc-sdk-ng'
import { Mic, MicOff, Phone } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || ''
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || null

// Create Agora client using the core SDK. It's created once when the module is loaded.
const agoraClient = AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' })

interface VoiceCallProps {
  channelName: string
  onEndCall: () => void
}

const VoiceCallContent: React.FC<VoiceCallProps> = ({ channelName, onEndCall }) => {
  const [isMicMuted, setIsMicMuted] = useState(false)
  // Automatically enable the microphone when joining the call
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true)
  const remoteUsers = useRemoteUsers()

  // Hook to join the channel with the provided App ID and channel name
  useJoin({ appid: APP_ID, channel: channelName, token: TOKEN })

  const toggleMic = () => {
    if (localMicrophoneTrack) {
      const newMutedState = !isMicMuted
      localMicrophoneTrack.setMuted(newMutedState)
      setIsMicMuted(newMutedState)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
      <p className="text-xl font-semibold mb-2">Voice Call</p>
      <p className="text-muted-foreground mb-8">Channel: {channelName}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Local User */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-24 h-24 border-4 border-green-500">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>YOU</AvatarFallback>
          </Avatar>
          <p className="font-semibold">You</p>
        </div>

        {/* Remote Users */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="flex flex-col items-center gap-2">
            <RemoteUser user={user} playAudio={true} />
            <Avatar
              className={`w-24 h-24 border-4 ${user.hasAudio ? 'border-blue-500' : 'border-gray-500'}`}
            >
              <AvatarImage src={`/api/avatar/${user.uid}`} />
              <AvatarFallback>{user.uid.toString().slice(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{user.uid}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-16 flex items-center gap-6">
        <Button
          onClick={toggleMic}
          size="icon"
          variant={isMicMuted ? 'destructive' : 'secondary'}
          className="w-16 h-16 rounded-full"
        >
          {isMicMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          onClick={onEndCall}
          size="icon"
          variant="destructive"
          className="w-20 h-20 rounded-full"
        >
          <Phone className="transform -scale-x-100" />
        </Button>
      </div>
    </div>
  )
}

const VoiceCall: React.FC<VoiceCallProps> = ({ channelName, onEndCall }) => {
  return (
    // We use a type assertion here (as unknown as IAgoraRTCClient) to resolve a type
    // mismatch issue between the Agora SDK and the React wrapper. This tells TypeScript
    // that we are sure the client object is compatible.
    <AgoraRTCProvider client={agoraClient as unknown as IAgoraRTCClient}>
      <VoiceCallContent channelName={channelName} onEndCall={onEndCall} />
    </AgoraRTCProvider>
  )
}

export default VoiceCall
