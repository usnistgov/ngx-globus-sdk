import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxGlobusSdkComponent } from './ngx-globus-sdk.component';

describe('NgxGlobusSdkComponent', () => {
  let component: NgxGlobusSdkComponent;
  let fixture: ComponentFixture<NgxGlobusSdkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxGlobusSdkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxGlobusSdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
