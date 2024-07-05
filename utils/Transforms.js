
const encodeVideo = new TransformStream({
    start(controller) {
        this.frameCounter = 0;
        this.config = {
            codec: "vp09.00.10.08",
            width: 640,
            height: 480,
            bitrate: 2_000_000, // 2 Mbps
            framerate: 30,
        };
        this.encoder = new VideoEncoder({
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
        this.encoder.configure(this.config);
    },
    async transform(videoFrame, controller) {
        const frame = new VideoFrame(videoFrame)
        videoFrame.close();
      const encodeOptions = { keyFrame: this.frameCounter % 30 == 0 };
      this.encoder.encode(frame, encodeOptions);
      this.frameCounter++;
      controller.enqueue(frame);

      },
      flush (controller) {
        this.encoder.flush()
        
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
      for (const face of faces) {
        this.ctx.beginPath(); // Start a new path
        this.ctx.rect(face.boundingBox.x, face.boundingBox.y, face.boundingBox.width, face.boundingBox.height); // Add a rectangle to the current path
        this.ctx.stroke(); // Render the path

      }
      const vid = new VideoFrame(this.canvas, {timestamp: frame.timestamp})
      controller.enqueue(vid);
      frame.close()
      }
  });

  export {
    detectFace,
    encodeVideo
  }