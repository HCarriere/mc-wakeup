import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public serverStatus: 'on'|'off'|'unknown' = 'unknown';

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.pingHost();
  }

  pingHost() {
    this.serverStatus = 'unknown';
    this.apiService.getServerStatus().subscribe({
      next: res => { this.serverStatus = res ? 'on' : 'off'; },
      error: error => {console.log(error)}
    });
  }

  wakeUp() {
    this.apiService.wakeUp().subscribe({
      next: res => {},
      error: error => {console.log(error)}
    });
  }
}
