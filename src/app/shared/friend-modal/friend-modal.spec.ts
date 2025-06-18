import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendModalComponent } from './friend-modal';

describe('FriendModal', () => {
  let component: FriendModalComponent;
  let fixture: ComponentFixture<FriendModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
