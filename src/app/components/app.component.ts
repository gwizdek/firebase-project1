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

  viewportLat: number = 50.2530171;
  viewportLng: number = 19.0179155;

  myLat: number = 50.2530171;
  myLng: number = 19.0179155;

  locRefreshCount: number = 0;
  distance: number = 0;

  stations$: Observable<any[]>;
  // stationsDistance$: Observable<any>;

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
    location$.take(1).subscribe( 
      location => {
        this.viewportLat = location.coords.latitude;
        this.viewportLng = location.coords.longitude;
      }, 
      err => {},
      () => {
        console.log("Pobrano pierwszą lokalizację");
      }
    );
    
    // nasłuchujemy odczytów pozycji w przeglądarce. Jak często pozycja jest odświeżana
    // zależy od samej przeglądarki (z GPS jest szybciej)
    this.locationSubs = location$.subscribe(
      location => {
        this.locRefreshCount++;
        this.myLat = location.coords.latitude;
        this.myLng = location.coords.longitude;
      },
      err => {
        console.log(err);
      },
      () => {
        console.log("completed!");
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

  clickedStartLocation() {
    // if (!this.geoLocationTimerSubs) {
    //   this.geoLocationTimerSubs = this.location$.subscribe(
    //     location => {
    //       // console.log(location);
    //       this.locRefreshCount++;
    //       this.myLat = location.coords.latitude;
    //       this.myLng = location.coords.longitude;
    //     },
    //     err => {
    //       console.log(err);
    //     },
    //     () => {
    //       console.log("completed!");
    //     }
    //   );
    // }
  }
  
  clickedStopLocation() {
    // this.geoService.stopObservingLocation();
  }

  private getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = this.deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}
	
	private deg2rad(deg) {
		return deg * (Math.PI/180)
	}

}
