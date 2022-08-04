import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelOperationComponent } from './cancel-operation.component';

describe('CancelOperationComponent', () => {
  let component: CancelOperationComponent;
  let fixture: ComponentFixture<CancelOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
