import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JointContextmenuComponent } from './joint-contextmenu.component';

describe('JointContextmenuComponent', () => {
  let component: JointContextmenuComponent;
  let fixture: ComponentFixture<JointContextmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JointContextmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JointContextmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
