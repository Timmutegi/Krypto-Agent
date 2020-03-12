import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RegionComponent } from './region/region.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { CaretakerComponent } from './caretaker/caretaker.component';
import { ApartmentComponent } from './apartment/apartment.component';
import { LandlordComponent } from './landlord/landlord.component';
import { TenantComponent } from './tenant/tenant.component';
import { MainComponent } from './main/main.component';
import { RoomComponent } from './room/room.component';
import { RoomClassificationComponent } from './room-classification/room-classification.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SidebarComponent,
    RegionComponent,
    CaretakerComponent,
    ApartmentComponent,
    LandlordComponent,
    TenantComponent,
    MainComponent,
    RoomComponent,
    RoomClassificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
