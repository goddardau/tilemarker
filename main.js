if (!alt1) {
    alert("Alt1 not detected. Please open in the Alt1 toolkit.");
}

alt1.identifyApp("TileMarker"); // Identifies the app in Alt1

const GRID_SIZE = 10; // Grid spacing for snapping
let gridSnappingEnabled = true;

// Event listeners for buttons and controls
document.getElementById("addMarker").addEventListener("click", captureMinimap);
document.getElementById("clearMarkers").addEventListener("click", clearMarkers);
document.getElementById("exportMarkers").addEventListener("click", exportMarkers);
document.getElementById("importMarkers").addEventListener("change", importMarkers);
document.getElementById("toggleGrid").addEventListener("change", (event) => {
    gridSnappingEnabled = event.target.checked;
});

function captureMinimap() {
    let img = a1lib.captureHoldFullRs();
    let miniMapRegion = img.findSubimage(alt1.rsminimap); // Locate the minimap

    if (!miniMapRegion.length) {
        alert("Mini-map not found! Adjust camera angle.");
        return;
    }

    let playerPosition = miniMapRegion[0];
    let x = playerPosition.x + 50; // Adjust based on detection accuracy
    let y = playerPosition.y + 50;

    addTileMarker(x, y);
    saveMarker(x, y);
}

function drawTileMarker(x, y) {
    let marker = document.createElement("div");
    marker.className = "tile-marker";
    marker.style.left = x + "px";
    marker.style.top = y + "px";
    document.body.appendChild(marker);
}

function snapToGrid(value) {
    return gridSnappingEnabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : value;
}

function addTileMarker(x, y, color = "#ff0000", label = "") {
    x = snapToGrid(x);
    y = snapToGrid(y);

    let marker = document.createElement("div");
    marker.classList.add("tile-marker");
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.style.backgroundColor = color;

    let labelElem = document.createElement("span");
    labelElem.innerText = label;
    marker.appendChild(labelElem);

    // Enable dragging
    marker.onmousedown = (e) => startDrag(e, marker);
    marker.oncontextmenu = (e) => deleteMarker(e, marker, x, y);

    document.getElementById("overlay").appendChild(marker);
}

function startDrag(event, marker) {
    event.preventDefault();
    let shiftX = event.clientX - marker.getBoundingClientRect().left;
    let shiftY = event.clientY - marker.getBoundingClientRect().top;

    function moveAt(x, y) {
        marker.style.left = `${snapToGrid(x - shiftX)}px`;
        marker.style.top = `${snapToGrid(y - shiftY)}px`;
    }

    function onMouseMove(e) {
        moveAt(e.clientX, e.clientY);
    }

    document.addEventListener("mousemove", onMouseMove);

    marker.onmouseup = () => {
        document.removeEventListener("mousemove", onMouseMove);
        marker.onmouseup = null;
        saveUpdatedMarkers();
    };
}

function deleteMarker(event, marker, x, y) {
    event.preventDefault(); // Prevents the default context menu
    marker.remove();

    let markers = JSON.parse(localStorage.getItem("tileMarkers")) || [];
    markers = markers.filter(m => !(m.x === x && m.y === y));
    localStorage.setItem("tileMarkers", JSON.stringify(markers));
}

function saveUpdatedMarkers() {
    let markers = [];
    document.querySelectorAll(".tile-marker").forEach(marker => {
        markers.push({
            x: parseInt(marker.style.left),
            y: parseInt(marker.style.top),
            color: marker.style.backgroundColor,
            label: marker.innerText
        });
    });
    localStorage.setItem("tileMarkers", JSON.stringify(markers));
}

function clearMarkers() {
    if (confirm("Are you sure you want to clear all markers?")) {
        document.querySelectorAll(".tile-marker").forEach(marker => marker.remove());
        localStorage.removeItem("tileMarkers");
    }
}

function exportMarkers() {
    let markers = localStorage.getItem("tileMarkers");
    if (!markers) {
        alert("No markers to export.");
        return;
    }

    let blob = new Blob([markers], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "RS3_Tile_Markers.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importMarkers(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let markers = JSON.parse(e.target.result);
            localStorage.setItem("tileMarkers", JSON.stringify(markers));
            document.querySelectorAll(".tile-marker").forEach(marker => marker.remove());
            markers.forEach(({ x, y, color, label }) => addTileMarker(x, y, color, label));
        } catch (error) {
            alert("Invalid JSON file.");
        }
    };
    reader.readAsText(file);
}

function loadMarkers() {
    let markers = JSON.parse(localStorage.getItem("tileMarkers")) || [];
    markers.forEach(({ x, y, color, label }) => addTileMarker(x, y, color, label));
}

window.onload = loadMarkers;
