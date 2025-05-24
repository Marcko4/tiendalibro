const fs = require('fs');
const path = require('path');

exports.imageToBase64 = (imagePath) => {
    try {
        const imageBuffer = fs.readFileSync(path.join(__dirname, '..', imagePath));
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error al convertir imagen:', error);
        return null;
    }
};
