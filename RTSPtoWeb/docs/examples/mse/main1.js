document.addEventListener('DOMContentLoaded', function () {
    const mseQueue1 = [], mseQueue2 = []
    let mseSourceBuffer1, mseSourceBuffer2
    let mseStreamingStarted1 = false, mseStreamingStarted2 = false
  
    function startPlay (videoEl, url, mseQueue, mseSourceBuffer, mseStreamingStarted) {
      const mse = new MediaSource()
      videoEl.src = window.URL.createObjectURL(mse)
      mse.addEventListener('sourceopen', function () {
        const ws = new WebSocket(url)
        ws.binaryType = 'arraybuffer'
        ws.onopen = function () {
          console.log('Connected to WebSocket for ' + url)
        }
        ws.onmessage = function (event) {
          const data = new Uint8Array(event.data)
          if (data[0] === 9) {
            let mimeCodec
            const decodedArr = data.slice(1)
            if (window.TextDecoder) {
              mimeCodec = new TextDecoder('utf-8').decode(decodedArr)
            } else {
              mimeCodec = Utf8ArrayToStr(decodedArr)
            }
            mseSourceBuffer = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"')
            mseSourceBuffer.mode = 'segments'
            mseSourceBuffer.addEventListener('updateend', function () {
              pushPacket(mseQueue, mseSourceBuffer, mseStreamingStarted)
            })
          } else {
            readPacket(event.data, mseQueue, mseSourceBuffer, mseStreamingStarted)
          }
        }
      }, false)
    }
  
    function pushPacket (mseQueue, mseSourceBuffer, mseStreamingStarted) {
      let packet
  
      if (!mseSourceBuffer.updating) {
        if (mseQueue.length > 0) {
          packet = mseQueue.shift()
          mseSourceBuffer.appendBuffer(packet)
        } else {
          mseStreamingStarted = false
        }
      }
    }
  
    function readPacket (packet, mseQueue, mseSourceBuffer, mseStreamingStarted) {
      if (!mseStreamingStarted) {
        mseSourceBuffer.appendBuffer(packet)
        mseStreamingStarted = true
        return
      }
      mseQueue.push(packet)
      if (!mseSourceBuffer.updating) {
        pushPacket(mseQueue, mseSourceBuffer, mseStreamingStarted)
      }
    }
  
    // Start stream 1
    const videoEl1 = document.querySelector('#mse-video1')
    const mseUrl1 = document.querySelector('#mse-url1').value
    startPlay(videoEl1, mseUrl1, mseQueue1, mseSourceBuffer1, mseStreamingStarted1)
  
    // Start stream 2
    const videoEl2 = document.querySelector('#mse-video2')
    const mseUrl2 = document.querySelector('#mse-url2').value
    startPlay(videoEl2, mseUrl2, mseQueue2, mseSourceBuffer2, mseStreamingStarted2)
  
    // Fix for stalled video in Safari
    videoEl1.addEventListener('pause', () => {
      if (videoEl1.currentTime > videoEl1.buffered.end(videoEl1.buffered.length - 1)) {
        videoEl1.currentTime = videoEl1.buffered.end(videoEl1.buffered.length - 1) - 0.1
        videoEl1.play()
      }
    })
    videoEl2.addEventListener('pause', () => {
      if (videoEl2.currentTime > videoEl2.buffered.end(videoEl2.buffered.length - 1)) {
        videoEl2.currentTime = videoEl2.buffered.end(videoEl2.buffered.length - 1) - 0.1
        videoEl2.play()
      }
    })
  })
  