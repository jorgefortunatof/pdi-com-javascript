const canvas = document.getElementById("frame");
const ctx = canvas.getContext('2d');

window.onload = () => {
	document.getElementById('grayscale').onclick = grayscale;
	document.getElementById('image').onchange = onUpdateImage;

	canvas.onmousemove = mousePicker;
}

function mousePicker(event){
	const x = event.layerX;
  const y = event.layerY;

	const pixel = ctx.getImageData(x, y, 1, 1);
	const data = pixel.data;

	const pixelR = data[0]
	const pixelG = data[1]
	const pixelB = data[2]
	const pixelOpacity = data[3] / 255

	setPickerRGB(pixelR, pixelG, pixelB, pixelOpacity)
}

function onUpdateImage(event){
	const file = event.target.files[0];
	const url = URL.createObjectURL(file);

	drawImage(url);
}


/* UTILS */
function setPickerRGB(r, g, b, opacity){
	const currentColor = document.getElementById('rgb-color-picker');
	const spanR = document.getElementById("r").querySelector('span');
	const spanG = document.getElementById("g").querySelector('span');
	const spanB = document.getElementById("b").querySelector('span');

	spanR.innerText = r;
	spanG.innerText = g;
	spanB.innerText = b;

	const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
	currentColor.style.backgroundColor = rgba;
}

function drawImage(url) {
	let image = new Image();

	image.onload = () => {
		canvas.width = image.width;
		canvas.height = image.height;

		ctx.drawImage(image, 0, 0, image.width, image.height);
	}
	
	image.src = url;	
}


/* PDI */
function grayscale(){
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
			var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
			data[i]     = avg; // red
			data[i + 1] = avg; // green
			data[i + 2] = avg; // blue
	}
	
	ctx.putImageData(imageData, 0, 0);
}