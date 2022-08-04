import { Observable } from 'rxjs/Observable';
import { Component, OnInit } from '@angular/core';
import { ClockService } from '../clock.service';

@Component({
  selector: 'clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit {

  clock$ : Observable<Date> ;

  constructor(private clockSourse : ClockService) {
    this.clock$ = this.clockSourse.getClock();
   }

  ngOnInit() {
  
  }

}
