import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldInterviewFormComponent } from './field-interview-form.component';

describe('FieldInterviewFormComponent', () => {
  let component: FieldInterviewFormComponent;
  let fixture: ComponentFixture<FieldInterviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldInterviewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldInterviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
