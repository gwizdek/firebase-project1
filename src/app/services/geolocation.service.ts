import {Injectable, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';



const GEOLOCATION_ERRORS = {
  'errors.location.unsupportedBrowser': 'Browser does not support location services',
  'errors.location.permissionDenied': 'You have rejected access to your location',
  'errors.location.positionUnavailable': 'Unable to determine your location',
  'errors.location.timeout': 'Service timeout has been reached'
};

const locationConfig = {
  refreshRate: 2000,
  enableHighAccuracy: true
};

@Injectable()
export class GeolocationService implements OnInit, OnDestroy {

		// ident
    private watchId = null;
    private location$: BehaviorSubject<any>;
    private counter = 0;

    constructor() {
      this.location$ = new BehaviorSubject<any>({
        coords: {
          latitude: 50,
          longitude: 19
        }
      });

      if (window.navigator && window.navigator.geolocation) {
        this.watchId = window.navigator.geolocation.watchPosition(
          (position) => {
            console.log(`watch ID: ${this.watchId}, Counter: ${++this.counter}`);
            this.location$.next(position);
          },
          (error) => {
            switch (error.code) {
              case 1:
              this.location$.error(GEOLOCATION_ERRORS['errors.location.permissionDenied']);
              break;
              case 2:
              this.location$.error(GEOLOCATION_ERRORS['errors.location.positionUnavailable']);
              break;
              case 3:
              this.location$.error(GEOLOCATION_ERRORS['errors.location.timeout']);
              break;
            }
        });
      } else {
        this.location$.error(GEOLOCATION_ERRORS['errors.location.unsupportedBrowser']);
      }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
      console.log('DESTR');
      navigator.geolocation.clearWatch(this.watchId);
    }

    public observeLocation(): Observable<any> {
      return this.location$;
    }
}
