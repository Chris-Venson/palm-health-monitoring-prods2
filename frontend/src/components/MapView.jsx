
import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    LayersControl,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:8000";


function MapResize() {

    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);

    return null;
}


export default function MapView() {

    const [layers, setLayers] = useState(null);
    const [error, setError] = useState(null);

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

        <MapContainer
            center={[0.95, 100.32]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
        >

            <MapResize />

            <LayersControl position="topright">

                {/* Google Hybrid (Satelit + Label) - default */}
                <LayersControl.BaseLayer checked name="Google Hybrid">
                    <TileLayer
                        url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        maxZoom={20}
                        attribution="&copy; Google"
                    />
                </LayersControl.BaseLayer>

                {/* Google Satellite murni */}
                <LayersControl.BaseLayer name="Google Satellite">
                    <TileLayer
                        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        maxZoom={20}
                        attribution="&copy; Google"
                    />
                </LayersControl.BaseLayer>

                {/* Original Sentinel-2 imagery from GEE */}
                <LayersControl.BaseLayer
                    name="Sentinel-2 RGB (GEE)"
                >
                    <TileLayer
                        url={layers.satellite}
                        attribution="Google Earth Engine / Copernicus Sentinel-2"
                    />
                </LayersControl.BaseLayer>


                <LayersControl.BaseLayer
                    name="OpenStreetMap"
                >

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                </LayersControl.BaseLayer>


                <LayersControl.Overlay
                    checked
                    name="Batas Kecamatan"
                >

                    <TileLayer
                        url={layers.boundary}
                        opacity={1}
                    />

                </LayersControl.Overlay>

            </LayersControl>

        </MapContainer>

    );
}
