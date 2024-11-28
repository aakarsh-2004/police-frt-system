"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRTSPStream = startRTSPStream;
const node_rtsp_stream_1 = __importDefault(require("node-rtsp-stream"));
function startRTSPStream(rtspUrl, wsPort) {
    const stream = new node_rtsp_stream_1.default({
        name: 'camera1',
        streamUrl: rtspUrl,
        wsPort: wsPort,
        ffmpegOptions: {
            '-stats': '',
            '-r': 30,
            '-s': '640x480'
        }
    });
    // Handle WebSocket connections
    stream.on('connection', (socket) => {
        console.log('New WebSocket connection');
        socket.on('close', () => {
            console.log('Client disconnected');
        });
        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    return stream;
}
