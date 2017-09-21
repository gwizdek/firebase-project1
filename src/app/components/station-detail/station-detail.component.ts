import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { StationsService } from '../../services/stations.service';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-station-detail',
  templateUrl: './station-detail.component.html',
  styleUrls: ['./station-detail.component.css']
})
export class StationDetailComponent implements OnInit {
  stationDistance: number;
  station: any;
  station$: Observable<any>;
  stationSubs: Subscription;
  stationId;

  constructor(
    private route: ActivatedRoute,
    private stationsService: StationsService
  ) { }

  ngOnInit() {
    // console.log(+this.route.snapshot.params.id);

    this.stationSubs = this.stationsService
      .getStationDetails(+this.route.snapshot.params.id)
      .subscribe(station => {
        this.station = station;
      });
    // this.stations$ = this.route.paramMap
    //   .switchMap((params: ParamMap) => {
    //     console.log(params);
    //     // (+) before `params.get()` turns the string into a number
    //     this.stationId = +params.get('id');
    //     // return this.service.getHeroes();
    //     return Observable.of(params);
    //   });
  }

}
