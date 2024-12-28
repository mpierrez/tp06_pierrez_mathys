import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../api.service';
import { Client } from '../../../models/client';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RequiredComponent } from '../required/required.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-account',
  imports: [HeaderComponent, ReactiveFormsModule, CommonModule, RouterModule, RequiredComponent],
  providers: [ApiService],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  user$: Observable<Client>;
  userForm : FormGroup;
  errorMessage: string = '';
  alreadySubmitted: boolean = false;
  showSuccessMessage: boolean = false;

  constructor(private fb : FormBuilder, private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    // si l'utilisateur ne s'est pas encore connecté, on le redirige vers la page de login
    if (localStorage.getItem('token') === null) {
      localStorage.setItem('errorMessage', 'Vous devez être connecté pour accéder à cette page');
      this.router.navigate(['/login']);
    }

    this.userForm = this.fb.group({
      firstnameControl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      lastnameControl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      emailControl: ['', [Validators.required, Validators.email]],
      loginControl: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]*$/)]],
      passwordControl: ['', [Validators.required]],
      confirmPasswordControl: ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
    });

    this.user$ = this.apiService.getCurrentUserInfos();
    this.user$.subscribe(user => {
      this.userForm.patchValue({
        firstnameControl: user.firstname,
        lastnameControl: user.lastname,
        emailControl: user.email,
        loginControl: user.login,
        passwordControl: user.password,
        confirmPasswordControl: user.password
      });
    });
  }

  private passwordMatchValidator(control: FormControl): ValidationErrors | null {
      const password = this.userForm?.get('passwordControl')?.value;
      const confirmPassword = control.value;
      return password === confirmPassword ? null : { passwordsMismatch: true };
    }

  onSubmit() {
    this.errorMessage = '';
    this.alreadySubmitted = true;
    const { firstnameControl, lastnameControl, emailControl, loginControl, passwordControl, confirmPasswordControl } = this.userForm.value;

    if(passwordControl != confirmPasswordControl) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (!this.userForm.valid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    const user = {
      firstname: firstnameControl,
      lastname: lastnameControl,
      email: emailControl,
      login: loginControl,
      password: passwordControl,
    }

    this.apiService.updateUserInfos(user).subscribe(
      (res) => {
        this.showSuccessMessage = true;
      },
      (err) => {
        this.errorMessage = err.error;
        console.error(err);
      }
    );
    this.alreadySubmitted = false;
  }

  onDisconnect() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
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
          return 'Le champ doit être une adresse email valide';
        }

        if (titleControl.errors?.['pattern']) {
          return 'Le champ ne respecte pas le format attendu';
        }

        return 'Erreur non répertoriée';
      }
      return '';
    }

  get firstnameControl(): FormControl {
    return this.userForm.get('firstnameControl') as FormControl;
  }

  get lastnameControl() : FormControl {
    return this.userForm.get('lastnameControl')as FormControl;
  }

  get emailControl() : FormControl {
    return this.userForm.get('emailControl')as FormControl;
  }

  get loginControl() : FormControl {
    return this.userForm.get('loginControl')as FormControl;
  }

  get passwordControl() : FormControl {
    return this.userForm.get('passwordControl')as FormControl;
  }

  get confirmPasswordControl() : FormControl {
    return this.userForm.get('confirmPasswordControl')as FormControl;
  }
}
