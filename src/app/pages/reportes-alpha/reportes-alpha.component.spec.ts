import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesAlphaComponent } from './reportes-alpha.component';

describe('ReportesAlphaComponent', () => {
  let component: ReportesAlphaComponent;
  let fixture: ComponentFixture<ReportesAlphaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesAlphaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesAlphaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
