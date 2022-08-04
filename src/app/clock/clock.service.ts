import { Injectable } from '@angular/core';
import {Observable } from "rxjs";
import { share, map } from 'rxjs/operators';

@Injectable()
export class ClockService {

  private clock: Observable<Date>;
  
  constructor() { 
    this.clock = Observable.interval(1000).pipe(map(tick => new Date() ), share());
  }

  getClock(): Observable<Date> {
    return this.clock;
  }

}
