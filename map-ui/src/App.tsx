import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapLogic } from './MapLogic';
import { TitleBar } from './TitleBar';
import { FilterBar } from './FilterBar';
import { Sidebar } from './Sidebar';
import { RestaurantReview } from './restaurant_review';

function App() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [jayRadarActivated, setJayRadarActivated] = useState(false);
  const [reviews, setReviews] = useState<RestaurantReview[] | null>(null);
  useEffect(() => {
    async function getReviews() {
      const s3Response = await fetch('https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/restaurant_reviews.json');
      const json: { [articleId: string]: RestaurantReview} = await s3Response.json();
      const reviewsByYear = groupReviewsByYear(json);
      setReviews(reviewsByYear["2023"]);
    }
    getReviews();
  }, []);
  return (
    <div className="App">
      <TitleBar
        jayRadarActivated={jayRadarActivated}
        setJayRadarActivated={setJayRadarActivated}
      />
      <FilterBar/>
      <div className="belowBars">
        <Sidebar/>
        <MapContainer id="map-container" center={[50, 0]} zoom={12} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {reviews ? <MapLogic
            mapLoaded={mapLoaded}
            setMapLoaded={setMapLoaded}
            reviews={reviews}
          ></MapLogic> : null}
        </MapContainer>
      </div>
    </div>
  );
}

function groupReviewsByYear(reviewsMap: Record<string, RestaurantReview>): Record<string, RestaurantReview[]> {
  let years: Set<string> = new Set();
  let reviewsByYear: Record<string, RestaurantReview[]> = {};
  

  for (const articleId in reviewsMap) {
    const review = reviewsMap[articleId];
    if (review && review.possibleCoordinates) {
      const year = review.webPublicationDate.substring(0, 4);
      years.add(year);
      if (!reviewsByYear[year]) {
        reviewsByYear[year] = [];
      }
      reviewsByYear[year].push(review);
    }
  }
  return reviewsByYear;
}

export default App;
