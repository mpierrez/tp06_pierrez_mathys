import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ApiService } from '../../../api.service';
import { Router, RouterModule } from '@angular/router';
import { RequiredComponent } from '../required/required.component';
import { LoginResponse } from './loginResponse';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, CommonModule, RouterModule, RequiredComponent],
    providers: [ApiService],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit{

  loginUserForm : FormGroup;
  errorMessage: string = localStorage.getItem('errorMessage') || '';
  alreadySubmitted: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router : Router) {}

  ngOnInit() {
    this.loginUserForm = this.fb.group({
      loginControl: ['', [Validators.required]],
      passwordControl: ['', [Validators.required]],
    });
  }

  get loginControl(): FormControl {
    return this.loginUserForm.get('loginControl') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginUserForm.get('passwordControl') as FormControl;
  }

  public validateTitleControl(titleControl: FormControl): string {
    if (titleControl.errors && (titleControl?.touched  || this.alreadySubmitted)) {
      if (titleControl.errors?.['required']) {
        return 'Le champ est obligatoire';
      }

      return 'Erreur inconnue';
    }
    return '';
  }

  submitForm() {
    this.errorMessage = '';
    localStorage.removeItem('errorMessage');
    this.alreadySubmitted = true;
    if (!this.loginUserForm.valid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    const { loginControl, passwordControl } = this.loginUserForm.value;

    this.apiService.loginClient(loginControl, passwordControl).subscribe(
      (res: LoginResponse) => {
        localStorage.setItem('token', res.accessToken);
        this.router.navigate(['/catalogue']);
      },
      (err) => {
        this.errorMessage = err.error;
        console.error(err);
      }
    );
    this.loginUserForm.reset();
    this.alreadySubmitted = false;
  }
}
