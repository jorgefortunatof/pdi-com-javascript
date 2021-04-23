const greyscaleItem = document.getElementById("greyscale-item");
const negativeItem = document.getElementById("negative-item");
const thresholdingItem = document.getElementById("thresholding-item");
const noiseReductionItem = document.getElementById("noise-reduction-item");

function itemBox(element) {
	const expandOn = element.querySelector("h1 > span.on");
	const expandOff = element.querySelector("h1 > span.off");
	const box = element.querySelector("div");

	expandOff.style.display = "none";
	box.style.display = "none"

	expandOn.onclick = () => {
		expandOff.style.display = "inline-block";
		expandOn.style.display = "none";
		box.style.display = "block";
	}

	expandOff.onclick = () => {
		expandOff.style.display = "none";
		expandOn.style.display = "inline-block";
		box.style.display = "none";
	}
}

itemBox(greyscaleItem);
itemBox(negativeItem);
itemBox(thresholdingItem);
itemBox(noiseReductionItem);
