import { UIRouter, extend, isNumber, isNullOrUndefined } from '@uirouter/core';
import { Directive, Inject, Input, Optional, ElementRef, Renderer2, HostListener, } from '@angular/core';
import { UIView } from './uiView';
import { ReplaySubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@uirouter/core";
/**
 * @internal
 * # blah blah blah
 */
var AnchorUISref = /** @class */ (function () {
    function AnchorUISref(_el, _renderer) {
        this._el = _el;
        this._renderer = _renderer;
    }
    AnchorUISref.prototype.openInNewTab = function () {
        return this._el.nativeElement.target === '_blank';
    };
    AnchorUISref.prototype.update = function (href) {
        if (!isNullOrUndefined(href)) {
            this._renderer.setProperty(this._el.nativeElement, 'href', href);
        }
        else {
            this._renderer.removeAttribute(this._el.nativeElement, 'href');
        }
    };
    AnchorUISref.ɵfac = function AnchorUISref_Factory(t) { return new (t || AnchorUISref)(i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.Renderer2)); };
    AnchorUISref.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: AnchorUISref, selectors: [["a", "uiSref", ""]] });
    return AnchorUISref;
}());
export { AnchorUISref };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AnchorUISref, [{
        type: Directive,
        args: [{ selector: 'a[uiSref]' }]
    }], function () { return [{ type: i0.ElementRef }, { type: i0.Renderer2 }]; }, null); })();
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
var UISref = /** @class */ (function () {
    function UISref(_router, _anchorUISref, parent) {
        var _this = this;
        /**
         * An observable (ReplaySubject) of the state this UISref is targeting.
         * When the UISref is clicked, it will transition to this [[TargetState]].
         */
        this.targetState$ = new ReplaySubject(1);
        /** @internal */ this._emit = false;
        this._router = _router;
        this._anchorUISref = _anchorUISref;
        this._parent = parent;
        this._statesSub = _router.globals.states$.subscribe(function () { return _this.update(); });
    }
    Object.defineProperty(UISref.prototype, "uiSref", {
        /** @internal */
        set: function (val) {
            this.state = val;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UISref.prototype, "uiParams", {
        /** @internal */
        set: function (val) {
            this.params = val;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UISref.prototype, "uiOptions", {
        /** @internal */
        set: function (val) {
            this.options = val;
            this.update();
        },
        enumerable: false,
        configurable: true
    });
    UISref.prototype.ngOnInit = function () {
        this._emit = true;
        this.update();
    };
    UISref.prototype.ngOnChanges = function (changes) {
        this.update();
    };
    UISref.prototype.ngOnDestroy = function () {
        this._emit = false;
        this._statesSub.unsubscribe();
        this.targetState$.unsubscribe();
    };
    UISref.prototype.update = function () {
        var $state = this._router.stateService;
        if (this._emit) {
            var newTarget = $state.target(this.state, this.params, this.getOptions());
            this.targetState$.next(newTarget);
        }
        if (this._anchorUISref) {
            if (!this.state) {
                this._anchorUISref.update(null);
            }
            else {
                var href = $state.href(this.state, this.params, this.getOptions()) || '';
                this._anchorUISref.update(href);
            }
        }
    };
    UISref.prototype.getOptions = function () {
        var defaultOpts = {
            relative: this._parent && this._parent.context && this._parent.context.name,
            inherit: true,
            source: 'sref',
        };
        return extend(defaultOpts, this.options || {});
    };
    /** When triggered by a (click) event, this function transitions to the UISref's target state */
    UISref.prototype.go = function (button, ctrlKey, metaKey) {
        if ((this._anchorUISref &&
            (this._anchorUISref.openInNewTab() || button || !isNumber(button) || ctrlKey || metaKey)) ||
            !this.state) {
            return;
        }
        this._router.stateService.go(this.state, this.params, this.getOptions());
        return false;
    };
    UISref.ɵfac = function UISref_Factory(t) { return new (t || UISref)(i0.ɵɵdirectiveInject(i1.UIRouter), i0.ɵɵdirectiveInject(AnchorUISref, 8), i0.ɵɵdirectiveInject(UIView.PARENT_INJECT)); };
    UISref.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: UISref, selectors: [["", "uiSref", ""]], hostBindings: function UISref_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function UISref_click_HostBindingHandler($event) { return ctx.go($event.button, $event.ctrlKey, $event.metaKey); });
        } }, inputs: { state: [0, "uiSref", "state"], params: [0, "uiParams", "params"], options: [0, "uiOptions", "options"] }, exportAs: ["uiSref"], features: [i0.ɵɵNgOnChangesFeature] });
    return UISref;
}());
export { UISref };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UISref, [{
        type: Directive,
        args: [{
                selector: '[uiSref]',
                exportAs: 'uiSref',
            }]
    }], function () { return [{ type: i1.UIRouter }, { type: AnchorUISref, decorators: [{
                type: Optional
            }] }, { type: undefined, decorators: [{
                type: Inject,
                args: [UIView.PARENT_INJECT]
            }] }]; }, { state: [{
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
        }] }); })();
//# sourceMappingURL=uiSref.js.map