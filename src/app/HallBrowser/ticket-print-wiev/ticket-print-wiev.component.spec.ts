import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPrintWievComponent } from './ticket-print-wiev.component';

describe('TicketPrintWievComponent', () => {
  let component: TicketPrintWievComponent;
  let fixture: ComponentFixture<TicketPrintWievComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketPrintWievComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPrintWievComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
