<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
    <button @click="getMedia()">Get Media</button>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
const chunks = [];
onMounted(() => {
  
});

async function getMedia(constraints = {
    audio: true,
    video: true
  }) {
  let stream = null;
  let frameCounter = 0;
  let config = {
  codec: "av01.1.19H.08.0.000.09.16.09.1",
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
    chunks.push(chunk)
    console.log(chunks)
  },
  error(error) {
    console.log(error);
  },
});
encoder.configure(config);
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTrack = stream.getVideoTracks()[0];
    const processor = new MediaStreamTrackProcessor({ track: videoTrack });
    const generator = new MediaStreamTrackGenerator({ kind: "video" });
    const transformer = new TransformStream({
    async transform(videoFrame, controller) {

      
      const encodeOptions = { keyFrame: frameCounter % 30 == 0 };
      encoder.encode(videoFrame, encodeOptions);
      frameCounter++;
      controller.enqueue(videoFrame);
      },
    });
    // const compressedReadableStream = processor.readable.pipeThrough(
    // new CompressionStream("gzip"),
    // );
    processor.readable.pipeThrough(transformer).pipeTo(generator.writable);
    
    return {stream, processor, generator, compressedReadableStream};
    /* use the stream */
  } catch (err) {
    /* handle the error */
  }
}

</script>
