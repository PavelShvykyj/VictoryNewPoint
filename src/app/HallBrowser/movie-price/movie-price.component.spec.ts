import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviePriceComponent } from './movie-price.component';

describe('MoviePriceComponent', () => {
  let component: MoviePriceComponent;
  let fixture: ComponentFixture<MoviePriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoviePriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
