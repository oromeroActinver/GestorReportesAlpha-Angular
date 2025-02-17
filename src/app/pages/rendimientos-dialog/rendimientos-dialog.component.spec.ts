import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientosDialogComponent } from './rendimientos-dialog.component';

describe('RendimientosDialogComponent', () => {
  let component: RendimientosDialogComponent;
  let fixture: ComponentFixture<RendimientosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientosDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RendimientosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
