const sizeOf = require("image-size");

export default function getImageSizeInPx(src) {
	return sizeOf(src);
}
