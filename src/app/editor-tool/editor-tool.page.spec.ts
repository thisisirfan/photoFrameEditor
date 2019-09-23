import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorToolPage } from './editor-tool.page';

describe('EditorToolPage', () => {
  let component: EditorToolPage;
  let fixture: ComponentFixture<EditorToolPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorToolPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorToolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
