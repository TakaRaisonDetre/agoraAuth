import React, {Component} from 'react'
import {SafeAreaView, Platform, ScrollView, Text, TextInput,TouchableOpacity, View} from 'react-native'
import RtcEngine, {RtcLocalView, RtcRemoteView, VideoRenderMode} from 'react-native-agora'
import { useInitializeAgora, useRequestCameraAndAudioHook } from './src/utilities/Hooks';
import Button from './src/components/Button';


import {Dimensions, StyleSheet} from 'react-native'

const App= () => {
  
  useRequestCameraAndAudioHook();
  const {
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
  } = useInitializeAgora()


  return (
    <View style={styles.max}>
    <View style={styles.max}>
        <View style={styles.buttonHolder}>
            <TouchableOpacity
                onPress={joinChannel}
                style={styles.button}>
                <Text style={styles.buttonText}> Start Call </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={leaveChannel}
                style={styles.button}>
                <Text style={styles.buttonText}> End Call </Text>
            </TouchableOpacity>
        </View>
       {/* <_renderVideos/> */}
       {
          joinSucceed ? (
            <View style={styles.fullView}>
                <RtcLocalView.SurfaceView
                    style={styles.max}
                    channelId={channelName}
                    renderMode={VideoRenderMode.Hidden}/>
      
                    <ScrollView
                      style={styles.remoteContainer}
                      contentContainerStyle={{paddingHorizontal: 2.5}}
                      horizontal={true}>
                      {peerIds.map((value, index, array) => {
                          return (
                              <RtcRemoteView.SurfaceView
                                  style={styles.remote}
                                  uid={value}
                                  channelId={channelName}
                                  renderMode={VideoRenderMode.Hidden}
                                  zOrderMediaOverlay={true}/>
                          )
                      })}
                  </ScrollView>
                  
            </View>
        ) : null
       }
    </View>
</View>
  )
};


const dimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
}

const styles = StyleSheet.create({
  max: {
      flex: 1,
  },
  buttonHolder: {
      height: 100,
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
  },
  button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#0093E9',
      borderRadius: 25,
  },
  buttonText: {
      color: '#fff',
  },
  fullView: {
      width: dimensions.width,
      height: dimensions.height - 100,
  },
  remoteContainer: {
      width: '100%',
      height: 150,
      position: 'absolute',
      top: 5
  },
  remote: {
      width: 150,
      height: 150,
      marginHorizontal: 2.5
  },
  noUserText: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: '#0093E9',
  },
})

export default App;
