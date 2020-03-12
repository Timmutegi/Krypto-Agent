import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegionComponent } from './region/region.component';
import { CaretakerComponent } from './caretaker/caretaker.component';
import { TenantComponent } from './tenant/tenant.component';
import { LandlordComponent } from './landlord/landlord.component';
import { ApartmentComponent } from './apartment/apartment.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomComponent } from './room/room.component';
import { RoomClassificationComponent } from './room-classification/room-classification.component';


const routes: Routes = [
  {path: 'region', component: RegionComponent},
  {path: 'caretaker', component: CaretakerComponent},
  {path: 'tenant', component: TenantComponent},
  {path: 'landlord', component: LandlordComponent},
  {path: 'apartment', component: ApartmentComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'room', component: RoomComponent},
  {path: 'room/room-classification', component: RoomClassificationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
