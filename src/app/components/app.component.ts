import { StationsService } from '../services/stations.service';
import { GeolocationService } from '../services/geolocation.service';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Station } from '../interfaces/station.interface';
import { FirebaseListObservable } from 'angularfire2/database';

import 'rxjs/add/operator/take';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  viewportLat = 50.2530171;
  viewportLng = 19.0179155;

  myLat = 50.2530171;
  myLng = 19.0179155;

  stations$: Observable<any[]>;

  // subskrypcja pozycji usera
  locationSubs: Subscription;

  constructor(
    private geoService: GeolocationService,
    private stationsService: StationsService
  ) {}

  ngOnInit() {
    this.stations$ = this.stationsService.getStations();
    const location$ = this.geoService.observeLocation();

    // jeden raz na początku ustawiamy viewport na obecne położenie
    location$.take(2).subscribe(
      location => {
        this.viewportLat = location.coords.latitude;
        this.viewportLng = location.coords.longitude;
      },
      err => {},
      () => {
        // this.stationsService.getLocations(50, [this.viewportLat, this.viewportLng]);
        console.log('Pobrano pierwszą lokalizację');
      }
    );

    // nasłuchujemy odczytów pozycji w przeglądarce. Jak często pozycja jest odświeżana
    // zależy od samej przeglądarki (z GPS jest szybciej)
    this.locationSubs = location$.subscribe(
      location => {
        this.myLat = location.coords.latitude;
        this.myLng = location.coords.longitude;
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('completed!');
      }
    );
  }

  ngOnDestroy() {
    this.locationSubs.unsubscribe();
  }

  clickedStation(station) {
    console.log(station);
    // this.selectedMarker = this.markers[i];
  }

}
