import { StationsService } from '../services/stations.service';
import { GeolocationService } from '../services/geolocation.service';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Station } from '../interfaces/station.interface';
import { FirebaseListObservable } from 'angularfire2/database';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  lat: number = 50.2530171;
  lng: number = 19.0179155;

  // private stationClick$ = new Subject();
  // public obs$ = this.obs.asObservable();

  stations$: FirebaseListObservable<any[]>;
  geoLocation$: Observable<any>;

  // private stations: Marker[];
  // private selectedStation: Marker;

  constructor(
    private geoService: GeolocationService, 
    private stationsService: StationsService
  ) {}
  
  ngOnInit() {
    this.stations$ = this.stationsService.getStations();
  
    this.geoLocation$ = this.geoService.getLocation({
      enableHighAccuracy: true
    });
    
    this.geoLocation$.subscribe( location => {
      this.lat = location.coords.latitude;
      this.lng = location.coords.longitude;
    });

    // this.stationClick$.subscribe( station => {
    //   console.log(station);
    // });
  }

  ngOnDestroy() {

  }

  clickedStation(station) {
    console.log(station);
    // this.selectedMarker = this.markers[i];
  }

}
