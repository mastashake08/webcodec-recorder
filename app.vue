<template>
  <div>
    <NuxtRouteAnnouncer />
    <video id="preview-video" 
    class="video video-js vjs-default-skin vjs-controls-enabled vjs-has-started vjs-paused vjs-user-inactive"  preload="auto"
    poster="/hacker.svg"
    ></video>
    
    <div class="vjs-playlist"></div>
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
import * as playlist from 'videojs-playlist';
import * as playlistUi from 'videojs-playlist-ui';
import 'videojs-playlist-ui/dist/videojs-playlist-ui.css'
let video;
let vid;
const isRecording = useState('isRecording', () => false)

let stream = null;
//const worker = new Worker('worker.js');
onMounted(async () => {
  video = videojs('preview-video', {
        autoplay: true,
        controls: true,
        liveUi: true
        
      });
    vid = video.tech().el();
    const devices = await navigator.mediaDevices.enumerateDevices()
  
  // worker.onmessage = (e) => {
  //   ctx.transferFromImageBitmap(e.data.bitmap);
  // }
});
function stop() {
  stream.getTracks().forEach(function(track) {
    track.stop();
  });

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
   
    
      
      vid.srcObject = newStream;
   
      video.playlist(video.sources)
      video.playlistUi()
   
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
