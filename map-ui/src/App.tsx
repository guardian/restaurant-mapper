import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapLogic } from './MapLogic';
import { TitleBar } from './TitleBar';
import { FilterBar } from './FilterBar';
import { Sidebar } from './Sidebar';

function App() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [jayRadarActivated, setJayRadarActivated] = useState(false);
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    async function getReviews() {
      const s3Response = await fetch('https://restaurant-mapper-hack.s3.eu-west-1.amazonaws.com/restaurant_reviews.json');
      setReviews(await s3Response.json());
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
          <MapLogic
            mapLoaded={mapLoaded}
            setMapLoaded={setMapLoaded}
            restaurantReviews={reviews ?? []}
          ></MapLogic>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
