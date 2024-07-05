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
onMounted(() => {
  
});
function stop() {
  stream.getTracks().forEach(function(track) {
  track.stop();
});
mediaRecorder.stop()
}
async function getMedia(constraints = {
    audio: true,
    video: true
  }) {
  
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const videoProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    const videoGenerator = new MediaStreamTrackGenerator({ kind: "video" });
    const newStream = new MediaStream([videoGenerator])
    mediaRecorder = new MediaRecorder(newStream);
    mediaRecorder.onstop = (e) => { 
      const blob = new Blob(chunks, {type: "video/webm"});
      console.log(URL.createObjectURL(blob))
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
