import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispercionAlphaComponent } from './dispercion-alpha.component';

describe('DispercionAlphaComponent', () => {
  let component: DispercionAlphaComponent;
  let fixture: ComponentFixture<DispercionAlphaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispercionAlphaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DispercionAlphaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
