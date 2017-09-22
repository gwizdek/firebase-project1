import { GeolocationService } from './geolocation.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
    private geolocationService: GeolocationService,
    private sanitizer: DomSanitizer
  ) {
    this.dbRef = this.db.list('/locations');
    this.geoFire = new GeoFire(this.dbRef.$ref);

    this.getLocations(50, [19, 50]);
  }

  public getStationDetails(stationId: number) {
    return this.db.object(`/stations/${stationId}`)
      .combineLatest(this.geolocationService.observeLocation())
      .map(locPos =>
        Object.assign(locPos[0], {
          distance: this.getDistanceFromLatLonInKm(
            locPos[1].coords.latitude,
            locPos[1].coords.longitude,
            locPos[0].pos.lat,
            locPos[0].pos.lng
          ),
          myPos: {
            latitude: locPos[1].coords.latitude,
            longitude: locPos[1].coords.longitude
          },
          navLink: this.sanitizer.bypassSecurityTrustUrl(`google.navigation:q=${locPos[0].pos.lat},${locPos[0].pos.lng}`),
          geoLink: this.sanitizer.bypassSecurityTrustUrl(`http://maps.apple.com/maps?saddr=Current%20Location&daddr=${locPos[0].pos.lat},${locPos[0].pos.lng}`)

        })
      );
  }

  public getStations(rowNo?: number): Observable<any[]> {
    return this.db.list('/stations')
      // .do(()=> console.log('getStations'))
      ;
  }

  public getStationsWithDistance(rowNo?: number): Observable<any[]> {
    return this.getStations()
    .combineLatest(this.geolocationService.observeLocation())
    // .do(()=> console.log('Station-GeoLocation'))
    // .do((geoloc)=> console.log(geoloc))
    .map(locPos =>
      locPos[0]
        .map(marker =>
          Object.assign(marker, {
            distance: this.getDistanceFromLatLonInKm(
              locPos[1].coords.latitude,
              locPos[1].coords.longitude,
              marker.pos.lat,
              marker.pos.lng
            )
          })
        )
        .sort((stationA, stationB) => stationA.distance - stationB.distance)
        .slice(0, rowNo ? rowNo : 10)
    );
  }

  public findStationByName(term: string): Observable<string[]> {
    return this.getStations()
      .take(1)
      // .do(() => console.log('findStationByName'))
      .map(stations => stations
        .map(station => station.name)
        .filter(station =>
          typeof station === 'string' && station.toUpperCase().indexOf(term.toUpperCase()) > -1
        )
      );
  }


  ///////////////////////////////////////////////////////////////////////////
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
  ///////////////////////////////////////////////////////////////////////////

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
