<template>
  <div>
    <NuxtRouteAnnouncer />
    <video id="preview-video" 
    class="video video-js vjs-default-skin vjs-controls-enabled"
    preload="auto"
    width="1920"
    height="1080"
    poster="/hacker.svg"
    ></video>
    <br/>
    <button @click="getMedia()" v-if="!isRecording">Get Media</button>
    <button @click="stop()" v-else>Stop Media</button>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import {detectFace, encodeVideo} from '~/utils/Transforms'
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/sea/index.css';
const chunks = [];
let mediaRecorder;

const isRecording = useState('isRecording', () => false)

let stream = null;
//const worker = new Worker('worker.js');
onMounted(async () => {
 // const ctx = document.getElementById('preview-canvas').getContext("bitmaprenderer");
  const devices = await navigator.mediaDevices.enumerateDevices()
  
  // worker.onmessage = (e) => {
  //   ctx.transferFromImageBitmap(e.data.bitmap);
  // }
});
function stop() {
  stream.getTracks().forEach(function(track) {
    track.stop();
  });
  mediaRecorder.stop()
    isRecording.value = !isRecording.value;
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
    isRecording.value = !isRecording.value;
    const newStream = new MediaStream([videoGenerator, audioTrack])
   
    const video = videojs('preview-video', {
        autoplay: true,
        controls: true,
        liveUi: true
        
      });
      var vid = video.tech().el();
      vid.srcObject = newStream;
   
    mediaRecorder = new MediaRecorder(newStream);
    mediaRecorder.onstop = (e) => { 
      const blob = new Blob(chunks, {type: "video/webm"});
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
