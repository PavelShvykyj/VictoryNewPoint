import { ClockService } from './clock.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockComponent } from './clock/clock.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ClockComponent],
  exports:[ClockComponent],
  providers:[ClockService]
})
export class ClockModule { }
