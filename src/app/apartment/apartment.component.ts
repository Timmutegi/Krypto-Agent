import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-apartment',
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit, AfterViewInit, OnDestroy, OnInit {
  apartmentForm: FormGroup;
  apartmentData: FormData;
  updatedApartmentData: FormData;
  apartmentID: number;
  avatarBlobUrl: any;
  apartmentAvatar: any;
  toggle = true;
  submitted = false;
  message: string;
  photoMessage: string;
  deleteMessage: string;
  caretakers: [];
  branches: [];
  landlords: [];
  apartments: [];

  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private data: ApiService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.getBranches();
    this.getCaretakers();
    this.getLandlords();

    this.apartmentForm = this.formBuilder.group({
      landlord: [''],
      apartmentName: ['', Validators.required],
      apartmentCounty: ['', Validators.required],
      apartmentEstate: ['', Validators.required],
      branch: [''],
      apartmentLongitude: ['', [Validators.min(-180), Validators.max(180)]],
      apartmentLatitude: ['', [Validators.min(-90), Validators.max(90)]],
      apartmentStudentType: [''],
      caretaker: [''],
      apartmentAvatar: ['', Validators.required]
    });

    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    this.getApartments();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  getBranches() {
    this.data.getAuthData('branches/')
    .subscribe(
      res => {
        // console.log(res);
        this.branches = res.details;
      }
    );
  }

  getCaretakers() {
    this.data.getAuthData('caretakers/')
    .subscribe(
      res => {
        // console.log(res);
        this.caretakers = res.details;
      }
    );
  }

  getLandlords() {
    this.data.getAuthData('landlords/')
    .subscribe(
      res => {
        // console.log(res);
        this.landlords = res.details;
      }
    );
  }

  get f() {
    return this.apartmentForm.controls;
  }

  dismissAlert() {
    this.deleteMessage = null;
  }

  choosePhoto(file: any) {
    this.apartmentAvatar = file[0];
  }

  // function that opens modal and displays an image
  displayImage(url: string) {
    // console.log(url);
    if (url === null) {
      this.photoMessage = 'Unable to retrieve image or image is not available';
    } else {
      this.avatarBlobUrl = url;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.apartmentData = new FormData();

    if (this.apartmentForm.invalid) {
      return;
    }

    this.apartmentData.append('apartmentName', this.apartmentForm.get('apartmentName').value);
    this.apartmentData.append('apartmentCounty', this.apartmentForm.get('apartmentCounty').value);
    this.apartmentData.append('apartmentEstate', this.apartmentForm.get('apartmentEstate').value);
    this.apartmentData.append('branch', this.apartmentForm.get('branch').value);
    this.apartmentData.append('caretaker', this.apartmentForm.get('caretaker').value);
    this.apartmentData.append('landlord', this.apartmentForm.get('landlord').value);
    this.apartmentData.append('apartmentLongitude', this.apartmentForm.get('apartmentLongitude').value);
    this.apartmentData.append('apartmentLatitude', this.apartmentForm.get('apartmentLatitude').value);
    this.apartmentData.append('apartmentStudentType', this.apartmentForm.get('apartmentStudentType').value);
    this.apartmentData.append('apartmentAvatar', this.apartmentAvatar);

    this.data.postAuthData('apartments/', this.apartmentData).subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.apartmentForm.reset();
          this.submitted = false;
          this.getApartments();
          // this.rerender();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      }
    );
  }

  onUpdate(ID: number) {
    this.submitted = false;
    this.toggle = !this.toggle;
    this.apartmentID = ID;

    this.data.getAuthData(`apartments/${this.apartmentID}/`)
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.apartmentForm.patchValue({apartmentName: res.details.apartmentName});
          this.apartmentForm.patchValue({caretaker: res.details.caretaker});
          this.apartmentForm.patchValue({landlord: res.details.landlord});
          this.apartmentForm.patchValue({apartmentStudentType: res.details.apartmentStudentType});
        }
      }
    );
  }

  updateApartment() {
    this.updatedApartmentData = new FormData();
    this.submitted = true;

    this.updatedApartmentData.append('apartmentName', this.apartmentForm.get('apartmentName').value);
    this.updatedApartmentData.append('caretaker', this.apartmentForm.get('caretaker').value);
    this.updatedApartmentData.append('landlord', this.apartmentForm.get('landlord').value);
    this.updatedApartmentData.append('apartmentStudentType', this.apartmentForm.get('apartmentStudentType').value);


    this.data.putAuthData(`apartments/${this.apartmentID}/`, this.updatedApartmentData)
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.apartmentForm.reset();
          this.submitted = false;
          this.getApartments();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      }
    );
  }

  getApartments() {
    this.data.getAuthData('apartments/').subscribe(res => {
      // console.log(res);
      if (res.code === 200) {
        this.apartments = res.details;
        this.rerender();
      } else {
        this.message = res.details;
      }
    });
  }

  deleteApartment(apartmentID: number) {
    this.data.deleteAuthData(`apartments/${apartmentID}`).subscribe(res => {
      // console.log(res);
      if (res.code === 200) {
        this.getApartments();
        this.deleteMessage = res.details;
      } else {
        this.deleteMessage = res.details;
      }
    });
  }
}
