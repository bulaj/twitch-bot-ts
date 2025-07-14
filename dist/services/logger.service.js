"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// Prosty logger dla lepszego śledzenia co się dzieje
exports.logger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
};
