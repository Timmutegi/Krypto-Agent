import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.css']
})
export class TenantComponent implements OnInit, OnDestroy {
  tenantForm: FormGroup;
  submitted = false;
  tenantData: FormData;
  tenantID: number;
  message: string;
  tenantAvatar: any;
  tenants: [];
  toggle = true;
  avatarBlobUrl: any;
  photoMessage: string;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<object[]> = new Subject();

  checked = true;

  constructor(private formBuilder: FormBuilder, private data: ApiService) {}

  get f() {
    return this.tenantForm.controls;
  }

  ngOnInit() {
    this.tenantForm = this.formBuilder.group({
      username: ['', ],
      tenantName: ['', Validators.required],
      phone: ['', [Validators.pattern('[7][0-9]{8}')]],
      national: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      room: [''],
      apartment: [''],
      photo: ['']
    });

    this.dtOptions = {
      pageLength: 10,
      pagingType: 'full_numbers'
    };

    this.getTenants();
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
    this.tenantAvatar = file[0];
  }

  dismissAlert() {
    this.message = null;
  }


  activeTenants() {
    this.checked = !this.checked;
  }

  getTenants() {
    this.data.getAuthData('tenants/').subscribe(
      res => {
        // console.log(res);
        if (res.code === 200) {
          this.tenants = res.details;
          this.dtTrigger.next();
        }
        if (res.code === 400) {
          this.message = 'No Tenants Yet';
        }
      }
    );
    this.rerender();
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
  displayImage(tenantID: number) {
    // console.log(tenantID);
    this.data.getImage(`tenants/${tenantID}/getavatar/`).subscribe(
      res => {
        // console.log(res);
        if (res === null) {
          this.photoMessage =
            'Unable to retrieve image or image is not available.';
        } else {
          this.photoMessage = 'Here is the image';
          this.avatarBlobUrl = this.createImageFromBlob(res);
        }
      }
    );
  }

  test() {
    this.toggle = !this.toggle;
  }

  onUpdate(ID: number) {
    this.toggle = !this.toggle;
    this.tenantID = ID;
  }

  updateTenant() {
    this.submitted = true;
    this.data
      .putAuthData(`tenants/${this.tenantID}/`, this.tenantData)
      .subscribe(
        res => {
          // console.log(res);
          if (res.code === 200) {
            this.tenantForm.reset();
            this.submitted = false;
          }
        }
      );
    this.rerender();
  }

  deleteTenant() {
    this.data.deleteAuthData(`tenants/${this.tenantID}/`).subscribe(
      res => {
        console.log(res);
      }
    );
    this.rerender();
  }

  onSubmit() {
    this.submitted = true;

    this.tenantData = new FormData();

    if (this.tenantForm.invalid) {
      return;
    }

    this.tenantData.append(
      'tenantNationalID',
      this.tenantForm.get('national').value
    );
    this.tenantData.append(
      'tenantName',
      this.tenantForm.get('tenantName').value
    );
    this.tenantData.append('tenantAvatar', this.tenantAvatar);
    this.tenantData.append(
      'tenantPhoneNumber',
      this.tenantForm.get('phone').value
    );
    this.tenantData.append('room', this.tenantForm.get('room').value);
    this.tenantData.append('username', this.tenantForm.get('username').value);
    this.tenantData.append('apartment', this.tenantForm.get('apartment').value);

    this.data.postAuthData('tenants/', this.tenantData).subscribe(
      res => {
        console.log(res);
        if (res.code === 200) {
          this.tenantForm.reset();
          this.submitted = false;
        }
      }
    );
    this.rerender();
  }
}
