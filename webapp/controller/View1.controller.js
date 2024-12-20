sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("compressimages.controller.View1", {
        onInit() {
        },
        onImageUpload: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files"); // Get files from the change event
        
            if (aFiles && aFiles.length > 0) {
                var oFile = aFiles[0]; // Only one file is supported by FileUploader
                var oReader = new FileReader();
        
                oReader.onload = function (e) {
                    var sDataUrl = e.target.result;
        
                    // Create an Image object
                    var oImage = new Image();
                    oImage.src = sDataUrl;
        
                    oImage.onload = function () {
                        var oCanvas = document.createElement("canvas");
                        var iMaxWidth = 800; // Max width for compression
                        var iMaxHeight = 600; // Max height for compression
                        var iWidth = oImage.width;
                        var iHeight = oImage.height;
        
                        // Calculate new dimensions
                        if (iWidth > iMaxWidth || iHeight > iMaxHeight) {
                            if (iWidth / iHeight > iMaxWidth / iMaxHeight) {
                                iHeight = (iMaxWidth / iWidth) * iHeight;
                                iWidth = iMaxWidth;
                            } else {
                                iWidth = (iMaxHeight / iHeight) * iWidth;
                                iHeight = iMaxHeight;
                            }
                        }
        
                        oCanvas.width = iWidth;
                        oCanvas.height = iHeight;
        
                        var oCtx = oCanvas.getContext("2d");
                        oCtx.drawImage(oImage, 0, 0, iWidth, iHeight);
        
                        // Compress the image
                        var sCompressedDataUrl = oCanvas.toDataURL("image/jpeg", 0.7); // 70% quality
        
                        // Display success message
                        sap.m.MessageToast.show("Image compressed successfully!");
        
                        // Example: Send compressed image to backend
                        var oBlob = this.dataURLToBlob(sCompressedDataUrl);
                        this.uploadCompressedImage(oBlob);
                    }.bind(this);
                }.bind(this);
        
                oReader.readAsDataURL(oFile);
            }
        },
        
        dataURLToBlob: function (dataURL) {
            var arr = dataURL.split(',');
            var mime = arr[0].match(/:(.*?);/)[1];
            var bstr = atob(arr[1]);
            var n = bstr.length;
            var u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        },
        
        uploadCompressedImage: function (oBlob) {
            var sUrl = ""; // Replace with your backend endpoint URL
        
            // Create FormData object to hold the Blob
            var oFormData = new FormData();
            oFormData.append("file", oBlob, "compressed_image.jpg"); // Set the file name as needed
        
            // Perform the AJAX request
            fetch(sUrl, {
                method: "POST",
                body: oFormData,
                headers: {
                    "Accept": "application/json" // Add additional headers if needed
                }
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Upload failed: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                sap.m.MessageToast.show("Image uploaded successfully!");
                console.log("Server Response:", data);
            })
            .catch((error) => {
                sap.m.MessageToast.show("Image upload failed: " + error.message);
                console.error("Upload Error:", error);
            });
        }
        
        

    });
});