import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';

import { AppComponent } from './components/app.component';
import { GeolocationService } from './services/geolocation.service';
import { StationsService } from './services/stations.service';
import { StationListComponent } from './components/station-list/station-list.component';
import { StationDetailComponent } from './components/station-detail/station-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    StationListComponent,
    StationDetailComponent
  ],
  imports: [
    NgbModule.forRoot(),
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsKey
    }),
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/stations',
        pathMatch: 'full'
      },
      {
        path: 'station/:id',
        component: StationDetailComponent
      },
      {
        path: 'stations',
        component: StationListComponent
      },
      {
        path: '**',
        redirectTo: '/stations',
        pathMatch: 'full'
      },
    ])
  ],
  providers: [
    GeolocationService,
    StationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
