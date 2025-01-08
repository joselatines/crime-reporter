import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerSVGComponent } from './spinner-svg.component';

describe('SpinnerSVGComponent', () => {
  let component: SpinnerSVGComponent;
  let fixture: ComponentFixture<SpinnerSVGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerSVGComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinnerSVGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
