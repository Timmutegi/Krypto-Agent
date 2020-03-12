import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApiService } from '../services/api.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-caretaker',
  templateUrl: './caretaker.component.html',
  styleUrls: ['./caretaker.component.css']
})
export class CaretakerComponent implements OnInit, OnDestroy, AfterViewInit {
  caretakerForm: FormGroup;
  caretakerData: FormData;
  updatedCaretakerData: FormData;
  ID: number;
  submitted = false;
  caretakers: [];
  toggle = true;
  caretakerAvatar: any;
  avatarBlobUrl: any;
  photoMessage: string;
  branches: [];
  showButton: boolean;
  showInput: boolean;
  updateNationalID: number;
  updateAvatar: any;
  message: string;
  deleteMessage: string;

  @ViewChild(DataTableDirective, { static: false })

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  constructor(private data: ApiService, private formBuilder: FormBuilder) {}

  get f() {
    return this.caretakerForm.controls;
  }

  ngOnInit() {
    this.getBranches();
    this.caretakerForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      national: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('[7][0-9]{8}')]],
      photo: ['', Validators.required],
      branch: ['']
    });
    // Datatable settings
    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    this.getCaretakers();
  }
  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  getBranches() {
    // alert('hi');
    this.data.getAuthData('branches/').subscribe(
      res => {
        if (res.code === 200) {
          this.branches = res.details;
        }
      });
  }

  getCaretakers() {
    this.data.getAuthData('caretakers/').subscribe(res => {
      // console.log(res);
      if (res.code === 200) {
        this.caretakers = res.details;
        this.rerender();
      } else {
        this.message = res.details;
      }
    });
  }

  choosePhoto(file) {
    this.caretakerAvatar = file[0];
  }

  dismissAlert() {
    this.message = null;
  }

  onSubmit() {
    this.submitted = true;
    this.caretakerData = new FormData();

    if (this.caretakerForm.invalid) {
      return;
    }

    this.caretakerData.append(
      'caretakerName',
      this.caretakerForm.get('fullname').value
    );
    this.caretakerData.append(
      'username',
      this.caretakerForm.get('username').value
    );
    this.caretakerData.append(
      'caretakerNationalID',
      this.caretakerForm.get('national').value
    );
    this.caretakerData.append(
      'caretakerPhoneNumber',
      this.caretakerForm.get('phoneNumber').value
    );
    this.caretakerData.append('branch', this.caretakerForm.get('branch').value);
    this.caretakerData.append('caretakerAvatar', this.caretakerAvatar);

    this.data.postAuthData('caretakers/', this.caretakerData).subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.caretakerForm.reset();
          this.submitted = false;
          this.getCaretakers();
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
  displayImage(caretakerID: number, nationalID: number) {
    console.log(caretakerID);
    this.updateNationalID = nationalID;
    this.data.getImage(`caretakers/${caretakerID}/getavatar/`).subscribe(
      res => {
        console.log(res);
        if (res === null) {
          this.photoMessage = 'Unable to retrieve image or image is not available.';
        } else {
          // this.photoMessage = 'Here is the image';
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

    this.updateAvatar.append('caretakerNationalID', updatedimage.value);
    this.updateAvatar.append('caretakerAvatar', this.caretakerAvatar);

    this.data
      .postAuthData('caretakers/updateavatar/', this.updateAvatar)
      .subscribe(res => {
        console.log(res);
        if (res.code === 200) {
          this.photoMessage = res.details;
        } else {
          this.photoMessage = res.details;
        }
      });
  }

  onUpdate(caretakerID: number) {
    this.submitted = false;
    this.toggle = !this.toggle;
    this.ID = caretakerID;

    this.data.getAuthData(`caretakers/${this.ID}/`)
    .subscribe(
      res => {
         if (res.code === 200) {
           this.caretakerForm.patchValue({fullname: res.details.caretakerName});
           this.caretakerForm.patchValue({phoneNumber: res.details.caretakerPhoneNumber});
           this.caretakerForm.patchValue({branch: res.details.branch.branchName});
         }
      }
    );
  }

  updateCaretaker() {
    this.submitted = true;
    this.updatedCaretakerData = new FormData();

    this.updatedCaretakerData.append(
      'caretakerName',
      this.caretakerForm.get('fullname').value
    );
    this.updatedCaretakerData.append(
      'caretakerPhoneNumber',
      this.caretakerForm.get('phoneNumber').value
    );
    this.updatedCaretakerData.append(
      'branch',
      this.caretakerForm.get('branch').value
    );

    this.data
      .putAuthData(`caretakers/${this.ID}/`, this.updatedCaretakerData)
      .subscribe(
        res => {
          console.log(res);
          if (res.code === 200) {
            this.submitted = false;
            this.caretakerForm.reset();
            this.getCaretakers();
            this.message = res.details;
          } else {
            this.message = res.details;
          }
        }
      );
  }

  deleteCaretaker(caretakerID: number) {
    this.data.deleteAuthData(`caretakers/${caretakerID}/`)
    .subscribe(
      res => {
      console.log(res);
      if (res.code === 200) {
        this.getCaretakers();
        this.deleteMessage = res.details;
      } else {
        this.deleteMessage = res.details;
      }
    });
  }
}
