import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewDevelopmentComponent } from './interview-development.component';

describe('InterviewDevelopmentComponent', () => {
  let component: InterviewDevelopmentComponent;
  let fixture: ComponentFixture<InterviewDevelopmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewDevelopmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewDevelopmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
