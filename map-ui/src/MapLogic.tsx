import { useEffect } from "react";
import * as L from "leaflet";
import { Circle, FeatureGroup, LayerGroup, LayersControl, MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";
import { RestaurantReview } from "./restaurant_review";

type MapLogicProps = {
    jayOnly: boolean;
    currentLocation: {lat: number, lon: number} | null;
    reviews: RestaurantReview[];
};

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

export function MapLogic(props: MapLogicProps) {
  const center: L.LatLngExpression = [52.505, -3.1];

  return <MapContainer center={center} zoom={7} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {props.reviews
    .filter((review) => { if (props.jayOnly) { return review.seriesName?.startsWith("Jay") } else { return true }})
    .map((review) => {
      if (review.possibleCoordinates) {
        const coords: L.LatLngExpression = [parseFloat(review.possibleCoordinates.lat), parseFloat(review.possibleCoordinates.lon)]
        const icon = review.seriesName?.startsWith("Grace Dent") ? graceIcon
          : (review.seriesName?.startsWith("Jay Rayner") ? jayIcon : unknownIcon)
        return <Marker position={coords} icon={icon} key={"marker_" + review.articleId}>
          <Popup>
            <h2>{review.title}</h2>
            {review.headerImageUrl ? <img src={review.headerImageUrl} /> : null}
            <p>{review.priceSentences}</p>
            <p>
              <a href={`https://www.theguardian.com/${review.articleId}`}>Read review</a>
            </p>
          </Popup>
        </Marker>
      } else {
        return <></>
      }
    })}
    {props.currentLocation ? <Marker position={[props.currentLocation?.lat, props.currentLocation?.lon]}></Marker>: null}
  </MapContainer>
}
