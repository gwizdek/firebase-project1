import { GeolocationService } from './geolocation.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as GeoFire from 'geofire';

import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

@Injectable()
export class StationsService {

  dbRef: any;
  geoFire: any;
  geoQuery: any;

  hits = new BehaviorSubject([]);

  constructor(
    private db: AngularFireDatabase,
    private geolocationService: GeolocationService
  ) {
    this.dbRef = this.db.list('/locations');
    this.geoFire = new GeoFire(this.dbRef.$ref);

    this.getLocations(50, [19, 50]);
  }

  public getStations(rowNo?: number): Observable<any[]> {
    return this.db.list('/stations', {
      query: {
        limitToFirst: rowNo
      }
    })
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

  public findStationByName(term: string): Observable<string[]> {
    return this.getStations()
      .take(1)
      .map(stations => stations
        .map(station => station.name)
        .filter(station =>
          typeof station === 'string' && station.toUpperCase().indexOf(term.toUpperCase()) > -1
        )
      );
  }

  /// Adds GeoFire data to database
  setLocation(key: string, coords: Array<number>) {
    this.geoFire.set(key, coords)
        .then(_ => console.log('location updated'))
        .catch(err => console.log(err));
  }

  updateLocation(radius: number, coords: Array<number>) {
    this.geoQuery.updateCriteria({
      center: coords,
      radius: radius
    });
  }

  /// Queries database for nearby locations
  /// Maps results to the hits BehaviorSubject
  getLocations(radius: number, coords: Array<number>) {
    this.geoQuery = this.geoFire.query({
      center: coords,
      radius: radius
    });

    this.geoQuery.on('key_entered', (key, location, distance) => {
      console.log('Key entered');
      const hit = {
        $key: key,
        location: location,
        distance: distance
      };
      const currentHits = this.hits.value;

      if (currentHits.findIndex((x) => x.$key === hit.$key) === -1) {
        currentHits.push(hit);
        this.hits.next(currentHits);
      }
    });

    this.geoQuery.on('key_exited', (key, location, distance) => {
      console.log('Key exited');
      const currentHits = this.hits.value;
      this.hits.next(currentHits.filter((x) => x.$key !== key));
    });
  }

  private getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

}
