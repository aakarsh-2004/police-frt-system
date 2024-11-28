"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRTSPToHLS = convertRTSPToHLS;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
function convertRTSPToHLS(rtspUrl, outputPath) {
    const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-i', rtspUrl,
        '-fflags', 'nobuffer',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-hls_time', '2',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        path_1.default.join(outputPath, 'stream.m3u8')
    ]);
    ffmpeg.stderr.on('data', (data) => {
        console.log(`ffmpeg: ${data}`);
    });
    return ffmpeg;
}
