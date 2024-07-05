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
const chunks = [];

let stream = null;
onMounted(() => {
  
});
function stop() {
  stream.getTracks().forEach(function(track) {
  track.stop();
});
}
async function getMedia(constraints = {
    audio: true,
    video: true
  }) {
  let frameCounter = 0;
  let config = {
  codec: "vp09.00.10.08",
  width: 640,
  height: 480,
  bitrate: 2_000_000, // 2 Mbps
  framerate: 30,
};
  const encoder = new VideoEncoder({
  output(chunk, metadata) {
    console.log(chunk.timestamp);
    console.log(chunk.byteLength);
    console.log(JSON.stringify(metadata));
    console.log(chunk)
    // const buf = new Uint8Array(chunk.byteLength)
    // chunk.copyTo(buf)
    // chunks.push(chunk)
  },
  error(error) {
    console.log(error);
  },
});
encoder.configure(config);
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const videoProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
    const videoGenerator = new MediaStreamTrackGenerator({ kind: "video" });
    const newStream = new MediaStream([videoGenerator])
    const mediaRecorder = new MediaRecorder(newStream);
    mediaRecorder.onstop = (e) => { 
      const blob = new Blob(chunks, {type: "video/webm"});
      console.log(URL.createObjectURL(blob))
    }
    mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
    mediaRecorder.start()
    const encodeVideo = new TransformStream({
      async transform(videoFrame, controller) {

        
        const encodeOptions = { keyFrame: frameCounter % 30 == 0 };
        encoder.encode(videoFrame, encodeOptions);
        frameCounter++;
        controller.enqueue(videoFrame);
        },
        flush (controller) {
          encoder.flush()
          mediaRecorder.stop()
        }
    });
    const detectFace = new TransformStream({
      start(controller) {
        this.faceDetector = new window.FaceDetector();
        this.canvas = new OffscreenCanvas(640,480);
        this.ctx = this.canvas.getContext('2d');
        console.log(this.faceDetector)
      },
      async transform(videoFrame, controller) {
        const frame = videoFrame.clone()
 
        videoFrame.close()
        this.ctx.drawImage(frame,0,0)
        const faces = await this.faceDetector.detect(this.canvas)
        console.log(faces)
        for (const face of faces) {
          console.log(face);
        }
        controller.enqueue(frame);
        }
    });
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
