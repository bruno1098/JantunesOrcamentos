"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// O bundler do Next quebra os ícones padrão do Leaflet (as URLs relativas
// dos PNGs não sobrevivem ao webpack). Corrige apontando pros mesmos
// assets servidos via CDN — mesma versão do "leaflet" instalado.
const iconePin = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapaEnderecoProps {
  latitude: number;
  longitude: number;
  /** Permite arrastar o pino e reporta a nova posição via onPositionChange. */
  draggable?: boolean;
  onPositionChange?: (lat: number, lng: number) => void;
  className?: string;
  zoom?: number;
}

/**
 * Recentraliza o mapa sempre que `latitude`/`longitude` mudam por fora
 * (ex: o usuário buscou um novo CEP/endereço). O MapContainer só usa a
 * prop `center` na primeira renderização, então sem isso o mapa fica
 * "preso" no primeiro local buscado.
 */
function Recentralizar({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
    // Só quando a posição muda de fato — evitar competir com o próprio
    // drag do usuário (que já move o marker localmente via Leaflet).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);
  return null;
}

/**
 * Mapa interativo (OpenStreetMap via Leaflet, sem custo/API key).
 * Uso: importar sempre via `next/dynamic` com `ssr: false` — depende de
 * `window`/`document` e não funciona em Server Components.
 */
export function MapaEndereco({
  latitude,
  longitude,
  draggable = false,
  onPositionChange,
  className,
  zoom = 17,
}: MapaEnderecoProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker && onPositionChange) {
          const { lat, lng } = marker.getLatLng();
          onPositionChange(lat, lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className ?? "h-full w-full"}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[latitude, longitude]}
        draggable={draggable}
        eventHandlers={draggable ? eventHandlers : undefined}
        icon={iconePin}
        ref={markerRef}
      />
      <Recentralizar latitude={latitude} longitude={longitude} />
    </MapContainer>
  );
}
