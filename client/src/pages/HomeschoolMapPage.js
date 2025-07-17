import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HomeschoolMapPage.css";
import DashboardLayout from "../components/DashboardLayout";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

const HomeschoolMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const markerClusterRef = useRef(null);

  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [multiResourceModal, setMultiResourceModal] = useState(null);

  // Wait for Google Maps to be loaded
  const waitForGoogle = (callback) => {
    if (window.google && window.google.maps) {
      callback();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          callback();
        }
      }, 100);
    }
  };

  // Fetch all resources once on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/homeschoolresources`;
        const res = await axios.get(url);
        setResources(res.data);
        setAllResources(res.data);
      } catch (e) {
        alert("Failed to load homeschool resources.");
      }
      setLoading(false);
    })();
  }, []);

  // Initialize map after data loaded
  useEffect(() => {
    if (!loading) {
      waitForGoogle(() => initMap());
    }
    // eslint-disable-next-line
  }, [loading, resources]);

  // Initialize and render map with clusters
  const initMap = () => {
    if (!mapRef.current) return;

    // Cleanup old markers/clusters
    if (markerClusterRef.current) {
      markerClusterRef.current.clearMarkers();
      markerClusterRef.current = null;
    }
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const map = new window.google.maps.Map(mapRef.current, {
      center: US_CENTER,
      zoom: 4,
    });
    mapInstance.current = map;

    const resourceMarkers = [];

    const allMarkers = resources.map((resource, idx) => {
      if (
        resource.location &&
        typeof resource.location.lat === "number" &&
        typeof resource.location.lng === "number"
      ) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: resource.location.lat,
            lng: resource.location.lng,
          },
          label: "",
        });

        marker.addListener("click", () => {
          setSelectedResource(resource);
          map.panTo({ lat: resource.location.lat, lng: resource.location.lng });
        });

        resourceMarkers.push({ marker, resource });
        return marker;
      }
      return null;
    }).filter(Boolean);

    markersRef.current = allMarkers;

    const clusterer = new MarkerClusterer({ map, markers: allMarkers });

    clusterer.addListener("clusterclick", (event) => {
      const clickedCluster = event.cluster;
      const markersInCluster = clickedCluster.markers;
      const clusterPosition = clickedCluster.position;

      const positions = markersInCluster.map(m => `${m.getPosition().lat()},${m.getPosition().lng()}`);
      const allSamePosition = positions.every((v) => v === positions[0]);

      if (allSamePosition && markersInCluster.length > 1) {
        const resourcesAtPoint = resourceMarkers
          .filter(({ marker }) => positions[0] === `${marker.getPosition().lat()},${marker.getPosition().lng()}`)
          .map(({ resource }) => resource);
        setMultiResourceModal({
          resources: resourcesAtPoint,
          lat: markersInCluster[0].getPosition().lat(),
          lng: markersInCluster[0].getPosition().lng(),
        });
        event.stop();
      } else {
        const bounds = clickedCluster.bounds;
        if (bounds) {
          map.fitBounds(bounds);
          const minZoom = map.getZoom();
          const idealZoom = Math.min(minZoom, 12);
          if (map.getZoom() > idealZoom) {
            map.setZoom(idealZoom);
          }
        } else {
          const targetZoom = Math.min(map.getZoom() + 2, 12);
          map.setZoom(targetZoom);
          map.panTo(clusterPosition);
        }
        event.stop();
      }
    });

    markerClusterRef.current = clusterer;
  };

  // SMART SEARCH: filters resources by name, state, or both
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setResources(allResources);
      setSelectedResource(null);
      setMultiResourceModal(null);
      return;
    }
    const terms = query.split(/[\s,]+/).filter(Boolean);

    const filtered = allResources.filter((res) => {
      const name = res.title?.toLowerCase() || "";
      const state = res.state?.toLowerCase() || "";
      return terms.every(term => name.includes(term) || state.includes(term));
    });

    setResources(filtered);
    setSelectedResource(null);
    setMultiResourceModal(null);
  };

  const handleReset = () => {
    setSearchQuery("");
    setResources(allResources);
    setSelectedResource(null);
    setMultiResourceModal(null);
  };

  const formatCategories = (categories) =>
    Array.isArray(categories) ? categories.join(", ") : "";

  return (
    <DashboardLayout>
      <div className="standalone-map-page">
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 6,
              flexWrap: "wrap"
            }}>
            <input
              type="text"
              placeholder="Search by resource name or state"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #bbb",
                minWidth: 120,
                width: "auto",
                flex: "1 1 160px",
                fontSize: "15px"
              }}
              autoComplete="off"
              inputMode="search"
            />
            <button
              type="submit"
              className="back-button"
              style={{ padding: "8px 12px", minWidth: 60 }}
            >
              Search
            </button>
            <button
              type="button"
              className="back-button"
              style={{
                padding: "8px 12px",
                minWidth: 60,
                backgroundColor: "#f5f5f5",
              }}
              onClick={handleReset}
            >
              Reset
            </button>
          </form>
        </div>
        <h2 className="map-heading" style={{ marginTop: 8 }}>
          Homeschool Resource Map
        </h2>
        <div
          className="standalone-map-container"
          style={{ marginTop: 0 }}
        >
          <div ref={mapRef} className="map-container" />
          {/* Single resource detail */}
          {selectedResource && (
            <div className="map-resource-modal"
              style={{
                position: "fixed",
                top: 90,
                right: 30,
                zIndex: 2000,
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                maxWidth: 380,
                padding: 24,
                minWidth: 220,
              }}>
              <button
                onClick={() => setSelectedResource(null)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  border: "none",
                  background: "none",
                  fontSize: 22,
                  cursor: "pointer",
                }}
                title="Close"
              >
                ×
              </button>
              <h3 style={{ marginBottom: 6 }}>{selectedResource.title}</h3>
              <div style={{ color: "#666", marginBottom: 6 }}>
                {selectedResource.categoryName}
              </div>
              <div style={{ fontSize: 15, marginBottom: 4 }}>
                <b>Address:</b> {selectedResource.address}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>State:</b> {selectedResource.state}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>City:</b> {selectedResource.city}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>Phone:</b> {selectedResource.phone}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>Website:</b>{" "}
                <a
                  href={selectedResource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedResource.website}
                </a>
              </div>
              <div style={{ fontSize: 15, margin: "4px 0" }}>
                <b>Categories:</b> {formatCategories(selectedResource.categories)}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>Score:</b> {selectedResource.totalScore ?? "N/A"}
              </div>
              <div style={{ fontSize: 15 }}>
                <b>Open Now:</b>{" "}
                {selectedResource.permanentlyClosed ? "Closed" : "Open"}
              </div>
              {selectedResource.imageUrl && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={selectedResource.imageUrl}
                    alt={selectedResource.title}
                    style={{
                      width: "100%",
                      maxHeight: 110,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
          {/* Multi-resource modal for clusters at one spot */}
          {multiResourceModal && (
            <div className="map-multimodal"
              style={{
                position: "fixed",
                top: 90,
                right: 30,
                zIndex: 2000,
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                maxWidth: 440,
                padding: 24,
                minWidth: 200,
                maxHeight: "70vh",
                overflowY: "auto",
              }}>
              <button
                onClick={() => setMultiResourceModal(null)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  border: "none",
                  background: "none",
                  fontSize: 22,
                  cursor: "pointer",
                }}
                title="Close"
              >
                ×
              </button>
              <h3 style={{ marginBottom: 12 }}>
                {multiResourceModal.resources.length} Resources at this location
              </h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {multiResourceModal.resources.map((res, i) => (
                  <li
                    key={res._id || res.title + i}
                    style={{
                      borderBottom: "1px solid #eee",
                      marginBottom: 8,
                      paddingBottom: 8,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{res.title}</div>
                    <div style={{ color: "#666", fontSize: 14 }}>{res.categoryName}</div>
                    <div style={{ fontSize: 13 }}>{res.address}</div>
                    <button
                      style={{
                        marginTop: 5,
                        padding: "4px 8px",
                        borderRadius: 5,
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        fontSize: 13,
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setSelectedResource(res);
                        setMultiResourceModal(null);
                      }}
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomeschoolMapPage;
