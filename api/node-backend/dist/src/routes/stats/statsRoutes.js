"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../../controllers/stats/statsController");
const statsRouter = (0, express_1.Router)();
statsRouter.get('/recognitions', statsController_1.getRecognitionStats);
statsRouter.get('/persons', statsController_1.getPersonStats);
statsRouter.get('/trends', statsController_1.getDetectionTrends);
exports.default = statsRouter;
