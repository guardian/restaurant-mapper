import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapLogic } from './MapLogic';
import { TitleBar } from './TitleBar';
import { FilterBar } from './FilterBar';
import { Sidebar } from './Sidebar';
import { RestaurantReview } from './restaurant_review';
import jaydarImage from './jaydar1.png';

function App() {
  const [loading, setLoading] = useState(true);
  const [jayRadarActivated, setJayRadarActivated] = useState(false);
  const [reviewsByYear, setReviewsByYear] = useState<Record<string, RestaurantReview[]>>({});
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number} | null>(null);
  useEffect(() => {
    async function getReviews() {
      const s3Response = await fetch('https://home.emdash.ie/restaurant_reviews.json');
      const json: { [articleId: string]: RestaurantReview } = await s3Response.json();
      const reviewsByYear = groupReviewsByYear(json);
      setYearOptions(Object.keys(reviewsByYear));
      setReviewsByYear(reviewsByYear);
      setLoading(false);
    }
    getReviews();
    if (navigator.geolocation) {
      setInterval(() => {
        console.log("polling for location...");
        navigator.geolocation.getCurrentPosition((position) => {
          setCurrentLocation({ lat: position.coords.latitude, lon: position.coords.longitude})
        });
      }, 5000);
    }
  }, []);
  return (
    <div className="App">
      <TitleBar
        jayRadarActivated={jayRadarActivated}
        setJayRadarActivated={setJayRadarActivated}
      />
      <FilterBar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        yearOptions={yearOptions}
      />
      <div className={!jayRadarActivated ? "belowBars" : "belowBars jaydar"}>
        <Sidebar reviews={reviewsByYear[selectedYear]} />
          {loading ? <p>Loading...</p> : <MapLogic
            jayOnly={jayRadarActivated}
            currentLocation={currentLocation}
            reviews={reviewsByYear[selectedYear] || []}
          ></MapLogic>}
      </div>
    </div>
  );
}

function groupReviewsByYear(reviewsMap: Record<string, RestaurantReview>): Record<string, RestaurantReview[]> {
  let years: Set<string> = new Set();
  let reviewsByYear: Record<string, RestaurantReview[]> = {"All": []};


  for (const articleId in reviewsMap) {
    const review = reviewsMap[articleId];
    if (review && review.possibleCoordinates) {
      const year = review.webPublicationDate.substring(0, 4);
      years.add(year);
      if (!reviewsByYear[year]) {
        reviewsByYear[year] = [];
      }
      reviewsByYear[year].push(review);
      reviewsByYear["All"].push(review);
    }
  }
  return reviewsByYear;
}

export default App;
