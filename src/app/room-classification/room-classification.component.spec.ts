import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomClassificationComponent } from './room-classification.component';

describe('RoomClassificationComponent', () => {
  let component: RoomClassificationComponent;
  let fixture: ComponentFixture<RoomClassificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomClassificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
