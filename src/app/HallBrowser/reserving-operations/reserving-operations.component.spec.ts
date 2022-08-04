import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservingOperationsComponent } from './reserving-operations.component';

describe('ReservingOperationsComponent', () => {
  let component: ReservingOperationsComponent;
  let fixture: ComponentFixture<ReservingOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservingOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservingOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
