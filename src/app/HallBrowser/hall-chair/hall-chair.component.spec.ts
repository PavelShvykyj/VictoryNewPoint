import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HallChairComponent } from './hall-chair.component';

describe('HallChairComponent', () => {
  let component: HallChairComponent;
  let fixture: ComponentFixture<HallChairComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HallChairComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HallChairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
