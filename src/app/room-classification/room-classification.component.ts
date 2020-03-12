import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-classification',
  templateUrl: './room-classification.component.html',
  styleUrls: ['./room-classification.component.css']
})
export class RoomClassificationComponent
  implements OnInit, AfterViewInit, OnDestroy {
  roomForm: FormGroup;
  roomClassificationData: FormData;
  updatedRoomData: FormData;
  submitted = false;
  toggle = false;
  message: string;
  deleteMessage: string;
  roomsClass: [];
  apartments: [];
  apartmentRooms: [];
  roomPhoto1: any;
  roomPhoto2: any;
  roomPhoto3: any;
  roomPhoto4: any;
  showInput: boolean;
  roomID: number;
  showTable = false;
  url = true;
  choose = false;
  photoMessage: string;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private formBuilder: FormBuilder, private data: ApiService, private router: Router) {}

  ngOnInit() {
    this.getApartments();

    this.roomForm = this.formBuilder.group({
      apartment: ['', Validators.required],
      roomRent: ['', Validators.required],
      roomType: ['', Validators.required],
      roomClassification: ['', Validators.required],
      photo1: ['', Validators.required],
      photo2: ['', Validators.required],
      photo3: [''],
      photo4: ['']
    });

    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    // this.getRoomClasifications();
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

  choosePhoto1(file: any, name: string) {
    this.roomPhoto1 = file[0];
    console.log(this.roomPhoto1);
  }

  choosePhoto2(file: any) {
    this.roomPhoto2 = file[0];
  }

  choosePhoto3(file: any) {
    this.roomPhoto3 = file[0];
  }

  choosePhoto4(file: any) {
    this.roomPhoto4 = file[0];
  }

  viewPhotos(ID: number, photo1: string, photo2: string, photo3: string, photo4: string) {
    this.roomID = ID;

    if (photo1 === null) {
       this.url = false;
     } else {
       this.roomPhoto1 = photo1;
     }

    if (photo2 === null) {
       this.url = false;
     } else {
       this.roomPhoto2 = photo2;
     }

    if (photo3 === null) {
       this.url = false;
     } else {
       this.roomPhoto3 = photo3;
     }

    if (photo4 === null) {
       this.url = false;
     } else {
       this.roomPhoto4 = photo4;
     }
  }

  updatePhotos() {
    this.choose = !this.choose;
  }

  savePhoto1() {
    console.log(this.roomID);
    this.data.putAuthData(`roomsclassification/${this.roomID}/updateroomphotos/`, this.roomPhoto1)
    .subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.photoMessage = 'Photo one successfully updated';
        } else {
          this.photoMessage = 'res.details';
        }
      }
    );

  }

  dismissAlert() {
    this.message = null;
  }

  showApartmentRooms(apartmentID) {
    // console.log(apartmentID);
    // this.showTable = true;
    this.data.getAuthData(`roomsclassification/apartmentrooms/?apartmentID=${apartmentID}`)
    .subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
           this.apartmentRooms = res.details;
           this.showTable = true;
           this.rerender();
        } else {
          this.message = res.details;
        }
      }
    );
  }

  getRoomClasifications() {
    this.data.getAuthData('roomsclassification/').subscribe(res => {
      console.log(res);
      if (res.code === 200) {
        this.roomsClass = res.details;
        this.rerender();
      } else {
        this.message = res.details;
      }
    });
    this.rerender();
  }

  getApartments() {
    this.data.getAuthData('apartments/').subscribe(res => {
      // console.log(res);
      if (res.code === 200) {
        this.apartments = res.details;
      } else {
        this.message = res.details;
      }
    });
  }

  deleteRoomClassification(ID: number) {
    console.log(ID);
    this.data.deleteAuthData(`roomsclassification/${ID}/`).subscribe(res => {
      console.log(res);
      if (res.code === 200) {
        this.getRoomClasifications();
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

    this.roomClassificationData = new FormData();

    this.roomClassificationData.append(
      'roomClass',
      this.roomForm.get('roomClassification').value
    );
    this.roomClassificationData.append(
      'roomRent',
      this.roomForm.get('roomRent').value
    );
    this.roomClassificationData.append(
      'roomType',
      this.roomForm.get('roomType').value
    );
    this.roomClassificationData.append(
      'roomApartment',
      this.roomForm.get('apartment').value
    );
    this.roomClassificationData.append('roomPhotoOne', this.roomPhoto1);
    this.roomClassificationData.append('roomPhotoTwo', this.roomPhoto2);
    this.roomClassificationData.append('roomPhotoThree', this.roomPhoto3);
    this.roomClassificationData.append('roomPhotoFour', this.roomPhoto4);

    this.data.postAuthData('roomsclassification/', this.roomClassificationData).subscribe(res => {
      console.log(res);
      if (res.code === 200) {
        this.roomForm.reset();
        this.submitted = false;
        this.getRoomClasifications();
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
    // console.log(this.roomID);

  }

  updateRoomClassification() {
    console.log(this.roomID);
    this.submitted = true;

    this.updatedRoomData = new FormData();

    this.updatedRoomData.append('roomRent', this.roomForm.get('roomRent').value);

    // if (this.roomForm.invalid) {
    //   return;
    // }
    this.data
      .putAuthData(`roomsclassification/${this.roomID}/`, this.updatedRoomData)
      .subscribe(res => {
        console.log(res);
        if (res.code === 200) {
          this.roomForm.reset();
          this.submitted = false;
          this.rerender();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      });
  }
}
