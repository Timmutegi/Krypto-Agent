import { Component, OnInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
   dtElement: DataTableDirective;
   dtOptions: DataTables.Settings = {};

  constructor() { }

  ngOnInit() {
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };
  }

}
