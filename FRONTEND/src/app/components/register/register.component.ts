import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ApiService } from '../../../api.service';
import { RouterModule } from '@angular/router';
import { RequiredComponent } from '../required/required.component';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, CommonModule, RouterModule, RequiredComponent],
    providers: [ApiService],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit{
  registerUserForm : FormGroup;
  errorMessage: string = '';
  alreadySubmitted: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit() {
    this.registerUserForm = this.fb.group({
      firstnameControl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      lastnameControl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      emailControl: ['', [Validators.required, Validators.email]],
      loginControl: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      passwordControl: ['', [Validators.required]],
      confirmPasswordControl: ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
    }
  );
  }

  private passwordMatchValidator(control: FormControl): ValidationErrors | null {
    const password = this.registerUserForm?.get('passwordControl')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  get firstnameControl(): FormControl {
    return this.registerUserForm.get('firstnameControl') as FormControl;
  }

  get lastnameControl(): FormControl {
    return this.registerUserForm.get('lastnameControl') as FormControl;
  }

  get emailControl(): FormControl {
    return this.registerUserForm.get('emailControl') as FormControl;
  }

  get loginControl(): FormControl {
    return this.registerUserForm.get('loginControl') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.registerUserForm.get('passwordControl') as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.registerUserForm.get('confirmPasswordControl') as FormControl;
  }

  public validateTitleControl(titleControl: FormControl): string {
    if(titleControl.errors?.['passwordsMismatch']) {
      return 'Les mots de passe ne correspondent pas';
    }

    if (titleControl.errors && (titleControl?.touched  || this.alreadySubmitted)) {
      if (titleControl.errors?.['required']) {
        return 'Le champ est obligatoire';
      }

      if (titleControl.errors?.['minlength']) {
        return `Le champ doit contenir au moins ${titleControl.errors['minlength'].requiredLength} caractères`;
      }
      if (titleControl.errors?.['maxlength']) {
        return `Le champ doit contenir au plus ${titleControl.errors['maxlength'].requiredLength} caractères`;
      }

      if(titleControl.errors?.['email']) {
        return 'Le champ doit être un email valide';
      }

      if (titleControl.errors?.['pattern']) {
        return 'Le champ ne doit contenir que des lettres';
      }

      return 'Erreur inconnue';
    }
    return '';
  }

  submitForm() {
    this.errorMessage = '';
    this.alreadySubmitted = true;

    if(this.registerUserForm.value.passwordControl !== this.registerUserForm.value.confirmPasswordControl) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.registerUserForm.valid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    const client = {
      firstname: this.registerUserForm.value.firstnameControl,
      lastname: this.registerUserForm.value.lastnameControl,
      email: this.registerUserForm.value.emailControl,
      login: this.registerUserForm.value.loginControl,
      password: this.registerUserForm.value.passwordControl
    };

    this.apiService.registerClient(client).subscribe(
      (res) => {
        window.location.href = '/login';
      },
      (error) => {
        this.errorMessage = error.error;
        console.error('Register request failed', error);
      }
    );

    this.registerUserForm.reset();
    this.alreadySubmitted = false;
  }
}
