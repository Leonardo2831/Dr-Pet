function extractImageBuffer(imgData) {
    if (!imgData) return null;
    if (Buffer.isBuffer(imgData)) return imgData;
    if (typeof imgData === 'object' && imgData.buffer && Buffer.isBuffer(imgData.buffer)) {
        return imgData.buffer;
    }
    return null;
}

module.exports = extractImageBuffer;