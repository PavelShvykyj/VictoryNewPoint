import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingOperationsComponent } from './searching-operations.component';

describe('SearchingOperationsComponent', () => {
  let component: SearchingOperationsComponent;
  let fixture: ComponentFixture<SearchingOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchingOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchingOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
