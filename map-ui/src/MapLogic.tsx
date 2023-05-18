import { useEffect } from "react";
import * as L from "leaflet";
import { useMap } from "react-leaflet";

type MapLogicProps = {
    mapLoaded: boolean;
    setMapLoaded: React.Dispatch<any>
  }
  
export function MapLogic(props: MapLogicProps) {
    const map = useMap();
    useEffect(() => {
        console.log("Loading map?");
        map.setView([52.505, -3.1], 7);
        props.setMapLoaded(true);
        const loadMap = async () => {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        const jayIcon = L.icon({
            iconUrl: 'https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/images/JayBlueRound.svg',
            iconSize: [64, 100],
            iconAnchor: [32, 100],
            popupAnchor: [0, -90],
        });
        const graceIcon = L.icon({
            iconUrl: 'https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/images/GraceBlueRound.svg',
            iconSize: [64, 100],
            iconAnchor: [32, 100],
            popupAnchor: [0, -90],
        });
        const unknownIcon = L.icon({
            iconUrl: 'https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/images/UnknownBlueRound.svg',
            iconSize: [64, 100],
            iconAnchor: [32, 100],
            popupAnchor: [0, -90],
        });
        const s3Response = await fetch('https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/restaurant_reviews.json');
        const articleAddresses = await s3Response.json();
        let markers: Record<string, any> = {};
        let years: Set<string> = new Set();
        for (const articleKey in articleAddresses) {
            const data = articleAddresses[articleKey];
            if (data && data.possibleCoordinates) {
            const icon = data.seriesName?.startsWith("Grace Dent") ? graceIcon
                        : (data.seriesName?.startsWith("Jay Rayner") ? jayIcon : unknownIcon)
            const year = data.webPublicationDate.substring(0, 4);
            years.add(year);
            if (!markers[year]) {
                markers[year] = [];
            }
            markers[year].push(L.marker([data.possibleCoordinates?.lat, data.possibleCoordinates?.lon], {icon: icon})
                                .bindPopup(`<a href="https://theguardian.com/${data.articleId}">${data.title}</a>: ${data.priceSentences}`));
            }
        }
        let overlays: Record<string, any> = {};
        years.forEach(year => {
            const group = L.layerGroup(markers[year]);
            group.addTo(map);
            overlays[year] = group;
        })
            console.log("Creating layerControl");
        var layerControl = L.control.layers(undefined, overlays).addTo(map);

        };
        loadMap();
    }, []);
    return <></>
}
