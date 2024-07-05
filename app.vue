<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
    <button @click="getMedia()">Get Media</button>
    <button @click="stop()">Stop Media</button>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import {detectFace, encodeVideo} from '~/utils/Transforms'
const chunks = [];
let mediaRecorder;
let stream = null;
onMounted(async () => {
 const devices = await navigator.mediaDevices.enumerateDevices()
 console.log(devices)
});
function stop() {
  stream.getTracks().forEach(function(track) {
  track.stop();
});
mediaRecorder.stop()
}
async function getMedia(constraints = {
    audio: {
      deviceId: {
          exact: 'default'
        }
      },
    video: {
      width: { min: 640, ideal: 1920, max: 1920 },
    height: { min: 400, ideal: 1080 },
    aspectRatio: 1.777777778,
    frameRate: { max: 60 }

    }
  }) {
  
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    const videoProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    const videoGenerator = new MediaStreamTrackGenerator({ kind: "video" });
    const supported = navigator.mediaDevices.getSupportedConstraints();
    console.log(supported)
    const newStream = new MediaStream([videoGenerator, audioTrack])
    mediaRecorder = new MediaRecorder(newStream);
    mediaRecorder.onstop = (e) => { 
      const blob = new Blob(chunks, {type: "video/webm"});
      window.open(URL.createObjectURL(blob), '_blank').focus();
     
    }
    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
    mediaRecorder.start()
   
    // const compressedReadableStream = processor.readable.pipeThrough(
    // new CompressionStream("gzip"),
    // );
    videoProcessor.readable.pipeThrough(detectFace).pipeThrough(encodeVideo).pipeTo(videoGenerator.writable);
    
    return {stream, processor: videoProcessor, generator: videoGenerator, compressedReadableStream};
    /* use the stream */
  } catch (err) {
    /* handle the error */
  }
}

</script>
