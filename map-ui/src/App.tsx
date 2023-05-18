import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapLogic } from './MapLogic';
import { TitleBar } from './TitleBar';
import { FilterBar } from './FilterBar';
import { Sidebar } from './Sidebar';
import { RestaurantReview } from './restaurant_review';

function App() {
  const [loading, setLoading] = useState(true);
  const [jayRadarActivated, setJayRadarActivated] = useState(false);
  const [reviewsByYear, setReviewsByYear] = useState<Record<string, RestaurantReview[]>>({});
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  useEffect(() => {
    async function getReviews() {
      const s3Response = await fetch('https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/restaurant_reviews.json');
      const json: { [articleId: string]: RestaurantReview } = await s3Response.json();
      const reviewsByYear = groupReviewsByYear(json);
      setYearOptions(Object.keys(reviewsByYear));
      setReviewsByYear(reviewsByYear);
      setLoading(false);
    }
    getReviews();
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
      <div className="belowBars">
        <Sidebar reviews={reviewsByYear[selectedYear]} />
          {loading ? <p>Loading...</p> : <MapLogic
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
