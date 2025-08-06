import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratosAlphaComponent } from './contratos-alpha.component';

describe('ContratosAlphaComponent', () => {
  let component: ContratosAlphaComponent;
  let fixture: ComponentFixture<ContratosAlphaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratosAlphaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratosAlphaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
