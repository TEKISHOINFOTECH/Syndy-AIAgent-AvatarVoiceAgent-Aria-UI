'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from 'livekit-client';
import { ConnectionStatus, LiveKitConfig } from '@/types';

export function useLiveKit() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
  });
  const [room, setRoom] = useState<Room | null>(null);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false);
  const roomRef = useRef<Room | null>(null);

  const connectToRoom = useCallback(async (config: LiveKitConfig) => {
    try {
      setConnectionStatus({ status: 'connecting', message: 'Connecting to room...' });

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = newRoom;

      // Set up event listeners
      newRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      newRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      newRoom.on(RoomEvent.Disconnected, handleDisconnected);
      newRoom.on(RoomEvent.DataReceived, handleDataReceived);
      newRoom.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const ariaIsSpeaking = speakers.some(
          (p) => p.identity !== newRoom.localParticipant.identity
        );
        setIsRemoteSpeaking(ariaIsSpeaking);
      });

      await newRoom.connect(config.url, config.token);
      
      // Mic stays OFF on connect — enabled later when form is submitted
      await newRoom.localParticipant.setMicrophoneEnabled(false);
      
      setRoom(newRoom);
      setConnectionStatus({ status: 'connected', message: 'Connected successfully' });
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setConnectionStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      });
    }
  }, []);

  const handleTrackSubscribed = useCallback((
    track: RemoteTrack,
    publication: any,
    participant: RemoteParticipant
  ) => {
    console.log('Track subscribed:', track.kind, 'from participant:', participant.identity);
    
    if (track.kind === Track.Kind.Video) {
      const videoElement = document.getElementById('remoteVideo') as HTMLVideoElement;
      if (videoElement) {
        track.attach(videoElement);
        console.log('Video track attached');
      }
    } else if (track.kind === Track.Kind.Audio) {
      const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement;
      if (audioElement) {
        track.attach(audioElement);
        console.log('Audio track attached');
      }
    }
  }, []);

  const handleTrackUnsubscribed = useCallback((
    track: RemoteTrack,
    publication: any,
    participant: RemoteParticipant
  ) => {
    track.detach();
    console.log('Track unsubscribed:', track.kind);
  }, []);

  const handleDisconnected = useCallback(() => {
    setConnectionStatus({ status: 'disconnected', message: 'Disconnected from room' });
    console.log('Disconnected from room');
  }, []);

  const handleDataReceived = useCallback((
    data: Uint8Array,
    participant?: RemoteParticipant
  ) => {
    const decoder = new TextDecoder();
    const message = decoder.decode(data);
    console.log('Data received:', message);
  }, []);

  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    console.log('Participant connected:', participant.identity);
    setConnectionStatus({ status: 'connected', message: 'Aria is ready' });
  }, []);

  const disconnectRoom = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setConnectionStatus({ status: 'disconnected' });
    }
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (roomRef.current) {
      const isEnabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isEnabled);
      return !isEnabled;
    }
    return false;
  }, []);

  const enableMicrophone = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(true);
    }
  }, []);

  const sendData = useCallback(async (payload: object) => {
    if (roomRef.current) {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(payload));
      await roomRef.current.localParticipant.publishData(data, { reliable: true });
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnectRoom();
    };
  }, [disconnectRoom]);

  return {
    room,
    connectionStatus,
    isRemoteSpeaking,
    connectToRoom,
    disconnectRoom,
    toggleMicrophone,
    enableMicrophone,
    sendData,
  };
}
