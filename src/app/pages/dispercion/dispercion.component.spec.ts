import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispercionComponent } from './dispercion.component';

describe('DispercionComponent', () => {
  let component: DispercionComponent;
  let fixture: ComponentFixture<DispercionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispercionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DispercionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
