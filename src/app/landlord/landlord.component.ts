import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-landlord',
  templateUrl: './landlord.component.html',
  styleUrls: ['./landlord.component.css']
})
export class LandlordComponent implements OnInit, OnDestroy, AfterViewInit {
  landlordForm: FormGroup;
  submitted = false;
  landlordData: FormData;
  updatedLandlordData: FormData;
  updateAvatar: FormData;
  updateNationalID: number;
  landlordAvatar: any;
  landlords: [];
  toggle = false;
  landlordID: number;
  avatarBlobUrl: any;
  photoMessage: string;
  showInput: boolean;
  showButton: boolean;
  message: string;
  deleteMessage; string;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private formBuilder: FormBuilder, private data: ApiService) {}

  ngOnInit() {
    this.landlordForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      national: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,5}$')]],
      primaryPhone: [
        '',
        [Validators.required, Validators.pattern('[7][0-9]{8}')]
      ],
      secondaryPhone: [],
      photo: ['', Validators.required]
    });

    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    this.getLandlords();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
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

  choosePhoto(file) {
    this.landlordAvatar = file[0];
  }

  dismissAlert() {
    this.message = null;
  }

  get f() {
    return this.landlordForm.controls;
  }


  getLandlords() {
    this.data.getAuthData('landlords/').subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.landlords = res.details;
          this.rerender();
        } else {
          this.message = res.details;
        }
      });
    this.rerender();
  }

  deleteLandlord(ID: number) {
    console.log(ID);
    this.data.deleteAuthData(`landlords/${ID}/`).subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.getLandlords();
          this.deleteMessage = res.details;
        } else {
          this.deleteMessage = res.details;
        }
      });
  }

  onSubmit() {
    this.submitted = true;
    this.landlordData = new FormData();

    if (this.landlordForm.invalid) {
      return;
    }

    // console.log(this.landlordAvatar);

    this.landlordData.append(
      'username',
      this.landlordForm.get('username').value
    );
    this.landlordData.append(
      'landlordNationalID',
      this.landlordForm.get('national').value
    );
    this.landlordData.append(
      'landlordEmailAddress',
      this.landlordForm.get('email').value
    );
    this.landlordData.append(
      'landlordPrimaryPhoneNumber',
      this.landlordForm.get('primaryPhone').value
    );
    this.landlordData.append(
      'landlordSecondaryPhoneNumber',
      this.landlordForm.get('secondaryPhone').value
    );
    this.landlordData.append('landlordAvatar', this.landlordAvatar);
    this.landlordData.append(
      'landlordName',
      this.landlordForm.get('fullname').value
    );

    this.data.postAuthData('landlords/', this.landlordData).subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.landlordForm.reset();
          this.submitted = false;
          this.getLandlords();
          this.message = res.details;
        } else {
          this.message = res.details;
        }
      });
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();

    if (image) {
      reader.readAsDataURL(image);
    }

    reader.addEventListener(
      'loadend',
      () => {
        this.avatarBlobUrl = reader.result;
        // console.log(this.avatarBlobUrl);
      },
      false
    );
  }

  // function that opens modal and displays an image
  displayImage(landlordID: number, nationalID: number) {
    console.log(landlordID);
    this.updateNationalID = nationalID;
    this.data.getImage(`landlords/${landlordID}/getavatar/`).subscribe(
      res => {
        console.log(res);
        if (res === null) {
          this.photoMessage =
            'Unable to retrieve image or image is not available.';
        } else {
          this.photoMessage = 'Here is the image';
          this.avatarBlobUrl = this.createImageFromBlob(res);
        }
      });
  }

  chooseImage() {
    this.showInput = !this.showInput;
  }

  updateImage(updatedimage) {
    // alert(this.updateNationalID);
    this.updateAvatar = new FormData();
    // this.showButton = !this.showButton;

    this.updateAvatar.append('landlordNationalID', updatedimage.value);
    this.updateAvatar.append('landlordAvatar', this.landlordAvatar);

    this.data
      .postAuthData('landlords/updateavatar/', this.updateAvatar)
      .subscribe(res => {
        console.log(res);
        if (res.code === 200) {
          this.photoMessage = res.details;
        } else {
          this.photoMessage = res.details;
        }
      });
  }

  onUpdate(ID: number) {
    this.submitted = false;
    this.toggle = !this.toggle;
    this.landlordID = ID;

    this.data.getAuthData(`landlords/${this.landlordID}`)
    .subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.landlordForm.patchValue({fullname: res.details.landlordName});
          this.landlordForm.patchValue({primaryPhone: res.details.landlordPrimaryPhoneNumber});
          this.landlordForm.patchValue({secondaryPhone: res.details.landlordSecondaryPhoneNumber});
          this.landlordForm.patchValue({email: res.details.landlordEmailAddress});
        }
      });
  }

  updateLandlord() {
    this.updatedLandlordData = new FormData();
    this.submitted = true;

    this.updatedLandlordData.append(
      'landlordEmailAddress',
      this.landlordForm.get('email').value
    );
    this.updatedLandlordData.append(
      'landlordPrimaryPhoneNumber',
      this.landlordForm.get('primaryPhone').value
    );
    this.updatedLandlordData.append(
      'landlordSecondaryPhoneNumber',
      this.landlordForm.get('secondaryPhone').value
    );
    this.updatedLandlordData.append(
      'landlordName',
      this.landlordForm.get('fullname').value
    );

    this.data
      .putAuthData(`landlords/${this.landlordID}/`, this.updatedLandlordData)
      .subscribe(
        res => {
          console.log(res);
          if (res.code === 200) {
            this.landlordForm.reset();
            this.submitted = false;
            this.getLandlords();
            this.message = res.details;
          } else {
            this.message = res.details;
          }
        });
  }
}
