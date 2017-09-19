import { GeolocationService } from './geolocation.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


@Injectable()
export class StationsService {

  constructor(
		private db: AngularFireDatabase,
		private geolocationService: GeolocationService
	) { 
  }

  public getStations() : Observable<any[]> {
		return this.db.list('/stations')
			.combineLatest(this.geolocationService.observeLocation())
			.map(locPos => 
				locPos[0].map(marker =>
					Object.assign(marker, {
						distance: this.getDistanceFromLatLonInKm(
							locPos[1].coords.latitude, 
							locPos[1].coords.longitude,
							marker.pos.lat,
							marker.pos.lng
						)
					})
				)
			);
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
