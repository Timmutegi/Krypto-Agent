import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, AfterViewInit, OnDestroy {
  roomForm: FormGroup;
  submitted = false;
  toggle = false;
  message: string;
  deleteMessage: string;
  rooms: [];
  apartments: [];
  showInput: boolean;
  roomID: number;
  apartmentID: string;
  classifications: [];

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private formBuilder: FormBuilder, private data: ApiService) {}

  ngOnInit() {
    this.getApartments();

    this.roomForm = this.formBuilder.group({
      apartment: ['', Validators.required],
      roomStatus: [''],
      roomFloor: ['', Validators.required],
      roomNumber: ['', Validators.required],
      roomType: ['', Validators.required],
      booked: [''],
      roomClassification: ['']
    });

    this.dtOptions = {
       pageLength: 10,
       pagingType: 'full_numbers'
     };

    this.getRooms();
  }

  get f() {
    return this.roomForm.controls;
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  dismissAlert() {
    this.message = null;
  }

  getApartmentID(ID: string) {
    this.apartmentID = ID;
    this.getApartmentRoomClassifications();
  }

  getApartmentRoomClassifications() {
    this.data.getAuthData(`roomsclassification/apartmentrooms/?apartmentID=${this.apartmentID}`)
    .subscribe(
      res => {
        if (res.code === 200) {
          this.classifications = res.details;
        } else {
          this.message = res.details;
        }
      }
    );
  }

  getRooms() {
    this.data.getAuthData('rooms/').subscribe(res => {
      console.log(res);
      if (res.code === 200) {
        this.rooms = res.details;
        this.rerender();
      } else {
        this.message = res.details;
      }
    });
  }

  getApartments() {
    this.data.getAuthData('apartments/')
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.apartments = res.details;
        } else {
          this.message = res.details;
        }
      }
    );
  }

  deleteRoom(ID: number) {
    // console.log(ID);
    this.data.deleteAuthData(`rooms/${ID}/`).subscribe(res => {
      // console.log(res);
      if (res.code === 200) {
        this.getRooms();
        this.deleteMessage = res.details;
      } else {
        this.deleteMessage = res.details;
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.roomForm.invalid) {
      return;
    }

    this.data.postAuthData('rooms/', this.roomForm.value)
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.roomForm.reset();
          this.submitted = false;
          this.getRooms();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
    });
  }

  onUpdate(ID: number) {
    this.submitted = false;
    this.toggle = !this.toggle;
    this.roomID = ID;

    this.data.getAuthData(`rooms/${this.roomID}`).subscribe(res => {
      console.log(res);
      if (res.code === 200) {
        this.roomForm.patchValue({ apartment: res.apartment });
        this.roomForm.patchValue({ status: res.details.roomStatus });
        this.roomForm.patchValue({ roomFloor: res.details.roomFloor });
        this.roomForm.patchValue({ roomNumber: res.details.roomNumber });
        this.roomForm.patchValue({ roomType: res.details.roomType });
        this.roomForm.patchValue({ booked: res.details.booked });
        this.roomForm.patchValue({ roomClassification: res.details.roomClassification});
      }
    });
  }

  updateroom() {
    this.submitted = true;

    this.data
      .putAuthData(`rooms/${this.roomID}/`, this.roomForm.value)
      .subscribe(res => {
        console.log(res);
        if (res.code === 200) {
          this.roomForm.reset();
          this.submitted = false;
          this.getRooms();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      });
  }
}
