import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../services/error-handling.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  time = new Date();

  // tslint:disable-next-line:max-line-length
  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router, private errorHandler: ErrorHandlingService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

   get f() { return this.loginForm.controls; }

   onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    // console.log(this.loginForm.value);
    this.apiService.login('customusers/login/', this.loginForm.value)
    .subscribe(
      res => {
        // console.log(res);
        if (res.code === 400) {
          alert(res.details);
        }
        if (res.token != null) {
          localStorage.setItem('accessToken', res.token);

          // stores the token expiry time in local storage
          const time = new Date ();
          time.setTime(time.getTime() + (time.getTimezoneOffset() * 60 * 1000) + 10800000);
          time.setSeconds(time.getSeconds() + Number(res.expires_in));
          // console.log(time);
          localStorage.setItem('date', String(time));
          this.router.navigate(['/dashboard']);
        }
      },
      err => {
        this.errorHandler.handleError(err);
      }
    );
  }

}
