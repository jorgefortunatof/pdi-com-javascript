const canvasResult = document.getElementById("frame3");
const ctxResult = canvasResult.getContext('2d');

const canvas1 = document.getElementById("frame1");
const ctx1 = canvas1.getContext('2d');

document.getElementById('grayscale').onclick = grayscale;
document.getElementById('negative').onclick = negative;
document.getElementById('thresholding').onclick = thresholding;

document.getElementById('thresholding-level').oninput = updateThresholdingLevelSpan;
document.getElementById('image1').onchange = onUpdateImage;

canvas1.onmousemove = mousePicker;
canvasResult.onmousemove = mousePicker;


/* UTILS */
function onUpdateImage(event){
	const file = event.target.files[0];
	const url = URL.createObjectURL(file);

	drawImage(url);
}

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
		canvas1.width = image.width;
		canvas1.height = image.height;

		ctx1.drawImage(image, 0, 0, image.width, image.height);
	}
	
	image.src = url;	
}

function updateThresholdingLevelSpan(event){
	document.getElementById('thresholding-level-span').innerText = event.target.value
}


/* PDI */
function mousePicker(event){
	const x = event.layerX;
  const y = event.layerY;

	const pixel = event.target.getContext('2d').getImageData(x, y, 1, 1);
	const data = pixel.data;

	const pixelR = data[0]
	const pixelG = data[1]
	const pixelB = data[2]
	const pixelOpacity = data[3] / 255

	setPickerRGB(pixelR, pixelG, pixelB, pixelOpacity)
}

function grayscale(){
	const isWeightedAverage = document.getElementById('grayscale-type').checked;

	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const data = imageData.data;

	if(isWeightedAverage){
		const redPercent = Number(document.getElementById('r%').value);
		const greenPercent = Number(document.getElementById('g%').value);
		const bluePercent = Number(document.getElementById('b%').value);

		if(redPercent + greenPercent + bluePercent !== 100){
			alert('A soma das porcentagens deve ser igual à 100!');
			return;
		}

		for (let i = 0; i < data.length; i += 4) {
				let avg = ((data[i] * redPercent) + (data[i + 1] * greenPercent) + (data[i + 2] * bluePercent)) 
				/ (redPercent + greenPercent + bluePercent);

				data[i]     = avg; // red
				data[i + 1] = avg; // green
				data[i + 2] = avg; // blue
		}
	}else{
		for (let i = 0; i < data.length; i += 4) {
				let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
				data[i]     = avg; // red
				data[i + 1] = avg; // green
				data[i + 2] = avg; // blue
		}
	}

	canvasResult.width = canvas1.width;
	canvasResult.height = canvas1.height;
	ctxResult.putImageData(imageData, 0, 0);
}

function negative(){
	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		data[i]     = 255 - data[i];     // red
		data[i + 1] = 255 - data[i + 1]; // green
		data[i + 2] = 255 - data[i + 2]; // blue
	}

	canvasResult.width = canvas1.width;
	canvasResult.height = canvas1.height;
	ctxResult.putImageData(imageData, 0, 0);
}

function thresholding(){
	const thresholdingLevel = document.getElementById('thresholding-level').value;
	const useGrayscale = document.getElementById('thresholding-use-grayscale').checked;

	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const data = imageData.data;

	if(useGrayscale){
		for (let i = 0; i < data.length; i += 4) {
			const averageColor = (data[i] + data[i + 1] + data[i + 2])/3;

			data[i]     = averageColor > thresholdingLevel ? 255 : 0;    // red
			data[i + 1] = averageColor > thresholdingLevel ? 255 : 0;    // green
			data[i + 2] = averageColor > thresholdingLevel ? 255 : 0;    // blue
		}

	}else{
		for (let i = 0; i < data.length; i += 4) {
			data[i]     = data[i] > thresholdingLevel ? 255 : 0;        // red
			data[i + 1] = data[i + 1] > thresholdingLevel ? 255 : 0;    // green
			data[i + 2] = data[i + 2] > thresholdingLevel ? 255 : 0;    // blue
		}
	}

	canvasResult.width = canvas1.width;
	canvasResult.height = canvas1.height;
	ctxResult.putImageData(imageData, 0, 0);
}