import { extend, isNumber, isNullOrUndefined } from '@uirouter/core';
import { Directive, Inject, Input, Optional, HostListener, } from '@angular/core';
import { UIView } from './uiView';
import { ReplaySubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@uirouter/core";
/**
 * @internal
 * # blah blah blah
 */
export class AnchorUISref {
    _el;
    _renderer;
    constructor(_el, _renderer) {
        this._el = _el;
        this._renderer = _renderer;
    }
    openInNewTab() {
        return this._el.nativeElement.target === '_blank';
    }
    update(href) {
        if (!isNullOrUndefined(href)) {
            this._renderer.setProperty(this._el.nativeElement, 'href', href);
        }
        else {
            this._renderer.removeAttribute(this._el.nativeElement, 'href');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: AnchorUISref, deps: [{ token: i0.ElementRef }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.6", type: AnchorUISref, selector: "a[uiSref]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: AnchorUISref, decorators: [{
            type: Directive,
            args: [{ selector: 'a[uiSref]' }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.Renderer2 }] });
/**
 * A directive when clicked, initiates a [[Transition]] to a [[TargetState]].
 *
 * ### Purpose
 *
 * This directive is applied to anchor tags (`<a>`) or any other clickable element.  It is a state reference (or sref --
 * similar to an href).  When clicked, the directive will transition to that state by calling [[StateService.go]],
 * and optionally supply state parameter values and transition options.
 *
 * When this directive is on an anchor tag, it will also add an `href` attribute to the anchor.
 *
 * ### Selector
 *
 * - `[uiSref]`: The directive is created as an attribute on an element, e.g., `<a uiSref></a>`
 *
 * ### Inputs
 *
 * - `uiSref`: the target state's name, e.g., `uiSref="foostate"`.  If a component template uses a relative `uiSref`,
 * e.g., `uiSref=".child"`, the reference is relative to that component's state.
 *
 * - `uiParams`: any target state parameter values, as an object, e.g., `[uiParams]="{ fooId: bar.fooId }"`
 *
 * - `uiOptions`: [[TransitionOptions]], e.g., `[uiOptions]="{ inherit: false }"`
 *
 * @example
 * ```html
 *
 * <!-- Targets bar state' -->
 * <a uiSref="bar">Bar</a>
 *
 * <!-- Assume this component's state is "foo".
 *      Relatively targets "foo.child" -->
 * <a uiSref=".child">Foo Child</a>
 *
 * <!-- Targets "bar" state and supplies parameter value -->
 * <a uiSref="bar" [uiParams]="{ barId: foo.barId }">Bar {{foo.barId}}</a>
 *
 * <!-- Targets "bar" state and parameter, doesn't inherit existing parameters-->
 * <a uiSref="bar" [uiParams]="{ barId: foo.barId }" [uiOptions]="{ inherit: false }">Bar {{foo.barId}}</a>
 * ```
 */
export class UISref {
    /**
     * `@Input('uiSref')` The name of the state to link to
     *
     * ```html
     * <a uiSref="hoome">Home</a>
     * ```
     */
    state;
    /**
     * `@Input('uiParams')` The parameter values to use (as key/values)
     *
     * ```html
     * <a uiSref="book" [uiParams]="{ bookId: book.id }">Book {{ book.name }}</a>
     * ```
     */
    params;
    /**
     * `@Input('uiOptions')` The transition options
     *
     * ```html
     * <a uiSref="books" [uiOptions]="{ reload: true }">Book {{ book.name }}</a>
     * ```
     */
    options;
    /**
     * An observable (ReplaySubject) of the state this UISref is targeting.
     * When the UISref is clicked, it will transition to this [[TargetState]].
     */
    targetState$ = new ReplaySubject(1);
    /** @internal */ _emit = false;
    /** @internal */ _statesSub;
    /** @internal */ _router;
    /** @internal */ _anchorUISref;
    /** @internal */ _parent;
    constructor(_router, _anchorUISref, parent) {
        this._router = _router;
        this._anchorUISref = _anchorUISref;
        this._parent = parent;
        this._statesSub = _router.globals.states$.subscribe(() => this.update());
    }
    /** @internal */
    set uiSref(val) {
        this.state = val;
        this.update();
    }
    /** @internal */
    set uiParams(val) {
        this.params = val;
        this.update();
    }
    /** @internal */
    set uiOptions(val) {
        this.options = val;
        this.update();
    }
    ngOnInit() {
        this._emit = true;
        this.update();
    }
    ngOnChanges(changes) {
        this.update();
    }
    ngOnDestroy() {
        this._emit = false;
        this._statesSub.unsubscribe();
        this.targetState$.unsubscribe();
    }
    update() {
        const $state = this._router.stateService;
        if (this._emit) {
            const newTarget = $state.target(this.state, this.params, this.getOptions());
            this.targetState$.next(newTarget);
        }
        if (this._anchorUISref) {
            if (!this.state) {
                this._anchorUISref.update(null);
            }
            else {
                const href = $state.href(this.state, this.params, this.getOptions()) || '';
                this._anchorUISref.update(href);
            }
        }
    }
    getOptions() {
        const defaultOpts = {
            relative: this._parent && this._parent.context && this._parent.context.name,
            inherit: true,
            source: 'sref',
        };
        return extend(defaultOpts, this.options || {});
    }
    /** When triggered by a (click) event, this function transitions to the UISref's target state */
    go(button, ctrlKey, metaKey) {
        if ((this._anchorUISref &&
            (this._anchorUISref.openInNewTab() || button || !isNumber(button) || ctrlKey || metaKey)) ||
            !this.state) {
            return;
        }
        this._router.stateService.go(this.state, this.params, this.getOptions());
        return false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UISref, deps: [{ token: i1.UIRouter }, { token: AnchorUISref, optional: true }, { token: UIView.PARENT_INJECT }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.6", type: UISref, selector: "[uiSref]", inputs: { state: ["uiSref", "state"], params: ["uiParams", "params"], options: ["uiOptions", "options"] }, host: { listeners: { "click": "go($event.button,$event.ctrlKey,$event.metaKey)" } }, exportAs: ["uiSref"], usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UISref, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiSref]',
                    exportAs: 'uiSref',
                }]
        }], ctorParameters: () => [{ type: i1.UIRouter }, { type: AnchorUISref, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [UIView.PARENT_INJECT]
                }] }], propDecorators: { state: [{
                type: Input,
                args: ['uiSref']
            }], params: [{
                type: Input,
                args: ['uiParams']
            }], options: [{
                type: Input,
                args: ['uiOptions']
            }], go: [{
                type: HostListener,
                args: ['click', ['$event.button', '$event.ctrlKey', '$event.metaKey']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlTcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdGl2ZXMvdWlTcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBWSxNQUFNLEVBQW9ELFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2pJLE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFDTCxRQUFRLEVBS1IsWUFBWSxHQUNiLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLEVBQXNCLE1BQU0sVUFBVSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQWdCLE1BQU0sTUFBTSxDQUFDOzs7QUFFbkQ7OztHQUdHO0FBRUgsTUFBTSxPQUFPLFlBQVk7SUFDSjtJQUF3QjtJQUEzQyxZQUFtQixHQUFlLEVBQVMsU0FBb0I7UUFBNUMsUUFBRyxHQUFILEdBQUcsQ0FBWTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVc7SUFBRyxDQUFDO0lBRW5FLFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUM7SUFDcEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFZO1FBQ2pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRSxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLENBQUM7SUFDSCxDQUFDO3VHQWJVLFlBQVk7MkZBQVosWUFBWTs7MkZBQVosWUFBWTtrQkFEeEIsU0FBUzttQkFBQyxF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QUFFLFFBQVE7aUJBQ25COzswQkEyQ0ksUUFBUTs7MEJBQ1IsTUFBTTsyQkFBQyxNQUFNLENBQUMsYUFBYTt5Q0FuQ2IsS0FBSztzQkFBckIsS0FBSzt1QkFBQyxRQUFRO2dCQVNJLE1BQU07c0JBQXhCLEtBQUs7dUJBQUMsVUFBVTtnQkFTRyxPQUFPO3NCQUExQixLQUFLO3VCQUFDLFdBQVc7Z0JBcUZsQixFQUFFO3NCQURELFlBQVk7dUJBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVUlSb3V0ZXIsIGV4dGVuZCwgT2JqLCBTdGF0ZU9yTmFtZSwgVHJhbnNpdGlvbk9wdGlvbnMsIFRhcmdldFN0YXRlLCBpc051bWJlciwgaXNOdWxsT3JVbmRlZmluZWQgfSBmcm9tICdAdWlyb3V0ZXIvY29yZSc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBFbGVtZW50UmVmLFxuICBSZW5kZXJlcjIsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgSG9zdExpc3RlbmVyLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFVJVmlldywgUGFyZW50VUlWaWV3SW5qZWN0IH0gZnJvbSAnLi91aVZpZXcnO1xuaW1wb3J0IHsgUmVwbGF5U3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQGludGVybmFsXG4gKiAjIGJsYWggYmxhaCBibGFoXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ2FbdWlTcmVmXScgfSlcbmV4cG9ydCBjbGFzcyBBbmNob3JVSVNyZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgX2VsOiBFbGVtZW50UmVmLCBwdWJsaWMgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgb3BlbkluTmV3VGFiKCkge1xuICAgIHJldHVybiB0aGlzLl9lbC5uYXRpdmVFbGVtZW50LnRhcmdldCA9PT0gJ19ibGFuayc7XG4gIH1cblxuICB1cGRhdGUoaHJlZjogc3RyaW5nKSB7XG4gICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChocmVmKSkge1xuICAgICAgdGhpcy5fcmVuZGVyZXIuc2V0UHJvcGVydHkodGhpcy5fZWwubmF0aXZlRWxlbWVudCwgJ2hyZWYnLCBocmVmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKHRoaXMuX2VsLm5hdGl2ZUVsZW1lbnQsICdocmVmJyk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgd2hlbiBjbGlja2VkLCBpbml0aWF0ZXMgYSBbW1RyYW5zaXRpb25dXSB0byBhIFtbVGFyZ2V0U3RhdGVdXS5cbiAqXG4gKiAjIyMgUHVycG9zZVxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIGlzIGFwcGxpZWQgdG8gYW5jaG9yIHRhZ3MgKGA8YT5gKSBvciBhbnkgb3RoZXIgY2xpY2thYmxlIGVsZW1lbnQuICBJdCBpcyBhIHN0YXRlIHJlZmVyZW5jZSAob3Igc3JlZiAtLVxuICogc2ltaWxhciB0byBhbiBocmVmKS4gIFdoZW4gY2xpY2tlZCwgdGhlIGRpcmVjdGl2ZSB3aWxsIHRyYW5zaXRpb24gdG8gdGhhdCBzdGF0ZSBieSBjYWxsaW5nIFtbU3RhdGVTZXJ2aWNlLmdvXV0sXG4gKiBhbmQgb3B0aW9uYWxseSBzdXBwbHkgc3RhdGUgcGFyYW1ldGVyIHZhbHVlcyBhbmQgdHJhbnNpdGlvbiBvcHRpb25zLlxuICpcbiAqIFdoZW4gdGhpcyBkaXJlY3RpdmUgaXMgb24gYW4gYW5jaG9yIHRhZywgaXQgd2lsbCBhbHNvIGFkZCBhbiBgaHJlZmAgYXR0cmlidXRlIHRvIHRoZSBhbmNob3IuXG4gKlxuICogIyMjIFNlbGVjdG9yXG4gKlxuICogLSBgW3VpU3JlZl1gOiBUaGUgZGlyZWN0aXZlIGlzIGNyZWF0ZWQgYXMgYW4gYXR0cmlidXRlIG9uIGFuIGVsZW1lbnQsIGUuZy4sIGA8YSB1aVNyZWY+PC9hPmBcbiAqXG4gKiAjIyMgSW5wdXRzXG4gKlxuICogLSBgdWlTcmVmYDogdGhlIHRhcmdldCBzdGF0ZSdzIG5hbWUsIGUuZy4sIGB1aVNyZWY9XCJmb29zdGF0ZVwiYC4gIElmIGEgY29tcG9uZW50IHRlbXBsYXRlIHVzZXMgYSByZWxhdGl2ZSBgdWlTcmVmYCxcbiAqIGUuZy4sIGB1aVNyZWY9XCIuY2hpbGRcImAsIHRoZSByZWZlcmVuY2UgaXMgcmVsYXRpdmUgdG8gdGhhdCBjb21wb25lbnQncyBzdGF0ZS5cbiAqXG4gKiAtIGB1aVBhcmFtc2A6IGFueSB0YXJnZXQgc3RhdGUgcGFyYW1ldGVyIHZhbHVlcywgYXMgYW4gb2JqZWN0LCBlLmcuLCBgW3VpUGFyYW1zXT1cInsgZm9vSWQ6IGJhci5mb29JZCB9XCJgXG4gKlxuICogLSBgdWlPcHRpb25zYDogW1tUcmFuc2l0aW9uT3B0aW9uc11dLCBlLmcuLCBgW3VpT3B0aW9uc109XCJ7IGluaGVyaXQ6IGZhbHNlIH1cImBcbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgaHRtbFxuICpcbiAqIDwhLS0gVGFyZ2V0cyBiYXIgc3RhdGUnIC0tPlxuICogPGEgdWlTcmVmPVwiYmFyXCI+QmFyPC9hPlxuICpcbiAqIDwhLS0gQXNzdW1lIHRoaXMgY29tcG9uZW50J3Mgc3RhdGUgaXMgXCJmb29cIi5cbiAqICAgICAgUmVsYXRpdmVseSB0YXJnZXRzIFwiZm9vLmNoaWxkXCIgLS0+XG4gKiA8YSB1aVNyZWY9XCIuY2hpbGRcIj5Gb28gQ2hpbGQ8L2E+XG4gKlxuICogPCEtLSBUYXJnZXRzIFwiYmFyXCIgc3RhdGUgYW5kIHN1cHBsaWVzIHBhcmFtZXRlciB2YWx1ZSAtLT5cbiAqIDxhIHVpU3JlZj1cImJhclwiIFt1aVBhcmFtc109XCJ7IGJhcklkOiBmb28uYmFySWQgfVwiPkJhciB7e2Zvby5iYXJJZH19PC9hPlxuICpcbiAqIDwhLS0gVGFyZ2V0cyBcImJhclwiIHN0YXRlIGFuZCBwYXJhbWV0ZXIsIGRvZXNuJ3QgaW5oZXJpdCBleGlzdGluZyBwYXJhbWV0ZXJzLS0+XG4gKiA8YSB1aVNyZWY9XCJiYXJcIiBbdWlQYXJhbXNdPVwieyBiYXJJZDogZm9vLmJhcklkIH1cIiBbdWlPcHRpb25zXT1cInsgaW5oZXJpdDogZmFsc2UgfVwiPkJhciB7e2Zvby5iYXJJZH19PC9hPlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1t1aVNyZWZdJyxcbiAgZXhwb3J0QXM6ICd1aVNyZWYnLFxufSlcbmV4cG9ydCBjbGFzcyBVSVNyZWYgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xuICAvKipcbiAgICogYEBJbnB1dCgndWlTcmVmJylgIFRoZSBuYW1lIG9mIHRoZSBzdGF0ZSB0byBsaW5rIHRvXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGEgdWlTcmVmPVwiaG9vbWVcIj5Ib21lPC9hPlxuICAgKiBgYGBcbiAgICovXG4gIEBJbnB1dCgndWlTcmVmJykgc3RhdGU6IFN0YXRlT3JOYW1lO1xuXG4gIC8qKlxuICAgKiBgQElucHV0KCd1aVBhcmFtcycpYCBUaGUgcGFyYW1ldGVyIHZhbHVlcyB0byB1c2UgKGFzIGtleS92YWx1ZXMpXG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGEgdWlTcmVmPVwiYm9va1wiIFt1aVBhcmFtc109XCJ7IGJvb2tJZDogYm9vay5pZCB9XCI+Qm9vayB7eyBib29rLm5hbWUgfX08L2E+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCd1aVBhcmFtcycpIHBhcmFtczogYW55O1xuXG4gIC8qKlxuICAgKiBgQElucHV0KCd1aU9wdGlvbnMnKWAgVGhlIHRyYW5zaXRpb24gb3B0aW9uc1xuICAgKlxuICAgKiBgYGBodG1sXG4gICAqIDxhIHVpU3JlZj1cImJvb2tzXCIgW3VpT3B0aW9uc109XCJ7IHJlbG9hZDogdHJ1ZSB9XCI+Qm9vayB7eyBib29rLm5hbWUgfX08L2E+XG4gICAqIGBgYFxuICAgKi9cbiAgQElucHV0KCd1aU9wdGlvbnMnKSBvcHRpb25zOiBUcmFuc2l0aW9uT3B0aW9ucztcblxuICAvKipcbiAgICogQW4gb2JzZXJ2YWJsZSAoUmVwbGF5U3ViamVjdCkgb2YgdGhlIHN0YXRlIHRoaXMgVUlTcmVmIGlzIHRhcmdldGluZy5cbiAgICogV2hlbiB0aGUgVUlTcmVmIGlzIGNsaWNrZWQsIGl0IHdpbGwgdHJhbnNpdGlvbiB0byB0aGlzIFtbVGFyZ2V0U3RhdGVdXS5cbiAgICovXG4gIHB1YmxpYyB0YXJnZXRTdGF0ZSQgPSBuZXcgUmVwbGF5U3ViamVjdDxUYXJnZXRTdGF0ZT4oMSk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqLyBwcml2YXRlIF9lbWl0ID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi8gcHJpdmF0ZSBfc3RhdGVzU3ViOiBTdWJzY3JpcHRpb247XG4gIC8qKiBAaW50ZXJuYWwgKi8gcHJpdmF0ZSBfcm91dGVyOiBVSVJvdXRlcjtcbiAgLyoqIEBpbnRlcm5hbCAqLyBwcml2YXRlIF9hbmNob3JVSVNyZWY6IEFuY2hvclVJU3JlZjtcbiAgLyoqIEBpbnRlcm5hbCAqLyBwcml2YXRlIF9wYXJlbnQ6IFBhcmVudFVJVmlld0luamVjdDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBfcm91dGVyOiBVSVJvdXRlcixcbiAgICBAT3B0aW9uYWwoKSBfYW5jaG9yVUlTcmVmOiBBbmNob3JVSVNyZWYsXG4gICAgQEluamVjdChVSVZpZXcuUEFSRU5UX0lOSkVDVCkgcGFyZW50OiBQYXJlbnRVSVZpZXdJbmplY3RcbiAgKSB7XG4gICAgdGhpcy5fcm91dGVyID0gX3JvdXRlcjtcbiAgICB0aGlzLl9hbmNob3JVSVNyZWYgPSBfYW5jaG9yVUlTcmVmO1xuICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcblxuICAgIHRoaXMuX3N0YXRlc1N1YiA9IF9yb3V0ZXIuZ2xvYmFscy5zdGF0ZXMkLnN1YnNjcmliZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc2V0IHVpU3JlZih2YWw6IFN0YXRlT3JOYW1lKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHZhbDtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc2V0IHVpUGFyYW1zKHZhbDogT2JqKSB7XG4gICAgdGhpcy5wYXJhbXMgPSB2YWw7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuICAvKiogQGludGVybmFsICovXG4gIHNldCB1aU9wdGlvbnModmFsOiBUcmFuc2l0aW9uT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IHZhbDtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fZW1pdCA9IHRydWU7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZW1pdCA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXRlc1N1Yi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMudGFyZ2V0U3RhdGUkLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICBjb25zdCAkc3RhdGUgPSB0aGlzLl9yb3V0ZXIuc3RhdGVTZXJ2aWNlO1xuICAgIGlmICh0aGlzLl9lbWl0KSB7XG4gICAgICBjb25zdCBuZXdUYXJnZXQgPSAkc3RhdGUudGFyZ2V0KHRoaXMuc3RhdGUsIHRoaXMucGFyYW1zLCB0aGlzLmdldE9wdGlvbnMoKSk7XG4gICAgICB0aGlzLnRhcmdldFN0YXRlJC5uZXh0KG5ld1RhcmdldCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2FuY2hvclVJU3JlZikge1xuICAgICAgaWYgKCF0aGlzLnN0YXRlKSB7XG4gICAgICAgIHRoaXMuX2FuY2hvclVJU3JlZi51cGRhdGUobnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBocmVmID0gJHN0YXRlLmhyZWYodGhpcy5zdGF0ZSwgdGhpcy5wYXJhbXMsIHRoaXMuZ2V0T3B0aW9ucygpKSB8fCAnJztcbiAgICAgICAgdGhpcy5fYW5jaG9yVUlTcmVmLnVwZGF0ZShocmVmKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRPcHRpb25zKCkge1xuICAgIGNvbnN0IGRlZmF1bHRPcHRzOiBUcmFuc2l0aW9uT3B0aW9ucyA9IHtcbiAgICAgIHJlbGF0aXZlOiB0aGlzLl9wYXJlbnQgJiYgdGhpcy5fcGFyZW50LmNvbnRleHQgJiYgdGhpcy5fcGFyZW50LmNvbnRleHQubmFtZSxcbiAgICAgIGluaGVyaXQ6IHRydWUsXG4gICAgICBzb3VyY2U6ICdzcmVmJyxcbiAgICB9O1xuICAgIHJldHVybiBleHRlbmQoZGVmYXVsdE9wdHMsIHRoaXMub3B0aW9ucyB8fCB7fSk7XG4gIH1cblxuICAvKiogV2hlbiB0cmlnZ2VyZWQgYnkgYSAoY2xpY2spIGV2ZW50LCB0aGlzIGZ1bmN0aW9uIHRyYW5zaXRpb25zIHRvIHRoZSBVSVNyZWYncyB0YXJnZXQgc3RhdGUgKi9cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudC5idXR0b24nLCAnJGV2ZW50LmN0cmxLZXknLCAnJGV2ZW50Lm1ldGFLZXknXSlcbiAgZ28oYnV0dG9uOiBudW1iZXIsIGN0cmxLZXk6IGJvb2xlYW4sIG1ldGFLZXk6IGJvb2xlYW4pIHtcbiAgICBpZiAoXG4gICAgICAodGhpcy5fYW5jaG9yVUlTcmVmICYmXG4gICAgICAgICh0aGlzLl9hbmNob3JVSVNyZWYub3BlbkluTmV3VGFiKCkgfHwgYnV0dG9uIHx8ICFpc051bWJlcihidXR0b24pIHx8IGN0cmxLZXkgfHwgbWV0YUtleSkpIHx8XG4gICAgICAhdGhpcy5zdGF0ZVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3JvdXRlci5zdGF0ZVNlcnZpY2UuZ28odGhpcy5zdGF0ZSwgdGhpcy5wYXJhbXMsIHRoaXMuZ2V0T3B0aW9ucygpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==