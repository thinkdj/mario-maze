/*
* Keypress Directive
* Author: @thinkdj
* 19 Aug 2019 | 10:56 PM
* */
import { Directive, HostListener, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[keypress]'
})
export class KeypressDirective implements OnInit, OnDestroy {

  @Output() keypressEmit:EventEmitter<any> = new EventEmitter();

  @Input() omitInputElements: boolean = true;

  constructor() { }

  ngOnInit() {
    console.log("KeypressDirective: Init()");
  }
  ngOnDestroy() {
    console.log("KeypressDirective: Destroyed()");
  }

  /* Handle SINGLE keyups */
  @HostListener('window:keyup', ['$event']) onKeyDownSingle(e: KeyboardEvent) {
    let targetEl = <Element>e.target;

    /* The following cases would be omitted from key listeners */
    /* IMP: Customize below logic and conditions for your app! */
    if( this.omitInputElements && (
        ['input','button','select','option'].includes(targetEl.tagName.toLowerCase()) || // HTML inputs
        targetEl.className.includes('omit-keypress') || // Custom class for omits
        targetEl.className.includes('ant-') || // ant-design input classes
        targetEl.className.includes('ql-editor') || // Quill Editor
        targetEl.className.includes('cdk-overlay') // Google CDK Modal
    ) ) return;

    // Handle key strokes
    switch (e.key) {
      case "m":
      case "M":
        break;
      case "Enter":
        console.log("`ENTER` THE DRAGON");
        break;
      default:
        console.log('KeypressDirective:',e.key,'@',targetEl.tagName);
    }

    // Emit key
    this.keypressEmit.next(e.key);
  }


  /* MULTIPLE COMBO KEYS SUPPORT */
  @HostListener('keydown.shift.tab', ['$event'])
  onKeyDown(e) {
    // keydown.shift.tab ==> if (e.shiftKey && e.keyCode == 9)
    // Also, use preventDefault() if your combination triggers other events (moving focus in case of Shift+Tab)
    // e.preventDefault();
    console.log('KeypressDirective: shift and tab');
    this.keypressEmit.next('shift+tab');
  }


}
