function addMarker(x, y) {
    let marker = document.createElement("div");
    marker.style.position = "absolute";
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.style.width = "10px";
    marker.style.height = "10px";
    marker.style.backgroundColor = "red"; // Simple red marker
    marker.style.zIndex = "9999"; // Ensure it appears above RS3

    // Append the marker to the body to ensure it’s on top
    document.body.appendChild(marker);
}

addMarker(500, 500); // Test marker at (500, 500)
