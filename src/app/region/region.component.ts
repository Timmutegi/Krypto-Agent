import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApiService } from '../services/api.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.css']
})

export class RegionComponent implements  OnDestroy, OnInit, AfterViewInit {
  regionForm: FormGroup;
  submitted = false;
  regions: [];
  toggle = true;
  ID: number;
  message: string;
  deleteMessage: string;

  @ViewChild(DataTableDirective, {static: false})

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private formBuilder: FormBuilder, private api: ApiService) { }

  ngOnInit() {
    this.regionForm = this.formBuilder.group({
      regionName: ['', Validators.required],
      regionCounty: ['', Validators.required]
    });

    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    // this.getRegions();
  }

  getRegions() {
    this.api.getAuthData('regions/').subscribe((res) => {
      console.log(res);
      if (res.code === 200) {
        this.regions = res.details;
        this.dtTrigger.next();
      }
    });
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
       dtInstance.destroy();
       this.dtTrigger.next();
     });
  }

  get f() { return this.regionForm.controls; }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onSubmit() {
    this.submitted = true;

    if (this.regionForm.invalid) {
      return;
    }
    // console.log(this.regionForm.value);
    this.api.postAuthData('regions/', this.regionForm.value)
    .subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.regionForm.reset();
          this.submitted = false;
          this.getRegions();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      }
    );
  }

  dismissAlert() {
    this.message = null;
  }

  onUpdate(regionID: number) {
    this.submitted = false;
    this.toggle = !this.toggle;
    this.ID = regionID;

    this.api.getAuthData(`regions/${this.ID}/`)
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.regionForm.patchValue({regionName: res.details.regionName});
          this.regionForm.patchValue({regionCounty: res.details.regionCounty});
        }
      }
    );

  }

  deleteRegion(regionID: number ) {
    this.api.deleteAuthData(`regions/${regionID}/`)
    .subscribe(
      res => {
        if (res.code === 200) {
          this.getRegions();
          this.deleteMessage = res.details;
        } else {
          this.deleteMessage = res.details;
        }
      }
    );
  }

  updateRegion() {
    this.submitted = true;
    this.api.putAuthData(`regions/${this.ID}/`, this.regionForm.value)
    .subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.regionForm.reset();
          this.submitted = false;
          this.getRegions();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
    });
  }
}
