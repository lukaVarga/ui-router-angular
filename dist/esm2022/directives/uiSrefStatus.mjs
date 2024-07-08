import { Directive, Output, EventEmitter, ContentChildren, Host, Self, Optional } from '@angular/core';
import { UISref } from './uiSref';
import { anyTrueR, tail, unnestR, Param, PathUtils, identity, uniqR, } from '@uirouter/core';
import { BehaviorSubject, of, from, combineLatest, concat } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "./uiSref";
import * as i2 from "@uirouter/core";
/** @internal */
const inactiveStatus = {
    active: false,
    exact: false,
    entering: false,
    exiting: false,
    targetStates: [],
};
/**
 * Returns a Predicate<PathNode[]>
 *
 * The predicate returns true when the target state (and param values)
 * match the (tail of) the path, and the path's param values
 *
 * @internal
 */
const pathMatches = (target) => {
    if (!target.exists())
        return () => false;
    const state = target.$state();
    const targetParamVals = target.params();
    const targetPath = PathUtils.buildPath(target);
    const paramSchema = targetPath
        .map((node) => node.paramSchema)
        .reduce(unnestR, [])
        .filter((param) => targetParamVals.hasOwnProperty(param.id));
    return (path) => {
        const tailNode = tail(path);
        if (!tailNode || tailNode.state !== state)
            return false;
        const paramValues = PathUtils.paramValues(path);
        return Param.equals(paramSchema, paramValues, targetParamVals);
    };
};
/**
 * Given basePath: [a, b], appendPath: [c, d]),
 * Expands the path to [c], [c, d]
 * Then appends each to [a,b,] and returns: [a, b, c], [a, b, c, d]
 *
 * @internal
 */
function spreadToSubPaths(basePath, appendPath) {
    return appendPath.map((node) => basePath.concat(PathUtils.subPath(appendPath, (n) => n.state === node.state)));
}
/**
 * Given a TransEvt (Transition event: started, success, error)
 * and a UISref Target State, return a SrefStatus object
 * which represents the current status of that Sref:
 * active, activeEq (exact match), entering, exiting
 *
 * @internal
 */
function getSrefStatus(event, srefTarget) {
    const pathMatchesTarget = pathMatches(srefTarget);
    const tc = event.trans.treeChanges();
    const isStartEvent = event.evt === 'start';
    const isSuccessEvent = event.evt === 'success';
    const activePath = isSuccessEvent ? tc.to : tc.from;
    const isActive = () => spreadToSubPaths([], activePath).map(pathMatchesTarget).reduce(anyTrueR, false);
    const isExact = () => pathMatchesTarget(activePath);
    const isEntering = () => spreadToSubPaths(tc.retained, tc.entering).map(pathMatchesTarget).reduce(anyTrueR, false);
    const isExiting = () => spreadToSubPaths(tc.retained, tc.exiting).map(pathMatchesTarget).reduce(anyTrueR, false);
    return {
        active: isActive(),
        exact: isExact(),
        entering: isStartEvent ? isEntering() : false,
        exiting: isStartEvent ? isExiting() : false,
        targetStates: [srefTarget],
    };
}
/** @internal */
function mergeSrefStatus(left, right) {
    return {
        active: left.active || right.active,
        exact: left.exact || right.exact,
        entering: left.entering || right.entering,
        exiting: left.exiting || right.exiting,
        targetStates: left.targetStates.concat(right.targetStates),
    };
}
/**
 * A directive which emits events when a paired [[UISref]] status changes.
 *
 * This directive is primarily used by the [[UISrefActive]] directives to monitor `UISref`(s).
 *
 * This directive shares two attribute selectors with `UISrefActive`:
 *
 * - `[uiSrefActive]`
 * - `[uiSrefActiveEq]`.
 *
 * Thus, whenever a `UISrefActive` directive is created, a `UISrefStatus` directive is also created.
 *
 * Most apps should simply use `UISrefActive`, but some advanced components may want to process the
 * [[SrefStatus]] events directly.
 *
 * ```js
 * <li (uiSrefStatus)="onSrefStatusChanged($event)">
 *   <a uiSref="book" [uiParams]="{ bookId: book.id }">Book {{ book.name }}</a>
 * </li>
 * ```
 *
 * The `uiSrefStatus` event is emitted whenever an enclosed `uiSref`'s status changes.
 * The event emitted is of type [[SrefStatus]], and has boolean values for `active`, `exact`, `entering`, and `exiting`; also has a [[StateOrName]] `identifier`value.
 *
 * The values from this event can be captured and stored on a component (then applied, e.g., using ngClass).
 *
 * ---
 *
 * A single `uiSrefStatus` can enclose multiple `uiSref`.
 * Each status boolean (`active`, `exact`, `entering`, `exiting`) will be true if *any of the enclosed `uiSref` status is true*.
 * In other words, all enclosed `uiSref` statuses  are merged to a single status using `||` (logical or).
 *
 * ```js
 * <li (uiSrefStatus)="onSrefStatus($event)" uiSref="admin">
 *   Home
 *   <ul>
 *     <li> <a uiSref="admin.users">Users</a> </li>
 *     <li> <a uiSref="admin.groups">Groups</a> </li>
 *   </ul>
 * </li>
 * ```
 *
 * In the above example, `$event.active === true` when either `admin.users` or `admin.groups` is active.
 *
 * ---
 *
 * This API is subject to change.
 */
export class UISrefStatus {
    /** current statuses of the state/params the uiSref directive is linking to */
    uiSrefStatus = new EventEmitter(false);
    /** Monitor all child components for UISref(s) */
    _srefs;
    /** The current status */
    status;
    /** @internal */ _subscription;
    /** @internal */ _srefChangesSub;
    /** @internal */ _srefs$;
    /** @internal */ _globals;
    /** @internal */ _hostUiSref;
    constructor(_hostUiSref, _globals) {
        this._globals = _globals;
        this._hostUiSref = _hostUiSref;
        this.status = Object.assign({}, inactiveStatus);
    }
    ngAfterContentInit() {
        // Map each transition start event to a stream of:
        // start -> (success|error)
        const transEvents$ = this._globals.start$.pipe(switchMap((trans) => {
            const event = (evt) => ({ evt, trans });
            const transStart$ = of(event('start'));
            const transResult = trans.promise.then(() => event('success'), () => event('error'));
            const transFinish$ = from(transResult);
            return concat(transStart$, transFinish$);
        }));
        const withHostSref = (childrenSrefs) => childrenSrefs.concat(this._hostUiSref).filter(identity).reduce(uniqR, []);
        // Watch the @ContentChildren UISref[] components and get their target states
        this._srefs$ = new BehaviorSubject(withHostSref(this._srefs.toArray()));
        this._srefChangesSub = this._srefs.changes.subscribe((srefs) => this._srefs$.next(withHostSref(srefs.toArray())));
        const targetStates$ = this._srefs$.pipe(switchMap((srefs) => combineLatest(srefs.map((sref) => sref.targetState$))));
        // Calculate the status of each UISref based on the transition event.
        // Reduce the statuses (if multiple) by or-ing each flag.
        this._subscription = transEvents$
            .pipe(switchMap((evt) => {
            return targetStates$.pipe(map((targets) => {
                const statuses = targets.map((target) => getSrefStatus(evt, target));
                return statuses.reduce(mergeSrefStatus);
            }));
        }))
            .subscribe(this._setStatus.bind(this));
    }
    ngOnDestroy() {
        if (this._subscription)
            this._subscription.unsubscribe();
        if (this._srefChangesSub)
            this._srefChangesSub.unsubscribe();
        if (this._srefs$)
            this._srefs$.unsubscribe();
        this._subscription = this._srefChangesSub = this._srefs$ = undefined;
    }
    _setStatus(status) {
        this.status = status;
        this.uiSrefStatus.emit(status);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UISrefStatus, deps: [{ token: i1.UISref, host: true, optional: true, self: true }, { token: i2.UIRouterGlobals }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.0.6", type: UISrefStatus, selector: "[uiSrefStatus],[uiSrefActive],[uiSrefActiveEq]", outputs: { uiSrefStatus: "uiSrefStatus" }, queries: [{ propertyName: "_srefs", predicate: UISref, descendants: true }], exportAs: ["uiSrefStatus"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UISrefStatus, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiSrefStatus],[uiSrefActive],[uiSrefActiveEq]',
                    exportAs: 'uiSrefStatus',
                }]
        }], ctorParameters: () => [{ type: i1.UISref, decorators: [{
                    type: Host
                }, {
                    type: Self
                }, {
                    type: Optional
                }] }, { type: i2.UIRouterGlobals }], propDecorators: { uiSrefStatus: [{
                type: Output,
                args: ['uiSrefStatus']
            }], _srefs: [{
                type: ContentChildren,
                args: [UISref, { descendants: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlTcmVmU3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2RpcmVjdGl2ZXMvdWlTcmVmU3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQWEsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNsQyxPQUFPLEVBS0wsUUFBUSxFQUNSLElBQUksRUFDSixPQUFPLEVBR1AsS0FBSyxFQUNMLFNBQVMsRUFDVCxRQUFRLEVBQ1IsS0FBSyxHQUNOLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUE0QixlQUFlLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xHLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFPLE1BQU0sZ0JBQWdCLENBQUM7Ozs7QUF3QnJELGdCQUFnQjtBQUNoQixNQUFNLGNBQWMsR0FBZTtJQUNqQyxNQUFNLEVBQUUsS0FBSztJQUNiLEtBQUssRUFBRSxLQUFLO0lBQ1osUUFBUSxFQUFFLEtBQUs7SUFDZixPQUFPLEVBQUUsS0FBSztJQUNkLFlBQVksRUFBRSxFQUFFO0NBQ2pCLENBQUM7QUFFRjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFtQixFQUF5QixFQUFFO0lBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQWdCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMzQyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEMsTUFBTSxVQUFVLEdBQWUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRCxNQUFNLFdBQVcsR0FBWSxVQUFVO1NBQ3BDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUMvQixNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztTQUNuQixNQUFNLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFdEUsT0FBTyxDQUFDLElBQWdCLEVBQUUsRUFBRTtRQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN4RCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ2pFLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsUUFBb0IsRUFBRSxVQUFzQjtJQUNwRSxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqSCxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQVMsYUFBYSxDQUFDLEtBQWUsRUFBRSxVQUF1QjtJQUM3RCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsRCxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRXJDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDO0lBQzNDLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDO0lBQy9DLE1BQU0sVUFBVSxHQUFlLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztJQUVoRSxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUV2RyxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUVwRCxNQUFNLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRW5ILE1BQU0sU0FBUyxHQUFHLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFFakgsT0FBTztRQUNMLE1BQU0sRUFBRSxRQUFRLEVBQUU7UUFDbEIsS0FBSyxFQUFFLE9BQU8sRUFBRTtRQUNoQixRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSztRQUM3QyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSztRQUMzQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLENBQUM7S0FDYixDQUFDO0FBQ2xCLENBQUM7QUFFRCxnQkFBZ0I7QUFDaEIsU0FBUyxlQUFlLENBQUMsSUFBZ0IsRUFBRSxLQUFpQjtJQUMxRCxPQUFPO1FBQ0wsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU07UUFDbkMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUs7UUFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFFBQVE7UUFDekMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU87UUFDdEMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7S0FDM0QsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErQ0c7QUFLSCxNQUFNLE9BQU8sWUFBWTtJQUN2Qiw4RUFBOEU7SUFDdEQsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFhLEtBQUssQ0FBQyxDQUFDO0lBQzNFLGlEQUFpRDtJQUV6QyxNQUFNLENBQW9CO0lBRWxDLHlCQUF5QjtJQUN6QixNQUFNLENBQWE7SUFFbkIsZ0JBQWdCLENBQVMsYUFBYSxDQUFlO0lBQ3JELGdCQUFnQixDQUFTLGVBQWUsQ0FBZTtJQUN2RCxnQkFBZ0IsQ0FBUyxPQUFPLENBQTRCO0lBQzVELGdCQUFnQixDQUFTLFFBQVEsQ0FBa0I7SUFDbkQsZ0JBQWdCLENBQVMsV0FBVyxDQUFTO0lBQzdDLFlBQXdDLFdBQW1CLEVBQUUsUUFBeUI7UUFDcEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLGtEQUFrRDtRQUNsRCwyQkFBMkI7UUFDM0IsTUFBTSxZQUFZLEdBQXlCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDbEUsU0FBUyxDQUFDLENBQUMsS0FBaUIsRUFBRSxFQUFFO1lBQzlCLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBZSxDQUFBLENBQUM7WUFFNUQsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNwQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQ3RCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FDckIsQ0FBQztZQUNGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV2QyxPQUFPLE1BQU0sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUVGLE1BQU0sWUFBWSxHQUFHLENBQUMsYUFBdUIsRUFBRSxFQUFFLENBQy9DLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLDZFQUE2RTtRQUM3RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQXdCLEVBQUUsRUFBRSxDQUNoRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FDakQsQ0FBQztRQUVGLE1BQU0sYUFBYSxHQUE4QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDaEUsU0FBUyxDQUFDLENBQUMsS0FBZSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQ3JHLENBQUM7UUFFRixxRUFBcUU7UUFDckUseURBQXlEO1FBQ3pELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWTthQUM5QixJQUFJLENBQ0gsU0FBUyxDQUFDLENBQUMsR0FBYSxFQUFFLEVBQUU7WUFDMUIsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUN2QixHQUFHLENBQUMsQ0FBQyxPQUFzQixFQUFFLEVBQUU7Z0JBQzdCLE1BQU0sUUFBUSxHQUFpQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0g7YUFDQSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLGFBQWE7WUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pELElBQUksSUFBSSxDQUFDLGVBQWU7WUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdELElBQUksSUFBSSxDQUFDLE9BQU87WUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUN2RSxDQUFDO0lBRU8sVUFBVSxDQUFDLE1BQWtCO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7dUdBOUVVLFlBQVk7MkZBQVosWUFBWSx3SkFJTixNQUFNOzsyRkFKWixZQUFZO2tCQUp4QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxnREFBZ0Q7b0JBQzFELFFBQVEsRUFBRSxjQUFjO2lCQUN6Qjs7MEJBZ0JjLElBQUk7OzBCQUFJLElBQUk7OzBCQUFJLFFBQVE7dUVBYmIsWUFBWTtzQkFBbkMsTUFBTTt1QkFBQyxjQUFjO2dCQUdkLE1BQU07c0JBRGIsZUFBZTt1QkFBQyxNQUFNLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgQ29udGVudENoaWxkcmVuLCBRdWVyeUxpc3QsIEhvc3QsIFNlbGYsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBVSVNyZWYgfSBmcm9tICcuL3VpU3JlZic7XG5pbXBvcnQge1xuICBQYXRoTm9kZSxcbiAgVHJhbnNpdGlvbixcbiAgVGFyZ2V0U3RhdGUsXG4gIFN0YXRlT2JqZWN0LFxuICBhbnlUcnVlUixcbiAgdGFpbCxcbiAgdW5uZXN0UixcbiAgUHJlZGljYXRlLFxuICBVSVJvdXRlckdsb2JhbHMsXG4gIFBhcmFtLFxuICBQYXRoVXRpbHMsXG4gIGlkZW50aXR5LFxuICB1bmlxUixcbn0gZnJvbSAnQHVpcm91dGVyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24sIE9ic2VydmFibGUsIEJlaGF2aW9yU3ViamVjdCwgb2YsIGZyb20sIGNvbWJpbmVMYXRlc3QsIGNvbmNhdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc3dpdGNoTWFwLCBtYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuLyoqIEBpbnRlcm5hbCAqL1xuaW50ZXJmYWNlIFRyYW5zRXZ0IHtcbiAgZXZ0OiBzdHJpbmc7XG4gIHRyYW5zOiBUcmFuc2l0aW9uO1xufVxuXG4vKipcbiAqIFVJU3JlZiBzdGF0dXMgZW1pdHRlZCBmcm9tIFtbVUlTcmVmU3RhdHVzXV1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcmVmU3RhdHVzIHtcbiAgLyoqIFRoZSBzcmVmJ3MgdGFyZ2V0IHN0YXRlIChvciBvbmUgb2YgaXRzIGNoaWxkcmVuKSBpcyBjdXJyZW50bHkgYWN0aXZlICovXG4gIGFjdGl2ZTogYm9vbGVhbjtcbiAgLyoqIFRoZSBzcmVmJ3MgdGFyZ2V0IHN0YXRlIGlzIGN1cnJlbnRseSBhY3RpdmUgKi9cbiAgZXhhY3Q6IGJvb2xlYW47XG4gIC8qKiBBIHRyYW5zaXRpb24gaXMgZW50ZXJpbmcgdGhlIHNyZWYncyB0YXJnZXQgc3RhdGUgKi9cbiAgZW50ZXJpbmc6IGJvb2xlYW47XG4gIC8qKiBBIHRyYW5zaXRpb24gaXMgZXhpdGluZyB0aGUgc3JlZidzIHRhcmdldCBzdGF0ZSAqL1xuICBleGl0aW5nOiBib29sZWFuO1xuICAvKiogVGhlIGVuY2xvc2VkIHNyZWYocykgdGFyZ2V0IHN0YXRlKHMpICovXG4gIHRhcmdldFN0YXRlczogVGFyZ2V0U3RhdGVbXTtcbn1cblxuLyoqIEBpbnRlcm5hbCAqL1xuY29uc3QgaW5hY3RpdmVTdGF0dXM6IFNyZWZTdGF0dXMgPSB7XG4gIGFjdGl2ZTogZmFsc2UsXG4gIGV4YWN0OiBmYWxzZSxcbiAgZW50ZXJpbmc6IGZhbHNlLFxuICBleGl0aW5nOiBmYWxzZSxcbiAgdGFyZ2V0U3RhdGVzOiBbXSxcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIFByZWRpY2F0ZTxQYXRoTm9kZVtdPlxuICpcbiAqIFRoZSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlIHdoZW4gdGhlIHRhcmdldCBzdGF0ZSAoYW5kIHBhcmFtIHZhbHVlcylcbiAqIG1hdGNoIHRoZSAodGFpbCBvZikgdGhlIHBhdGgsIGFuZCB0aGUgcGF0aCdzIHBhcmFtIHZhbHVlc1xuICpcbiAqIEBpbnRlcm5hbFxuICovXG5jb25zdCBwYXRoTWF0Y2hlcyA9ICh0YXJnZXQ6IFRhcmdldFN0YXRlKTogUHJlZGljYXRlPFBhdGhOb2RlW10+ID0+IHtcbiAgaWYgKCF0YXJnZXQuZXhpc3RzKCkpIHJldHVybiAoKSA9PiBmYWxzZTtcbiAgY29uc3Qgc3RhdGU6IFN0YXRlT2JqZWN0ID0gdGFyZ2V0LiRzdGF0ZSgpO1xuICBjb25zdCB0YXJnZXRQYXJhbVZhbHMgPSB0YXJnZXQucGFyYW1zKCk7XG4gIGNvbnN0IHRhcmdldFBhdGg6IFBhdGhOb2RlW10gPSBQYXRoVXRpbHMuYnVpbGRQYXRoKHRhcmdldCk7XG4gIGNvbnN0IHBhcmFtU2NoZW1hOiBQYXJhbVtdID0gdGFyZ2V0UGF0aFxuICAgIC5tYXAoKG5vZGUpID0+IG5vZGUucGFyYW1TY2hlbWEpXG4gICAgLnJlZHVjZSh1bm5lc3RSLCBbXSlcbiAgICAuZmlsdGVyKChwYXJhbTogUGFyYW0pID0+IHRhcmdldFBhcmFtVmFscy5oYXNPd25Qcm9wZXJ0eShwYXJhbS5pZCkpO1xuXG4gIHJldHVybiAocGF0aDogUGF0aE5vZGVbXSkgPT4ge1xuICAgIGNvbnN0IHRhaWxOb2RlID0gdGFpbChwYXRoKTtcbiAgICBpZiAoIXRhaWxOb2RlIHx8IHRhaWxOb2RlLnN0YXRlICE9PSBzdGF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHBhcmFtVmFsdWVzID0gUGF0aFV0aWxzLnBhcmFtVmFsdWVzKHBhdGgpO1xuICAgIHJldHVybiBQYXJhbS5lcXVhbHMocGFyYW1TY2hlbWEsIHBhcmFtVmFsdWVzLCB0YXJnZXRQYXJhbVZhbHMpO1xuICB9O1xufTtcblxuLyoqXG4gKiBHaXZlbiBiYXNlUGF0aDogW2EsIGJdLCBhcHBlbmRQYXRoOiBbYywgZF0pLFxuICogRXhwYW5kcyB0aGUgcGF0aCB0byBbY10sIFtjLCBkXVxuICogVGhlbiBhcHBlbmRzIGVhY2ggdG8gW2EsYixdIGFuZCByZXR1cm5zOiBbYSwgYiwgY10sIFthLCBiLCBjLCBkXVxuICpcbiAqIEBpbnRlcm5hbFxuICovXG5mdW5jdGlvbiBzcHJlYWRUb1N1YlBhdGhzKGJhc2VQYXRoOiBQYXRoTm9kZVtdLCBhcHBlbmRQYXRoOiBQYXRoTm9kZVtdKTogUGF0aE5vZGVbXVtdIHtcbiAgcmV0dXJuIGFwcGVuZFBhdGgubWFwKChub2RlKSA9PiBiYXNlUGF0aC5jb25jYXQoUGF0aFV0aWxzLnN1YlBhdGgoYXBwZW5kUGF0aCwgKG4pID0+IG4uc3RhdGUgPT09IG5vZGUuc3RhdGUpKSk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBUcmFuc0V2dCAoVHJhbnNpdGlvbiBldmVudDogc3RhcnRlZCwgc3VjY2VzcywgZXJyb3IpXG4gKiBhbmQgYSBVSVNyZWYgVGFyZ2V0IFN0YXRlLCByZXR1cm4gYSBTcmVmU3RhdHVzIG9iamVjdFxuICogd2hpY2ggcmVwcmVzZW50cyB0aGUgY3VycmVudCBzdGF0dXMgb2YgdGhhdCBTcmVmOlxuICogYWN0aXZlLCBhY3RpdmVFcSAoZXhhY3QgbWF0Y2gpLCBlbnRlcmluZywgZXhpdGluZ1xuICpcbiAqIEBpbnRlcm5hbFxuICovXG5mdW5jdGlvbiBnZXRTcmVmU3RhdHVzKGV2ZW50OiBUcmFuc0V2dCwgc3JlZlRhcmdldDogVGFyZ2V0U3RhdGUpOiBTcmVmU3RhdHVzIHtcbiAgY29uc3QgcGF0aE1hdGNoZXNUYXJnZXQgPSBwYXRoTWF0Y2hlcyhzcmVmVGFyZ2V0KTtcbiAgY29uc3QgdGMgPSBldmVudC50cmFucy50cmVlQ2hhbmdlcygpO1xuXG4gIGNvbnN0IGlzU3RhcnRFdmVudCA9IGV2ZW50LmV2dCA9PT0gJ3N0YXJ0JztcbiAgY29uc3QgaXNTdWNjZXNzRXZlbnQgPSBldmVudC5ldnQgPT09ICdzdWNjZXNzJztcbiAgY29uc3QgYWN0aXZlUGF0aDogUGF0aE5vZGVbXSA9IGlzU3VjY2Vzc0V2ZW50ID8gdGMudG8gOiB0Yy5mcm9tO1xuXG4gIGNvbnN0IGlzQWN0aXZlID0gKCkgPT4gc3ByZWFkVG9TdWJQYXRocyhbXSwgYWN0aXZlUGF0aCkubWFwKHBhdGhNYXRjaGVzVGFyZ2V0KS5yZWR1Y2UoYW55VHJ1ZVIsIGZhbHNlKTtcblxuICBjb25zdCBpc0V4YWN0ID0gKCkgPT4gcGF0aE1hdGNoZXNUYXJnZXQoYWN0aXZlUGF0aCk7XG5cbiAgY29uc3QgaXNFbnRlcmluZyA9ICgpID0+IHNwcmVhZFRvU3ViUGF0aHModGMucmV0YWluZWQsIHRjLmVudGVyaW5nKS5tYXAocGF0aE1hdGNoZXNUYXJnZXQpLnJlZHVjZShhbnlUcnVlUiwgZmFsc2UpO1xuXG4gIGNvbnN0IGlzRXhpdGluZyA9ICgpID0+IHNwcmVhZFRvU3ViUGF0aHModGMucmV0YWluZWQsIHRjLmV4aXRpbmcpLm1hcChwYXRoTWF0Y2hlc1RhcmdldCkucmVkdWNlKGFueVRydWVSLCBmYWxzZSk7XG5cbiAgcmV0dXJuIHtcbiAgICBhY3RpdmU6IGlzQWN0aXZlKCksXG4gICAgZXhhY3Q6IGlzRXhhY3QoKSxcbiAgICBlbnRlcmluZzogaXNTdGFydEV2ZW50ID8gaXNFbnRlcmluZygpIDogZmFsc2UsXG4gICAgZXhpdGluZzogaXNTdGFydEV2ZW50ID8gaXNFeGl0aW5nKCkgOiBmYWxzZSxcbiAgICB0YXJnZXRTdGF0ZXM6IFtzcmVmVGFyZ2V0XSxcbiAgfSBhcyBTcmVmU3RhdHVzO1xufVxuXG4vKiogQGludGVybmFsICovXG5mdW5jdGlvbiBtZXJnZVNyZWZTdGF0dXMobGVmdDogU3JlZlN0YXR1cywgcmlnaHQ6IFNyZWZTdGF0dXMpOiBTcmVmU3RhdHVzIHtcbiAgcmV0dXJuIHtcbiAgICBhY3RpdmU6IGxlZnQuYWN0aXZlIHx8IHJpZ2h0LmFjdGl2ZSxcbiAgICBleGFjdDogbGVmdC5leGFjdCB8fCByaWdodC5leGFjdCxcbiAgICBlbnRlcmluZzogbGVmdC5lbnRlcmluZyB8fCByaWdodC5lbnRlcmluZyxcbiAgICBleGl0aW5nOiBsZWZ0LmV4aXRpbmcgfHwgcmlnaHQuZXhpdGluZyxcbiAgICB0YXJnZXRTdGF0ZXM6IGxlZnQudGFyZ2V0U3RhdGVzLmNvbmNhdChyaWdodC50YXJnZXRTdGF0ZXMpLFxuICB9O1xufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHdoaWNoIGVtaXRzIGV2ZW50cyB3aGVuIGEgcGFpcmVkIFtbVUlTcmVmXV0gc3RhdHVzIGNoYW5nZXMuXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgaXMgcHJpbWFyaWx5IHVzZWQgYnkgdGhlIFtbVUlTcmVmQWN0aXZlXV0gZGlyZWN0aXZlcyB0byBtb25pdG9yIGBVSVNyZWZgKHMpLlxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHNoYXJlcyB0d28gYXR0cmlidXRlIHNlbGVjdG9ycyB3aXRoIGBVSVNyZWZBY3RpdmVgOlxuICpcbiAqIC0gYFt1aVNyZWZBY3RpdmVdYFxuICogLSBgW3VpU3JlZkFjdGl2ZUVxXWAuXG4gKlxuICogVGh1cywgd2hlbmV2ZXIgYSBgVUlTcmVmQWN0aXZlYCBkaXJlY3RpdmUgaXMgY3JlYXRlZCwgYSBgVUlTcmVmU3RhdHVzYCBkaXJlY3RpdmUgaXMgYWxzbyBjcmVhdGVkLlxuICpcbiAqIE1vc3QgYXBwcyBzaG91bGQgc2ltcGx5IHVzZSBgVUlTcmVmQWN0aXZlYCwgYnV0IHNvbWUgYWR2YW5jZWQgY29tcG9uZW50cyBtYXkgd2FudCB0byBwcm9jZXNzIHRoZVxuICogW1tTcmVmU3RhdHVzXV0gZXZlbnRzIGRpcmVjdGx5LlxuICpcbiAqIGBgYGpzXG4gKiA8bGkgKHVpU3JlZlN0YXR1cyk9XCJvblNyZWZTdGF0dXNDaGFuZ2VkKCRldmVudClcIj5cbiAqICAgPGEgdWlTcmVmPVwiYm9va1wiIFt1aVBhcmFtc109XCJ7IGJvb2tJZDogYm9vay5pZCB9XCI+Qm9vayB7eyBib29rLm5hbWUgfX08L2E+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogVGhlIGB1aVNyZWZTdGF0dXNgIGV2ZW50IGlzIGVtaXR0ZWQgd2hlbmV2ZXIgYW4gZW5jbG9zZWQgYHVpU3JlZmAncyBzdGF0dXMgY2hhbmdlcy5cbiAqIFRoZSBldmVudCBlbWl0dGVkIGlzIG9mIHR5cGUgW1tTcmVmU3RhdHVzXV0sIGFuZCBoYXMgYm9vbGVhbiB2YWx1ZXMgZm9yIGBhY3RpdmVgLCBgZXhhY3RgLCBgZW50ZXJpbmdgLCBhbmQgYGV4aXRpbmdgOyBhbHNvIGhhcyBhIFtbU3RhdGVPck5hbWVdXSBgaWRlbnRpZmllcmB2YWx1ZS5cbiAqXG4gKiBUaGUgdmFsdWVzIGZyb20gdGhpcyBldmVudCBjYW4gYmUgY2FwdHVyZWQgYW5kIHN0b3JlZCBvbiBhIGNvbXBvbmVudCAodGhlbiBhcHBsaWVkLCBlLmcuLCB1c2luZyBuZ0NsYXNzKS5cbiAqXG4gKiAtLS1cbiAqXG4gKiBBIHNpbmdsZSBgdWlTcmVmU3RhdHVzYCBjYW4gZW5jbG9zZSBtdWx0aXBsZSBgdWlTcmVmYC5cbiAqIEVhY2ggc3RhdHVzIGJvb2xlYW4gKGBhY3RpdmVgLCBgZXhhY3RgLCBgZW50ZXJpbmdgLCBgZXhpdGluZ2ApIHdpbGwgYmUgdHJ1ZSBpZiAqYW55IG9mIHRoZSBlbmNsb3NlZCBgdWlTcmVmYCBzdGF0dXMgaXMgdHJ1ZSouXG4gKiBJbiBvdGhlciB3b3JkcywgYWxsIGVuY2xvc2VkIGB1aVNyZWZgIHN0YXR1c2VzICBhcmUgbWVyZ2VkIHRvIGEgc2luZ2xlIHN0YXR1cyB1c2luZyBgfHxgIChsb2dpY2FsIG9yKS5cbiAqXG4gKiBgYGBqc1xuICogPGxpICh1aVNyZWZTdGF0dXMpPVwib25TcmVmU3RhdHVzKCRldmVudClcIiB1aVNyZWY9XCJhZG1pblwiPlxuICogICBIb21lXG4gKiAgIDx1bD5cbiAqICAgICA8bGk+IDxhIHVpU3JlZj1cImFkbWluLnVzZXJzXCI+VXNlcnM8L2E+IDwvbGk+XG4gKiAgICAgPGxpPiA8YSB1aVNyZWY9XCJhZG1pbi5ncm91cHNcIj5Hcm91cHM8L2E+IDwvbGk+XG4gKiAgIDwvdWw+XG4gKiA8L2xpPlxuICogYGBgXG4gKlxuICogSW4gdGhlIGFib3ZlIGV4YW1wbGUsIGAkZXZlbnQuYWN0aXZlID09PSB0cnVlYCB3aGVuIGVpdGhlciBgYWRtaW4udXNlcnNgIG9yIGBhZG1pbi5ncm91cHNgIGlzIGFjdGl2ZS5cbiAqXG4gKiAtLS1cbiAqXG4gKiBUaGlzIEFQSSBpcyBzdWJqZWN0IHRvIGNoYW5nZS5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3VpU3JlZlN0YXR1c10sW3VpU3JlZkFjdGl2ZV0sW3VpU3JlZkFjdGl2ZUVxXScsXG4gIGV4cG9ydEFzOiAndWlTcmVmU3RhdHVzJyxcbn0pXG5leHBvcnQgY2xhc3MgVUlTcmVmU3RhdHVzIHtcbiAgLyoqIGN1cnJlbnQgc3RhdHVzZXMgb2YgdGhlIHN0YXRlL3BhcmFtcyB0aGUgdWlTcmVmIGRpcmVjdGl2ZSBpcyBsaW5raW5nIHRvICovXG4gIEBPdXRwdXQoJ3VpU3JlZlN0YXR1cycpIHVpU3JlZlN0YXR1cyA9IG5ldyBFdmVudEVtaXR0ZXI8U3JlZlN0YXR1cz4oZmFsc2UpO1xuICAvKiogTW9uaXRvciBhbGwgY2hpbGQgY29tcG9uZW50cyBmb3IgVUlTcmVmKHMpICovXG4gIEBDb250ZW50Q2hpbGRyZW4oVUlTcmVmLCB7IGRlc2NlbmRhbnRzOiB0cnVlIH0pXG4gIHByaXZhdGUgX3NyZWZzOiBRdWVyeUxpc3Q8VUlTcmVmPjtcblxuICAvKiogVGhlIGN1cnJlbnQgc3RhdHVzICovXG4gIHN0YXR1czogU3JlZlN0YXR1cztcblxuICAvKiogQGludGVybmFsICovIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuICAvKiogQGludGVybmFsICovIHByaXZhdGUgX3NyZWZDaGFuZ2VzU3ViOiBTdWJzY3JpcHRpb247XG4gIC8qKiBAaW50ZXJuYWwgKi8gcHJpdmF0ZSBfc3JlZnMkOiBCZWhhdmlvclN1YmplY3Q8VUlTcmVmW10+O1xuICAvKiogQGludGVybmFsICovIHByaXZhdGUgX2dsb2JhbHM6IFVJUm91dGVyR2xvYmFscztcbiAgLyoqIEBpbnRlcm5hbCAqLyBwcml2YXRlIF9ob3N0VWlTcmVmOiBVSVNyZWY7XG4gIGNvbnN0cnVjdG9yKEBIb3N0KCkgQFNlbGYoKSBAT3B0aW9uYWwoKSBfaG9zdFVpU3JlZjogVUlTcmVmLCBfZ2xvYmFsczogVUlSb3V0ZXJHbG9iYWxzKSB7XG4gICAgdGhpcy5fZ2xvYmFscyA9IF9nbG9iYWxzO1xuICAgIHRoaXMuX2hvc3RVaVNyZWYgPSBfaG9zdFVpU3JlZjtcbiAgICB0aGlzLnN0YXR1cyA9IE9iamVjdC5hc3NpZ24oe30sIGluYWN0aXZlU3RhdHVzKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAvLyBNYXAgZWFjaCB0cmFuc2l0aW9uIHN0YXJ0IGV2ZW50IHRvIGEgc3RyZWFtIG9mOlxuICAgIC8vIHN0YXJ0IC0+IChzdWNjZXNzfGVycm9yKVxuICAgIGNvbnN0IHRyYW5zRXZlbnRzJDogT2JzZXJ2YWJsZTxUcmFuc0V2dD4gPSB0aGlzLl9nbG9iYWxzLnN0YXJ0JC5waXBlKFxuICAgICAgc3dpdGNoTWFwKCh0cmFuczogVHJhbnNpdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBldmVudCA9IChldnQ6IHN0cmluZykgPT4gKHsgZXZ0LCB0cmFucyB9IGFzIFRyYW5zRXZ0KTtcblxuICAgICAgICBjb25zdCB0cmFuc1N0YXJ0JCA9IG9mKGV2ZW50KCdzdGFydCcpKTtcbiAgICAgICAgY29uc3QgdHJhbnNSZXN1bHQgPSB0cmFucy5wcm9taXNlLnRoZW4oXG4gICAgICAgICAgKCkgPT4gZXZlbnQoJ3N1Y2Nlc3MnKSxcbiAgICAgICAgICAoKSA9PiBldmVudCgnZXJyb3InKVxuICAgICAgICApO1xuICAgICAgICBjb25zdCB0cmFuc0ZpbmlzaCQgPSBmcm9tKHRyYW5zUmVzdWx0KTtcblxuICAgICAgICByZXR1cm4gY29uY2F0KHRyYW5zU3RhcnQkLCB0cmFuc0ZpbmlzaCQpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgY29uc3Qgd2l0aEhvc3RTcmVmID0gKGNoaWxkcmVuU3JlZnM6IFVJU3JlZltdKSA9PlxuICAgICAgY2hpbGRyZW5TcmVmcy5jb25jYXQodGhpcy5faG9zdFVpU3JlZikuZmlsdGVyKGlkZW50aXR5KS5yZWR1Y2UodW5pcVIsIFtdKTtcblxuICAgIC8vIFdhdGNoIHRoZSBAQ29udGVudENoaWxkcmVuIFVJU3JlZltdIGNvbXBvbmVudHMgYW5kIGdldCB0aGVpciB0YXJnZXQgc3RhdGVzXG4gICAgdGhpcy5fc3JlZnMkID0gbmV3IEJlaGF2aW9yU3ViamVjdCh3aXRoSG9zdFNyZWYodGhpcy5fc3JlZnMudG9BcnJheSgpKSk7XG4gICAgdGhpcy5fc3JlZkNoYW5nZXNTdWIgPSB0aGlzLl9zcmVmcy5jaGFuZ2VzLnN1YnNjcmliZSgoc3JlZnM6IFF1ZXJ5TGlzdDxVSVNyZWY+KSA9PlxuICAgICAgdGhpcy5fc3JlZnMkLm5leHQod2l0aEhvc3RTcmVmKHNyZWZzLnRvQXJyYXkoKSkpXG4gICAgKTtcblxuICAgIGNvbnN0IHRhcmdldFN0YXRlcyQ6IE9ic2VydmFibGU8VGFyZ2V0U3RhdGVbXT4gPSB0aGlzLl9zcmVmcyQucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoc3JlZnM6IFVJU3JlZltdKSA9PiBjb21iaW5lTGF0ZXN0PFRhcmdldFN0YXRlW10+KHNyZWZzLm1hcCgoc3JlZikgPT4gc3JlZi50YXJnZXRTdGF0ZSQpKSlcbiAgICApO1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBzdGF0dXMgb2YgZWFjaCBVSVNyZWYgYmFzZWQgb24gdGhlIHRyYW5zaXRpb24gZXZlbnQuXG4gICAgLy8gUmVkdWNlIHRoZSBzdGF0dXNlcyAoaWYgbXVsdGlwbGUpIGJ5IG9yLWluZyBlYWNoIGZsYWcuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gdHJhbnNFdmVudHMkXG4gICAgICAucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKChldnQ6IFRyYW5zRXZ0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldFN0YXRlcyQucGlwZShcbiAgICAgICAgICAgIG1hcCgodGFyZ2V0czogVGFyZ2V0U3RhdGVbXSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdGF0dXNlczogU3JlZlN0YXR1c1tdID0gdGFyZ2V0cy5tYXAoKHRhcmdldCkgPT4gZ2V0U3JlZlN0YXR1cyhldnQsIHRhcmdldCkpO1xuICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzZXMucmVkdWNlKG1lcmdlU3JlZlN0YXR1cyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICAuc3Vic2NyaWJlKHRoaXMuX3NldFN0YXR1cy5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIGlmICh0aGlzLl9zcmVmQ2hhbmdlc1N1YikgdGhpcy5fc3JlZkNoYW5nZXNTdWIudW5zdWJzY3JpYmUoKTtcbiAgICBpZiAodGhpcy5fc3JlZnMkKSB0aGlzLl9zcmVmcyQudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSB0aGlzLl9zcmVmQ2hhbmdlc1N1YiA9IHRoaXMuX3NyZWZzJCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgX3NldFN0YXR1cyhzdGF0dXM6IFNyZWZTdGF0dXMpIHtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLnVpU3JlZlN0YXR1cy5lbWl0KHN0YXR1cyk7XG4gIH1cbn1cbiJdfQ==