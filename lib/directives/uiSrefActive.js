import { Directive, Input, ElementRef, Host, Renderer2 } from '@angular/core';
import { UISrefStatus } from './uiSrefStatus';
import * as i0 from "@angular/core";
import * as i1 from "./uiSrefStatus";
/**
 * A directive that adds a CSS class when its associated `uiSref` link is active.
 *
 * ### Purpose
 *
 * This directive should be paired with one (or more) [[UISref]] directives.
 * It will apply a CSS class to its element when the state the `uiSref` targets is activated.
 *
 * This can be used to create navigation UI where the active link is highlighted.
 *
 * ### Selectors
 *
 * - `[uiSrefActive]`: When this selector is used, the class is added when the target state or any
 * child of the target state is active
 * - `[uiSrefActiveEq]`: When this selector is used, the class is added when the target state is
 * exactly active (the class is not added if a child of the target state is active).
 *
 * ### Inputs
 *
 * - `uiSrefActive`/`uiSrefActiveEq`: one or more CSS classes to add to the element, when the `uiSref` is active
 *
 * #### Example:
 * The anchor tag has the `active` class added when the `foo` state is active.
 * ```html
 * <a uiSref="foo" uiSrefActive="active">Foo</a>
 * ```
 *
 * ### Matching parameters
 *
 * If the `uiSref` includes parameters, the current state must be active, *and* the parameter values must match.
 *
 * #### Example:
 * The first anchor tag has the `active` class added when the `foo.bar` state is active and the `id` parameter
 * equals 25.
 * The second anchor tag has the `active` class added when the `foo.bar` state is active and the `id` parameter
 * equals 32.
 * ```html
 * <a uiSref="foo.bar" [uiParams]="{ id: 25 }" uiSrefActive="active">Bar #25</a>
 * <a uiSref="foo.bar" [uiParams]="{ id: 32 }" uiSrefActive="active">Bar #32</a>
 * ```
 *
 * #### Example:
 * A list of anchor tags are created for a list of `bar` objects.
 * An anchor tag will have the `active` class when `foo.bar` state is active and the `id` parameter matches
 * that object's `id`.
 * ```html
 * <li *ngFor="let bar of bars">
 *   <a uiSref="foo.bar" [uiParams]="{ id: bar.id }" uiSrefActive="active">Bar #{{ bar.id }}</a>
 * </li>
 * ```
 *
 * ### Multiple uiSrefs
 *
 * A single `uiSrefActive` can be used for multiple `uiSref` links.
 * This can be used to create (for example) a drop down navigation menu, where the menui is highlighted
 * if *any* of its inner links are active.
 *
 * The `uiSrefActive` should be placed on an ancestor element of the `uiSref` list.
 * If anyof the `uiSref` links are activated, the class will be added to the ancestor element.
 *
 * #### Example:
 * This is a dropdown nagivation menu for "Admin" states.
 * When any of `admin.users`, `admin.groups`, `admin.settings` are active, the `<li>` for the dropdown
 * has the `dropdown-child-active` class applied.
 * Additionally, the active anchor tag has the `active` class applied.
 * ```html
 * <ul class="dropdown-menu">
 *   <li uiSrefActive="dropdown-child-active" class="dropdown admin">
 *     Admin
 *     <ul>
 *       <li><a uiSref="admin.users" uiSrefActive="active">Users</a></li>
 *       <li><a uiSref="admin.groups" uiSrefActive="active">Groups</a></li>
 *       <li><a uiSref="admin.settings" uiSrefActive="active">Settings</a></li>
 *     </ul>
 *   </li>
 * </ul>
 * ```
 */
var UISrefActive = /** @class */ (function () {
    function UISrefActive(uiSrefStatus, rnd, host) {
        var _this = this;
        this._classes = [];
        this._classesEq = [];
        this._subscription = uiSrefStatus.uiSrefStatus.subscribe(function (next) {
            _this._classes.forEach(function (cls) {
                if (next.active) {
                    rnd.addClass(host.nativeElement, cls);
                }
                else {
                    rnd.removeClass(host.nativeElement, cls);
                }
            });
            _this._classesEq.forEach(function (cls) {
                if (next.exact) {
                    rnd.addClass(host.nativeElement, cls);
                }
                else {
                    rnd.removeClass(host.nativeElement, cls);
                }
            });
        });
    }
    Object.defineProperty(UISrefActive.prototype, "active", {
        set: function (val) {
            this._classes = val.split(/\s+/);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UISrefActive.prototype, "activeEq", {
        set: function (val) {
            this._classesEq = val.split(/\s+/);
        },
        enumerable: false,
        configurable: true
    });
    UISrefActive.prototype.ngOnDestroy = function () {
        this._subscription.unsubscribe();
    };
    UISrefActive.ɵfac = function UISrefActive_Factory(t) { return new (t || UISrefActive)(i0.ɵɵdirectiveInject(i1.UISrefStatus), i0.ɵɵdirectiveInject(i0.Renderer2), i0.ɵɵdirectiveInject(i0.ElementRef, 1)); };
    UISrefActive.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: UISrefActive, selectors: [["", "uiSrefActive", ""], ["", "uiSrefActiveEq", ""]], inputs: { active: [0, "uiSrefActive", "active"], activeEq: [0, "uiSrefActiveEq", "activeEq"] } });
    return UISrefActive;
}());
export { UISrefActive };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UISrefActive, [{
        type: Directive,
        args: [{
                selector: '[uiSrefActive],[uiSrefActiveEq]',
            }]
    }], function () { return [{ type: i1.UISrefStatus }, { type: i0.Renderer2 }, { type: i0.ElementRef, decorators: [{
                type: Host
            }] }]; }, { active: [{
            type: Input,
            args: ['uiSrefActive']
        }], activeEq: [{
            type: Input,
            args: ['uiSrefActiveEq']
        }] }); })();
//# sourceMappingURL=uiSrefActive.js.map