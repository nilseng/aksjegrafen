import { Map as MapboxMap } from "mapbox-gl";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App";

const createMap = (container: HTMLDivElement) => {
  return new MapboxMap({
    container,
    center: [10, 65],
    zoom: 3.9,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  });
};

export const MapVisual = () => {
  const { theme } = useContext(AppContext);

  const mapContainer = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<MapboxMap>();

  useEffect(() => {
    if (!mapContainer.current) return;
    setMap(createMap(mapContainer.current));
  }, []);

  useEffect(() => {
    map?.setStyle(theme.mapbox.style);
  }, [theme, map]);

  return <div ref={mapContainer} className="h-100 w-100 rounded"></div>;
};
