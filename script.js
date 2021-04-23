const canvasResult = document.getElementById("frame3");
const ctxResult = canvasResult.getContext('2d');

const canvas1 = document.getElementById("frame1");
const ctx1 = canvas1.getContext('2d');

document.getElementById('grayscale').onclick = grayscale;
document.getElementById('negative').onclick = negative;
document.getElementById('thresholding').onclick = thresholding;
document.getElementById('noise-reduction').onclick = noiseReduction;

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

function median(numbers){
	const { length } = numbers;

	const middleIndex = parseInt(length/2);
	const numbersSorted = numbers.sort((n1, n2) => n1 - n2);

	if(length % 2 === 0){
		const n1 = numbersSorted[middleIndex];
		const n2 = numbersSorted[middleIndex - 1];
		
		return (n1 + n2)/2;
	}else{
		return numbersSorted[middleIndex];
	}
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

function noiseReduction(){
	const elements = document.getElementsByName('noise-reduction-type');
	const useMedian = document.getElementById('noise-reduction-use-median').checked;
	
	let type;
	for(element of elements){
		if(element.checked){
			type = element.value;
		}
	}

	if(!type){
		alert('Selecione um tipo de remoção de ruído!');
		return;
	}

	if(type === "1"){
		noiseReductionX(useMedian);
	}else if (type === "2"){
		noiseReductionCross(useMedian);
	}else{
		noiseReduction3x3(useMedian);
	}
}

function noiseReductionX(useMedian){
	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const { data, width, height } = imageData;

	const w  = width;
	const n = w*4;

	const first = 4 + n;
	const last = data.length - 4 - n;

	if(useMedian){
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let topLeft = i - n - 4;
				let topRight = i - n + 4;
				let bottomLeft  = i + n - 4;
				let bottomRight = i + n + 4;
	
				const medianRed = median([data[i], data[topLeft], data[topRight], data[bottomLeft], data[bottomRight]]);
				const medianGreen = median([data[i + 1], data[topLeft + 1], data[topRight + 1], data[bottomLeft + 1], data[bottomRight + 1]]);
				const medianBlue = median([data[i + 2], data[topLeft + 2], data[topRight + 2], data[bottomLeft + 2], data[bottomRight + 2]]);

				data[i]     = medianRed;     // red
				data[i + 1] = medianGreen;   // green
				data[i + 2] = medianBlue;    // blue
			}
		}

	}else{
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let topLeft = i - n - 4;
				let topRight = i - n + 4;
				let bottomLeft  = i + n - 4;
				let bottomRight = i + n + 4;
	
				const averageRed = (data[i] + data[topLeft] + data[topRight] + data[bottomLeft] + data[bottomRight])/5;
				const averageGreen = (data[i] + data[topLeft + 1] + data[topRight + 1] + data[bottomLeft + 1] + data[bottomRight + 1])/5;
				const averageBlue = (data[i] + data[topLeft + 2] + data[topRight + 2] + data[bottomLeft + 2] + data[bottomRight + 2])/5;
	
				data[i]     = averageRed;     // red
				data[i + 1] = averageGreen;   // green
				data[i + 2] = averageBlue;    // blue
			}
		}

	}

	canvasResult.width = width;
	canvasResult.height = height;
	
	ctxResult.putImageData(imageData, 0, 0);
}

function noiseReductionCross(useMedian){
	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const { data, width, height } = imageData;

	const w  = width;
	const n = w*4;

	const first = 4 + n;
	const last = data.length - 4 - n;

	if(useMedian){
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let top = i - n;
				let bottom = i + n;
				let left  = i - 4;
				let right = i + 4;
	
				const medianRed = median([data[i], data[top], data[bottom], data[left], data[right]]);
				const medianGreen = median([data[i + 1], data[top + 1], data[bottom + 1], data[left + 1], data[right + 1]]);
				const medianBlue = median([data[i + 2], data[top + 2], data[bottom + 2], data[left + 2], data[right + 2]]);

				data[i]     = medianRed;     // red
				data[i + 1] = medianGreen;   // green
				data[i + 2] = medianBlue;    // blue
			}
		}

	}else{
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let top = i - n;
				let bottom = i + n;
				let left  = i - 4;
				let right = i + 4;
	
				const averageRed = (data[i] + data[top] + data[bottom] + data[left] + data[right])/5;
				const averageGreen = (data[i] + data[top + 1] + data[bottom + 1] + data[left + 1] + data[right + 1])/5;
				const averageBlue = (data[i] + data[top + 2] + data[bottom + 2] + data[left + 2] + data[right + 2])/5;
	
				data[i]     = averageRed;     // red
				data[i + 1] = averageGreen;   // green
				data[i + 2] = averageBlue;    // blue
			}
		}
	}

	canvasResult.width = width;
	canvasResult.height = height;
	
	ctxResult.putImageData(imageData, 0, 0);
}

function noiseReduction3x3(useMedian){
	const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
	const { data, width, height } = imageData;

	const w  = width;
	const n = w*4;

	const first = 4 + n;
	const last = data.length - 4 - n;

	if(useMedian){
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let top = i - n;
				let bottom = i + n;
				let left  = i - 4;
				let right = i + 4;
				let topLeft = i - n - 4;
				let topRight = i - n + 4;
				let bottomLeft  = i + n - 4;
				let bottomRight = i + n + 4;
	
				const medianRed = median([
					data[i], data[top], data[bottom], data[left], data[right], 
					data[topLeft], data[topRight], data[bottomLeft], data[bottomRight]
				]);
				const medianGreen = median([
					data[i + 1], data[top + 1], data[bottom + 1], data[left + 1], data[right + 1],
					data[topLeft + 1], data[topRight + 1], data[bottomLeft + 1], data[bottomRight + 1]
				]);
				const medianBlue = median([
					data[i + 2], data[top + 2], data[bottom + 2], data[left + 2], data[right + 2],
					data[topLeft + 2], data[topRight + 2], data[bottomLeft + 2], data[bottomRight + 2]
				]);

				data[i]     = medianRed;     // red
				data[i + 1] = medianGreen;   // green
				data[i + 2] = medianBlue;    // blue
			}
		}

	}else{
		for (let i = first; i < last; i += 4) {
			if(!(i % n == 0 || i % n == n - 4)){
				let top = i - n;
				let bottom = i + n;
				let left  = i - 4;
				let right = i + 4;
				let topLeft = i - n - 4;
				let topRight = i - n + 4;
				let bottomLeft  = i + n - 4;
				let bottomRight = i + n + 4;
	
				const averageRed = (
					data[i] + data[top] + data[bottom] + data[left] + data[right]
					+	data[topLeft] + data[topRight] + data[bottomLeft] + data[bottomRight]
					)/9;

				const averageGreen = (
					data[i + 1] + data[top + 1] + data[bottom + 1] + data[left + 1] + data[right + 1]
					+	data[topLeft + 1] + data[topRight + 1] + data[bottomLeft + 1] + data[bottomRight + 1]
					)/9;

				const averageBlue = (
					data[i + 2] + data[top + 2] + data[bottom + 2] + data[left + 2] + data[right + 2]
					+	data[topLeft + 2] + data[topRight + 2] + data[bottomLeft + 2] + data[bottomRight + 2]
					)/9;
	
				data[i]     = averageRed;     // red
				data[i + 1] = averageGreen;   // green
				data[i + 2] = averageBlue;    // blue
			}
		}
	}

	canvasResult.width = width;
	canvasResult.height = height;
	
	ctxResult.putImageData(imageData, 0, 0);
}
