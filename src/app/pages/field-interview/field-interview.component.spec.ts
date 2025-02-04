import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldInterviewComponent } from './field-interview.component';

describe('FieldInterviewComponent', () => {
  let component: FieldInterviewComponent;
  let fixture: ComponentFixture<FieldInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
