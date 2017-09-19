import { Component, OnInit } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { StationsService } from '../../services/stations.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-station-list',
  templateUrl: './station-list.component.html',
  styleUrls: ['./station-list.component.css']
})
export class StationListComponent implements OnInit {

  stations$: Observable<any[]>;

  constructor(
    private stationsService: StationsService
  ) {}
  model: any;
  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  search = (text$: Observable<string>) =>
    text$
    .filter(text => text.length > 2)
    .debounceTime(500)
    .distinctUntilChanged()
    .do(() => this.searching = true)
    .switchMap(term =>
      this.stationsService.findStationByName(term)
        .do(() => this.searchFailed = false)
        .catch(() => {
          this.searchFailed = true;
          return Observable.of([]);
        }))
    .do(() => this.searching = false)
    .merge(this.hideSearchingWhenUnsubscribed)

  // search = this.stationsService.findStationByName();

  ngOnInit() {
    console.log('StationListComponent - ngOnInit');
    this.stations$ = this.stationsService.getStations(2);
  }

}
