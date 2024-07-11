import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporUploadComponent } from './repor-upload.component';

describe('ReporUploadComponent', () => {
  let component: ReporUploadComponent;
  let fixture: ComponentFixture<ReporUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
