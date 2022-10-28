import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  login(password: string) {
    this.apiService.login(password).subscribe({
      next: res => {this.router.navigateByUrl('/')},
      error: error => {console.log(error)}
    });
    return false;
  }

}
