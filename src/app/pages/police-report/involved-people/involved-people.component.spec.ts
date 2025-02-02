import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvolvedPeopleComponent } from './involved-people.component';

describe('InvolvedPeopleComponent', () => {
  let component: InvolvedPeopleComponent;
  let fixture: ComponentFixture<InvolvedPeopleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvolvedPeopleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvolvedPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
