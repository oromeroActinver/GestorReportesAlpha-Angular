import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculaRendimientosComponent } from './calcula-rendimientos.component';

describe('CalculaRendimientosComponent', () => {
  let component: CalculaRendimientosComponent;
  let fixture: ComponentFixture<CalculaRendimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculaRendimientosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculaRendimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
