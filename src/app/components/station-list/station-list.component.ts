import { Component, OnInit } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { StationsService } from '../../services/stations.service';

@Component({
  selector: 'app-station-list',
  templateUrl: './station-list.component.html',
  styleUrls: ['./station-list.component.css']
})
export class StationListComponent implements OnInit {

  stations$: FirebaseListObservable<any[]>;

  constructor(
    private stationsService: StationsService
  ) {}
  
  ngOnInit() {
    this.stations$ = this.stationsService.getStations();
  }

}
