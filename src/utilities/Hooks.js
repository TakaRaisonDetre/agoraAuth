import { useEffect, useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import RtcEngine from 'react-native-agora';
import requestCameraAndAudioPermission, { requestAudioPermission } from './Permissions';

export const useRequestCameraAndAudioHook = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Request required permissions from Android

      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }, []);
};

export const useInitializeAgora = () => {
  // Replace yourAppId with the App ID of your Agora project.
  const appId = '6bb4e5cc2ba04652b76ba36a4b7b5ce6';
  const token =
    '0066bb4e5cc2ba04652b76ba36a4b7b5ce6IADgOv2yhgJsfT+Dqazxu2EltiLIFhlktIa344TBC8sFRIcdw1gAAAAAEADr9jhXsnaOYAEAAQCydo5g';
  const  URL = 'http://10.0.2.2:8080'
  //const URL ='http://localhost:3000'

  const [channelName, setChannelName] = useState('synergy-gate');
  const [joinSucceed, setJoinSucceed] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [isMute, setIsMute] = useState(false);
  const [isSpeakerEnable, setIsSpeakerEnable] = useState(true);
  const rtcEngine = useRef(null);

  const initAgora = useCallback(async () => {
    rtcEngine.current = await RtcEngine.create(appId);

   // await rtcEngine.current?.enableAudio();
    // await rtcEngine.current?.muteLocalAudioStream(false);
    // await rtcEngine.current?.setEnableSpeakerphone(true);
    await rtcEngine.current?.enableVideo();

    rtcEngine.current?.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);

      setPeerIds((peerIdsLocal) => {
        // if new user
        if (peerIdsLocal.indexOf(uid) === -1) {
          return [...peerIdsLocal, uid];
        }

        return peerIdsLocal;
      });
    });

    rtcEngine.current?.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      // remove peer Id from state array
      setPeerIds((peerIdsLocal) => {
        return peerIdsLocal.filter((id) => id !== uid);
      });
    });

    // if local user joins RTC channel
    rtcEngine.current?.addListener(
      'JoinChannelSuccess',
      (channel, uid, elapsed) => {
        console.log('JoinChannelSuccess', channel, uid, elapsed);

        setJoinSucceed(true);

        setPeerIds((peerIdsLocal) => {
          return [...peerIdsLocal, uid];
        });
      });

    this._engine.addListener('TokenPrivilegeWillExpire', token => {
      let that = this;
      fetch(URL + '/rtc/' + channelName + '/publisher/uid/' + UID)
        .then(function (response) {
          response.json().then(async function (data) {
            that._engine?.renewToken(data.rtcToken);
          });
        })
        .catch(function (err) {
          console.log('Fetch Error', err);
        });
    });


    rtcEngine.current?.addListener('Error', (error) => {
      console.log('Join does not succeed', error);
    });
  }, []);



  const joinChannel = useCallback(async () => {
       // Join Channel using null token and channel name
   // await rtcEngine.current?.joinChannel(token, channelName, null, 0);
   
   // using fetch the token from server
   fetch(URL + `/access_token?channelName=${channelName}`)
   .then(function(response){
     response.json().then(async function(data){
      await rtcEngine.current?.joinChannel(
        data.token, 
        channelName, 
        null, 
        0
        );
     });
   })
   .catch(function(err){
     console.log('Fetching Rtc Token Error', err)
   })

  

  }, [channelName]);

  const leaveChannel = useCallback(async () => {
    await rtcEngine.current?.leaveChannel();

    setPeerIds([]);
    setJoinSucceed(false);
  }, []);


  const toggleIsMute = useCallback(async () => {
    await rtcEngine.current?.muteLocalAudioStream(!isMute);
    setIsMute(!isMute);
  }, [isMute]);

  const toggleIsSpeakerEnable = useCallback(async () => {
    await rtcEngine.current?.setEnableSpeakerphone(!isSpeakerEnable);
    setIsSpeakerEnable(!isSpeakerEnable);
  }, [isSpeakerEnable]);

  const destroyAgoraEngine = useCallback(async () => {
    await rtcEngine.current?.destroy();
  }, []);

  
  useEffect(() => {
    initAgora();

    return () => {
      destroyAgoraEngine();
    };
  }, [destroyAgoraEngine, initAgora]);

  return {
    channelName,
    isMute,
    isSpeakerEnable,
    joinSucceed,
    peerIds,
    setChannelName,
    joinChannel,
    leaveChannel,
    toggleIsMute,
    toggleIsSpeakerEnable,
  };
};
