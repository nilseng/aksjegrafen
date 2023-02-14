import { Map as MapboxMap } from "mapbox-gl";
import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../App";

const createMap = (theme: string, container: HTMLDivElement) => {
  new MapboxMap({
    container,
    style: theme === "light" ? "mapbox://styles/mapbox/streets-v12" : "mapbox://styles/mapbox/dark-v11",
    center: [10, 65],
    zoom: 3.9,
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  });
};

export const MapVisual = () => {
  const {
    theme: { id: theme },
  } = useContext(AppContext);

  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    createMap(theme, mapContainer.current);
  }, [theme]);

  return <div ref={mapContainer} className="h-100 w-100 rounded"></div>;
};
