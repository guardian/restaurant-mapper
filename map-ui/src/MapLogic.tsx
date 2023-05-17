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
        map.setView([51.505, -0.09], 6);
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
        });
        const graceIcon = L.icon({
            iconUrl: 'https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/images/GraceBlueRound.svg',
            iconSize: [64, 100],
            iconAnchor: [32, 100],
        });
        const unknownIcon = L.icon({
            iconUrl: 'https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/images/UnknownBlueRound.svg',
            iconSize: [64, 100],
            iconAnchor: [32, 100],
        });
        const s3Response = await fetch('https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/restaurant_reviews.json');
        const articleAddresses = await s3Response.json();
        for (const articleKey in articleAddresses) {
            const data = articleAddresses[articleKey];
            if (data && data.possibleCoordinates) {
            const icon = data.seriesName?.startsWith("Grace Dent") ? graceIcon
                        : (data.seriesName?.startsWith("Jay Rayner") ? jayIcon : unknownIcon)
            L.marker([data.possibleCoordinates?.lat, data.possibleCoordinates?.lon], {icon: icon}).addTo(map)
                .bindPopup(`<a href="https://theguardian.com/${data.articleId}">${data.title}</a>: ${data.priceSentences}`);
            }
        }
        };
        loadMap();
    }, []);
    return <></>
}
  