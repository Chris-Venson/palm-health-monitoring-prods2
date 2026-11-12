import { useEffect, useRef, useState } from "react";

import {
    MapContainer,
    TileLayer,
    LayersControl,
    useMap,
    useMapEvents
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:8000";
const SAWIT_LAYER_NAME = "Sawit Classification Count (2015–2025)";


function MapResize() {

    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
}


// Shows/hides the opacity slider depending on whether the sawit overlay is on
function OverlayWatcher({ onChange }) {

    useMapEvents({
        overlayadd: (e) => {
            if (e.name === SAWIT_LAYER_NAME) onChange(true);
        },
        overlayremove: (e) => {
            if (e.name === SAWIT_LAYER_NAME) onChange(false);
        },
    });

    return null;
}


// Tile layer whose opacity is also pushed imperatively to the Leaflet layer
function OpacityTileLayer({ url, opacity, attribution }) {

    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.setOpacity(opacity);
        }
    }, [opacity]);

    return (
        <TileLayer
            ref={ref}
            url={url}
            opacity={opacity}
            attribution={attribution}
        />
    );
}


export default function MapView() {

    const [layers, setLayers] = useState(null);
    const [error, setError] = useState(null);

    // Classification opacity: default 85%
    const [classificationOpacity, setClassificationOpacity] = useState(0.85);

    // Slider is visible only while the sawit overlay is checked
    const [showSlider, setShowSlider] = useState(true);

    const panelRef = useRef(null);

    useEffect(() => {

        fetch(`${API_URL}/api/map-layers`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load GEE layers");
                }

                return response.json();
            })
            .then(data => setLayers(data))
            .catch(err => setError(err.message));

    }, []);

    // Stop slider interaction from panning/zooming the map underneath
    useEffect(() => {
        if (panelRef.current) {
            L.DomEvent.disableClickPropagation(panelRef.current);
            L.DomEvent.disableScrollPropagation(panelRef.current);
        }
    }, [layers, showSlider]);

    if (error) {
        return <div className="map-message">
            Error: {error}
        </div>;
    }

    if (!layers) {
        return <div className="map-message">
            Loading satellite imagery...
        </div>;
    }

    return (

        <div style={{ height: "100%", width: "100%", position: "relative" }}>

            {/* Classification Opacity Control */}
            {showSlider && (
                <div
                    ref={panelRef}
                    style={{
                        position: "absolute",
                        zIndex: 1000,
                        bottom: "25px",
                        left: "15px",
                        background: "white",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                        width: "230px"
                    }}
                >

                    <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px"
                    }}>
                        Classification Opacity: {Math.round(classificationOpacity * 100)}%
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={classificationOpacity}
                        onChange={(e) =>
                            setClassificationOpacity(Number(e.target.value))
                        }
                        style={{
                            width: "100%",
                            cursor: "pointer"
                        }}
                    />

                </div>
            )}


            <MapContainer
                center={[0.95, 100.32]}
                zoom={11}
                style={{ height: "100%", width: "100%" }}
            >

                <MapResize />
                <OverlayWatcher onChange={setShowSlider} />

                <LayersControl position="topright">

                    {/* Google Hybrid */}
                    <LayersControl.BaseLayer checked name="Google Hybrid">
                        <TileLayer
                            url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                            subdomains={["mt0", "mt1", "mt2", "mt3"]}
                            maxZoom={20}
                            attribution="&copy; Google"
                        />
                    </LayersControl.BaseLayer>

                    {/* Google Satellite */}
                    <LayersControl.BaseLayer name="Google Satellite">
                        <TileLayer
                            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                            subdomains={["mt0", "mt1", "mt2", "mt3"]}
                            maxZoom={20}
                            attribution="&copy; Google"
                        />
                    </LayersControl.BaseLayer>

                    {/* Sentinel-2 RGB */}
                    <LayersControl.BaseLayer name="Sentinel-2 RGB (GEE)">
                        <TileLayer
                            url={layers.satellite}
                            attribution="Google Earth Engine / Copernicus Sentinel-2"
                        />
                    </LayersControl.BaseLayer>

                    {/* OpenStreetMap */}
                    <LayersControl.BaseLayer name="OpenStreetMap">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                    </LayersControl.BaseLayer>


                    {/* Sawit Classification Count */}
                    <LayersControl.Overlay
                        checked={true}
                        name={SAWIT_LAYER_NAME}
                    >
                        <OpacityTileLayer
                            url={layers.sawitCount}
                            opacity={classificationOpacity}
                            attribution="Google Earth Engine"
                        />
                    </LayersControl.Overlay>


                    {/* Rambah Hilir Boundary */}
                    <LayersControl.Overlay
                        checked={true}
                        name="Rambah Hilir Boundary"
                    >
                        <TileLayer
                            url={layers.boundary}
                            opacity={1}
                            attribution="Google Earth Engine"
                        />
                    </LayersControl.Overlay>

                </LayersControl>

            </MapContainer>

        </div>

    );
}
