let currentConfig = {
        width: 363,
        height: 637,
        topLeft: { lat: 40.7589, lng: -73.9851 },
        topRight: { lat: 40.7589, lng: -73.9841 },
        bottomLeft: { lat: 40.7579, lng: -73.9851 },
        bottomRight: { lat: 40.7579, lng: -73.9841 },
      };

      function updateImageDimensions() {
        const aerialImage = document.getElementById("aerialImage");
        aerialImage.style.width = currentConfig.width + "px";
        aerialImage.style.height = currentConfig.height + "px";
      }

      function createReferencePoints() {
        const aerialImage = document.getElementById("aerialImage");

        // Clear existing points
        const existingPoints = aerialImage.querySelectorAll(".reference-point");
        existingPoints.forEach((point) => point.remove());

        const points = [
          {
            position: "0% 0%",
            label: `TL: ${currentConfig.topLeft.lat}°, ${currentConfig.topLeft.lng}°`,
            corner: "topLeft",
          },
          {
            position: "100% 0%",
            label: `TR: ${currentConfig.topRight.lat}°, ${currentConfig.topRight.lng}°`,
            corner: "topRight",
          },
          {
            position: "0% 100%",
            label: `BL: ${currentConfig.bottomLeft.lat}°, ${currentConfig.bottomLeft.lng}°`,
            corner: "bottomLeft",
          },
          {
            position: "100% 100%",
            label: `BR: ${currentConfig.bottomRight.lat}°, ${currentConfig.bottomRight.lng}°`,
            corner: "bottomRight",
          },
        ];

        points.forEach((point) => {
          const referencePoint = document.createElement("div");
          referencePoint.className = "reference-point";
          referencePoint.style.left = point.position.split(" ")[0];
          referencePoint.style.top = point.position.split(" ")[1];

          const label = document.createElement("div");
          label.className = "point-label";
          label.textContent = point.label;
          referencePoint.appendChild(label);

          aerialImage.appendChild(referencePoint);
        });
      }

      function calculateScaleFactors() {
        const latDiff =
          currentConfig.topLeft.lat - currentConfig.bottomLeft.lat;
        const lngDiff = currentConfig.topRight.lng - currentConfig.topLeft.lng;

        const latPerPixel = latDiff / currentConfig.height;
        const lngPerPixel = lngDiff / currentConfig.width;

        document.getElementById("scaleFactors").innerHTML = `
Coordinate Differences:<br>
Latitude span: ${latDiff.toFixed(6)}°<br>
Longitude span: ${lngDiff.toFixed(6)}°<br><br>
Scale Factors:<br>
Lat per pixel: ${latPerPixel.toFixed(8)}° per px<br>
Lng per pixel: ${lngPerPixel.toFixed(8)}° per px
            `;

        return { latPerPixel, lngPerPixel };
      }

      function transformPixelToCoordinates(x, y) {
        const { latPerPixel, lngPerPixel } = calculateScaleFactors();

        // Use top-left as reference point
        const lat = currentConfig.topLeft.lat - y * latPerPixel;
        const lng = currentConfig.topLeft.lng + x * lngPerPixel;

        return { lat, lng };
      }

      function updateTransformation() {
        // Get values from inputs
        currentConfig.width = parseInt(
          document.getElementById("imageWidth").value
        );
        currentConfig.height = parseInt(
          document.getElementById("imageHeight").value
        );

        currentConfig.topLeft.lat = parseFloat(
          document.getElementById("topLeftLat").value
        );
        currentConfig.topLeft.lng = parseFloat(
          document.getElementById("topLeftLng").value
        );
        currentConfig.topRight.lat = parseFloat(
          document.getElementById("topRightLat").value
        );
        currentConfig.topRight.lng = parseFloat(
          document.getElementById("topRightLng").value
        );
        currentConfig.bottomLeft.lat = parseFloat(
          document.getElementById("bottomLeftLat").value
        );
        currentConfig.bottomLeft.lng = parseFloat(
          document.getElementById("bottomLeftLng").value
        );
        currentConfig.bottomRight.lat = parseFloat(
          document.getElementById("bottomRightLat").value
        );
        currentConfig.bottomRight.lng = parseFloat(
          document.getElementById("bottomRightLng").value
        );

        // Update display
        updateImageDimensions();
        createReferencePoints();
        calculateScaleFactors();

        // Clear previous click point
        const existingClickPoint = document.querySelector(".click-point");
        if (existingClickPoint) {
          existingClickPoint.remove();
        }

        // Reset result panel
        document.getElementById("coordinates").textContent =
          "Configuration updated! Click to calculate.";
        document.getElementById("pixelInfo").textContent =
          "Ready for new calculation";
        document.getElementById("transformationFormula").textContent =
          "Click on image to see transformation...";
      }

      // Event listener for image clicks
      document
        .getElementById("aerialImage")
        .addEventListener("click", function (e) {
          // Remove existing click point
          const existingPoint = document.querySelector(".click-point");
          if (existingPoint) {
            existingPoint.remove();
          }

          // Get click position relative to image
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // Create visual indicator
          const clickPoint = document.createElement("div");
          clickPoint.className = "click-point";
          clickPoint.style.left = x + "px";
          clickPoint.style.top = y + "px";
          this.appendChild(clickPoint);

          // Calculate coordinates
          const { lat, lng } = transformPixelToCoordinates(x, y);
          const { latPerPixel, lngPerPixel } = calculateScaleFactors();

          // Update displays
          document.getElementById("coordinates").innerHTML = `
                <strong>${lat.toFixed(6)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(
            lng
          ).toFixed(6)}°${lng >= 0 ? "E" : "W"}</strong>
            `;

          document.getElementById("pixelInfo").textContent = `
                Pixel: (${Math.round(x)}, ${Math.round(y)}) | Image: ${
            currentConfig.width
          }×${currentConfig.height}px
            `;

          document.getElementById("transformationFormula").innerHTML = `
Target pixel: (${Math.round(x)}, ${Math.round(y)})<br>
Latitude = ${currentConfig.topLeft.lat} - (${Math.round(
            y
          )} × ${latPerPixel.toFixed(8)})<br>
         = ${lat.toFixed(6)}°<br>
Longitude = ${currentConfig.topLeft.lng} + (${Math.round(
            x
          )} × ${lngPerPixel.toFixed(8)})<br>
          = ${lng.toFixed(6)}°
            `;
        });

      // Initialize the tool
      updateTransformation();