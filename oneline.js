/*
    CSCI 2408 Computer Graphics Fall 2023 
    (c)2023 by Hajar Naghiyeva 
    Submitted in partial fulfillment of the requirements of the course.
*/

// I am using Araz Yusubov's code parts for some snippets of my code


var canvas;
var context;
var img;

window.onload = init;

// Initialization function for the canvas, image, and event listeners
function init() {
    // Getting reference to the 2D context of the canvas
    fileInput = document.getElementById("file-open");
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");  // 2D rendering context for drawing on the canvas
    
    // Event listener for file input to load and display the image
    fileInput.addEventListener("change", function (e) {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                img = new Image();
                img.src = event.target.result;

                img.onload = function () {
                    // Resizing canvas to match the image size
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Drawing the image on the canvas
                    context.drawImage(img, 0, 0);
                };

                img.onerror = function () {
                    console.error("Error loading the image.");
                };
            };

            reader.readAsDataURL(file);

            reader.onerror = function () {
                console.error("Error reading the file.");
            };
        }
    });
    
    // Event listeners for processing buttons
    document.getElementById("gray-button").addEventListener("click", function() {
        if (img) {
            convertToGrayscale();
        } else {
            alert("Please select an image first.");
        }
    });

    document.getElementById("reduced-res-grayscale").addEventListener("click", function() {
        if (img) {
            grayscaleReducedResolution();
        } else {
            alert("Please select an image first.");
        }
    });

    document.getElementById("proc-button").addEventListener("click", function() {
        if (img) {
            drawRectangularSpiral();
        } else {
            alert("Please select an image first.");
        }
    });

    // Downloading processed image
    // https://www.youtube.com/watch?v=sA07GElhqzg
    document.getElementById("download").addEventListener("click", function() {
        let downloadLink = document.getElementById("downloadLink");
        downloadLink.href = canvas.toDataURL("image/png");
        downloadLink.click();
    });
    
    // Event listeners to redraw the image whenever a user changes a parameter
    document.getElementById("lineColor").addEventListener("change", drawRectangularSpiral);
    document.getElementById("backgroundColor").addEventListener("change", drawRectangularSpiral);
    document.getElementById("cellSize").addEventListener("change", drawRectangularSpiral);
}

// Converting the displayed image to grayscale
// https://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
// https://www.tutorialspoint.com/dip/grayscale_to_rgb_conversion.htm

function convertToGrayscale() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
            data[index] = gray;
            data[index + 1] = gray;
            data[index + 2] = gray;
        }
    }

    context.putImageData(imageData, 0, 0);
}


// Converting the displayed image to grayscale with a reduced resolution effect
 function grayscaleReducedResolution() {
    // Getting image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;


    // The idea behind reduced resolution is to average out pixel colors in small blocks (cells)
    // Grayscale conversion and reduced resolution process
    const cellSize = 5;
    for (let y = 0; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            
            // Initializing the averages
            let totalRed = 0;
            let totalGreen = 0;
            let totalBlue = 0;
            
            // Initializing counter for pixel
            let count = 0;
            
            // Looping through each pixel in the cell
            for (let i = 0; i < cellSize; i++) {
                for (let j = 0; j < cellSize; j++) {
                    const posX = x + i;
                    const posY = y + j;
                    if (posX < canvas.width && posY < canvas.height) {
                        const index = (posY * canvas.width + posX) * 4;
                        totalRed += data[index];
                        totalGreen += data[index + 1];
                        totalBlue += data[index + 2];
                        count++;
                    }
                }
            }
            
            // Calculating the averages of the colors 
            const averageRed = totalRed / count;
            const averageGreen = totalGreen / count;
            const averageBlue = totalBlue / count;
            
            // Calculating grayscale value
            // https://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
    				// https://www.tutorialspoint.com/dip/grayscale_to_rgb_conversion.htm
            const gray = 0.299 * averageRed + 0.587 * averageGreen + 0.114 * averageBlue;
            
            // Setting each pixel in the cell to the average color
            for (let i = 0; i < cellSize; i++) {
                for (let j = 0; j < cellSize; j++) {
                    const posX = x + i;
                    const posY = y + j;
                    if (posX < canvas.width && posY < canvas.height) {
                        const index = (posY * canvas.width + posX) * 4;
                        data[index] = gray;
                        data[index + 1] = gray;
                        data[index + 2] = gray;
                    }
                }
            }
        }
    }
    // Returning processed image back to the canvas
    context.putImageData(imageData, 0, 0);
}

// Applying a rectangular spiral pattern based on grayscale values. Note: the current logic does not draw a spiral. It draws only vertical lines.
function drawRectangularSpiral() {
    // Fetching image data from the canvas to access pixel information
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Fetching the user-defined parameters from the interface
    const lineColor = document.getElementById("lineColor").value;
    const backgroundColor = document.getElementById("backgroundColor").value;
    const cellSize = parseInt(document.getElementById("cellSize").value);

    // Converting HEX color values to RGB
    const lineRGB = hexToRgb(lineColor);
    const backgroundRGB = hexToRgb(backgroundColor);

    // Looping over canvas height and width based on the specified cell size
    for (let y = 0; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            let totalRed = 0;
            let totalGreen = 0;
            let totalBlue = 0;
            let count = 0;

            // Looping within each cell to calculate the average color values
            for (let i = 0; i < cellSize; i++) {
                for (let j = 0; j < cellSize; j++) {
                    const posX = x + i;
                    const posY = y + j;
                    if (posX < canvas.width && posY < canvas.height) {
                        const index = (posY * canvas.width + posX) * 4;
                        totalRed += data[index];
                        totalGreen += data[index + 1];
                        totalBlue += data[index + 2];
                        count++;
                    }
                }
            }



            // Calculating average colors within the cell
            const averageRed = totalRed / count;
            const averageGreen = totalGreen / count;
            const averageBlue = totalBlue / count;

            // Converting the average color to grayscale
            const gray = 0.299 * averageRed + 0.587 * averageGreen + 0.114 * averageBlue;

            // Deciding how many pixels to color based on the grayscale value (darkness)
            // If the grayscale value is below 85 (out of 255), color 25 pixels.
						// If the grayscale value is between 85 and 170, color 15 pixels.
						// If the grayscale value is above 170, color only 5 pixels.
               
            let numPixelsToColor = gray < 85 ? 25 : (gray < 170 ? 15 : 5);
            let pixelCounter = 0;

            // Filling the cell with colors based on grayscale intensity
            for (let i = 0; i < cellSize; i++) {
                for (let j = 0; j < cellSize; j++) {
                    const posX = x + i;
                    const posY = y + j;
                    if (posX < canvas.width && posY < canvas.height) {
                        const index = (posY * canvas.width + posX) * 4;
                        if (pixelCounter < numPixelsToColor) {
                            data[index] = lineRGB.r;     
                            data[index + 1] = lineRGB.g;
                            data[index + 2] = lineRGB.b;
                            pixelCounter++;
                        } else {
                            data[index] = backgroundRGB.r;
                            data[index + 1] = backgroundRGB.g;
                            data[index + 2] = backgroundRGB.b;
                        }
                    }
                }
            }
        }
    }
    
    // Putting modified image data back onto the canvas
    context.putImageData(imageData, 0, 0);
}

// Utility function to convert HEX colors to RGB
// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb 
function hexToRgb(hex) {
    let bigint = parseInt(hex.substring(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return { r, g, b };
}


// References:
