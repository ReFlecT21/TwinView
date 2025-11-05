import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from "react-leaflet";
import { ISVStartup } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

interface ISVMapProps {
  isvStartups: ISVStartup[];
  selectedVertical?: string;
  onISVClick: (isv: ISVStartup) => void;
}

// Default coordinates for major regions
const defaultCoordinates: Record<string, { lat: number; lng: number }> = {
  "USA": { lat: 37.0902, lng: -95.7129 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "UK": { lat: 55.3781, lng: -3.4360 },
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "UAE": { lat: 23.4241, lng: 53.8478 },
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "Global": { lat: 20, lng: 0 },
};

// Get color based on vertical
const getVerticalColor = (vertical: string) => {
  switch (vertical) {
    case "manufacturing":
      return "#dc2626"; // red
    case "smart_cities":
      return "#16a34a"; // green
    case "healthcare":
      return "#2563eb"; // blue
    default:
      return "#6b7280"; // gray
  }
};

// Get size based on company size
const getMarkerSize = (size?: string) => {
  switch (size) {
    case "enterprise":
      return 20;
    case "large":
      return 16;
    case "medium":
      return 12;
    case "small":
      return 10;
    case "startup":
      return 8;
    default:
      return 10;
  }
};

export function ISVMap({ isvStartups, selectedVertical, onISVClick }: ISVMapProps) {
  // Filter ISVs based on selected vertical
  const filteredISVs = selectedVertical
    ? isvStartups.filter((isv) => isv.vertical === selectedVertical)
    : isvStartups;

  // Group ISVs by location for clustering
  const locationGroups = filteredISVs.reduce((acc, isv) => {
    const location = isv.headquarters || "Global";
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(isv);
    return acc;
  }, {} as Record<string, ISVStartup[]>);

  return (
    <Card className="h-[500px] relative overflow-hidden" style={{ zIndex: 1 }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.entries(locationGroups).map(([location, isvs]) => {
          const coords = isvs[0]?.coordinates || defaultCoordinates[location] || defaultCoordinates["Global"];

          if (isvs.length === 1) {
            // Single ISV - show as circle marker
            const isv = isvs[0];
            return (
              <CircleMarker
                key={isv.id}
                center={[coords.lat, coords.lng]}
                radius={getMarkerSize(isv.size)}
                fillColor={getVerticalColor(isv.vertical)}
                fillOpacity={0.7}
                color={getVerticalColor(isv.vertical)}
                weight={2}
                eventHandlers={{
                  click: () => onISVClick(isv),
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -10]}
                  className="font-semibold"
                >
                  {isv.name}
                </Tooltip>
                <Popup closeButton={false} autoPan={false}>
                  <div className="p-3 min-w-[250px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {isv.vertical.replace("_", " ")}
                        </Badge>
                        {isv.size && (
                          <Badge variant="secondary" className="text-xs">
                            {isv.size}
                          </Badge>
                        )}
                        {isv.interestLevel && (
                          <Badge
                            className={`text-xs ${
                              isv.interestLevel === "high"
                                ? "bg-red-100 text-red-800"
                                : isv.interestLevel === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isv.interestLevel} interest
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          <strong>HQ:</strong> {isv.headquarters || "Not specified"}
                        </p>
                        {isv.employees && (
                          <p className="text-muted-foreground">
                            <strong>Employees:</strong> {isv.employees.toLocaleString()}
                          </p>
                        )}
                        {isv.revenue && (
                          <p className="text-muted-foreground">
                            <strong>Revenue:</strong> {isv.revenue}
                          </p>
                        )}
                        {isv.hasOpenAPIs && (
                          <p className="text-green-600 text-xs">✓ Open APIs Available</p>
                        )}
                        {isv.dellValidated && (
                          <p className="text-blue-600 text-xs">✓ Dell Validated</p>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground italic pt-1 border-t">
                        Click to view full details
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          } else {
            // Multiple ISVs - show as cluster
            return (
              <CircleMarker
                key={location}
                center={[coords.lat, coords.lng]}
                radius={Math.min(20 + isvs.length * 2, 40)}
                fillColor="#6b7280"
                fillOpacity={0.7}
                color="#374151"
                weight={2}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-2">
                      {location} ({isvs.length} companies)
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {isvs.map((isv) => (
                        <div
                          key={isv.id}
                          className="p-2 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary"
                          onClick={() => onISVClick(isv)}
                        >
                          <div className="font-medium text-xs">{isv.name}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: getVerticalColor(isv.vertical),
                                color: getVerticalColor(isv.vertical),
                              }}
                            >
                              {isv.vertical.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur p-3 rounded-lg shadow-lg z-[1000]">
        <div className="text-xs font-semibold mb-2">Verticals</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs">Manufacturing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-xs">Smart Cities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-xs">Healthcare</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-3 rounded-lg shadow-lg z-[1000]">
        <div className="text-xs font-semibold mb-1">Total ISVs</div>
        <div className="text-2xl font-bold">{filteredISVs.length}</div>
      </div>
    </Card>
  );
}