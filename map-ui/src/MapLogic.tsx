import { useEffect } from "react";
import * as L from "leaflet";
import { Circle, FeatureGroup, LayerGroup, LayersControl, MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";

type MapLogicProps = {
  mapLoaded: boolean;
  setMapLoaded: React.Dispatch<any>;
  restaurantReviews: RestaurantReview[];
};

export interface RestaurantReview {
  articleId: string;
  title: string;
  seriesUri?: string; // The series this article comes from. e.g https://mobile.guardianapis.com/lists/tag/food/series/grace-dent-on-restaurants
  seriesName?: string; // The series this article comes from. e.g Grace Dent on Restaurants

  // Images
  mainImageUrl?: string;
  headerImageUrl?: string;

  /* The sentence that usually contains the location / other metadata */
  unparsedLocationSentence?: string;

  // Infered metadata
  possibleRestaurantTitle?: string;
  possibleAddress?: string;
  priceSentences?: string;

  possibleCoordinates?: {
    lat: string;
    lon: string;
  }
  webPublicationDate: string
}


export function MapLogic(props: MapLogicProps) {
  const center: L.LatLngExpression = [52.505, -3.1];
  let years: Set<string> = new Set();
  let reviewsByYear: Record<string, RestaurantReview[]> = {};
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

  for (const articleKey in props.restaurantReviews) {
    const data = props.restaurantReviews[articleKey];
    if (data && data.possibleCoordinates) {
      const year = data.webPublicationDate.substring(0, 4);
      years.add(year);
      if (!reviewsByYear[year]) {
        reviewsByYear[year] = [];
      }
      reviewsByYear[year].push(data);
    }
  }
  let yearsArray: string[] = [];
  years.forEach((y) => yearsArray.push(y));
  return <MapContainer center={center} zoom={7} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <LayersControl position="topright">
      {yearsArray.map((year) => {
        return <LayersControl.Overlay name={year}>
          {reviewsByYear[year].map((review) => {
            if (review.possibleCoordinates) {
              const coords: L.LatLngExpression = [parseFloat(review.possibleCoordinates.lat), parseFloat(review.possibleCoordinates.lon)]
              const icon = review.seriesName?.startsWith("Grace Dent") ? graceIcon
                : (review.seriesName?.startsWith("Jay Rayner") ? jayIcon : unknownIcon)
              return <Marker position={coords} icon={icon}>
                <Popup>
                  <a href={`https://theguardian.com/${review.articleId}`}>
                    {review.title}
                  </a>
                  {review.headerImageUrl ? `<img src="${review.headerImageUrl}" />` : ": "}
                  {review.priceSentences}
                </Popup>
              </Marker>
            } else {
              return <></>
            }
          })

          }
        </LayersControl.Overlay>
      })}
    </LayersControl>
  </MapContainer>
}
