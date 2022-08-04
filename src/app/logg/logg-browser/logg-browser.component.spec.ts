import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoggBrowserComponent } from './logg-browser.component';

describe('LoggBrowserComponent', () => {
  let component: LoggBrowserComponent;
  let fixture: ComponentFixture<LoggBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
