import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminservices } from './adminservices';

describe('Adminservices', () => {
  let component: Adminservices;
  let fixture: ComponentFixture<Adminservices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Adminservices],
    }).compileComponents();

    fixture = TestBed.createComponent(Adminservices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
