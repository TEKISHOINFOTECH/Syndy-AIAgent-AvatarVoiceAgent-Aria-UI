'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from 'livekit-client';
import { ConnectionStatus, LiveKitConfig } from '@/types';

export function useLiveKit() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
  });
  const [room, setRoom] = useState<Room | null>(null);
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

      await newRoom.connect(config.url, config.token);
      
      // Enable microphone
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      
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

  useEffect(() => {
    return () => {
      disconnectRoom();
    };
  }, [disconnectRoom]);

  return {
    room,
    connectionStatus,
    connectToRoom,
    disconnectRoom,
    toggleMicrophone,
  };
}
