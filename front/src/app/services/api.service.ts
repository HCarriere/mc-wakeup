import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, map, Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private httpClient: HttpClient,
        private router: Router,
        private jwtHelper: JwtHelperService,
    ) {
    }

    public wakeUp(): Observable<any> {
        return this.httpClient.post<any>('/api/wakeupmc', {});
    }

    public getServerStatus(): Observable<boolean> {
        return this.httpClient.get<boolean>('/api/serverstatus', {});
    }

    public login(password: string): Observable<any> {
        return this.httpClient.post<any>('/api/auth', {password}).pipe(
            map(data => {
                this.setSession(data.accessToken);
                return data;
            }),
            catchError((err, caught) => {
                this.router.navigateByUrl('/login');
                throw err;
            })
        );
    }


    public isLoggedIn(): boolean {
        const token = localStorage.getItem('token') || '';
        return !this.jwtHelper.isTokenExpired(token);
    }

    private setSession(token: string) {
        localStorage.setItem('token', token);
    }
}