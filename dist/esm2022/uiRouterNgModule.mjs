import { UIROUTER_MODULE_TOKEN, UIROUTER_ROOT_MODULE } from './injectionTokens';
import { NgModule, APP_INITIALIZER, } from '@angular/core';
import { CommonModule, LocationStrategy, HashLocationStrategy, PathLocationStrategy } from '@angular/common';
import { _UIROUTER_DIRECTIVES } from './directives/directives';
import { TransitionService } from '@uirouter/core';
import { _UIROUTER_INSTANCE_PROVIDERS, _UIROUTER_SERVICE_PROVIDERS } from './providers';
import * as i0 from "@angular/core";
import * as i1 from "./directives/uiSref";
import * as i2 from "./directives/uiView";
import * as i3 from "./directives/uiSrefActive";
import * as i4 from "./directives/uiSrefStatus";
// Delay angular bootstrap until first transition is successful, for SSR.
// See https://github.com/ui-router/angular/pull/127
export function onTransitionReady(transitionService, root) {
    const mod = root[0];
    if (!mod || !mod.deferInitialRender) {
        return () => Promise.resolve();
    }
    return () => new Promise((resolve) => {
        const hook = (trans) => {
            trans.promise.then(resolve, resolve);
        };
        transitionService.onStart({}, hook, { invokeLimit: 1 });
    });
}
export function makeRootProviders(module) {
    return [
        { provide: UIROUTER_ROOT_MODULE, useValue: module, multi: true },
        { provide: UIROUTER_MODULE_TOKEN, useValue: module, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: onTransitionReady,
            deps: [TransitionService, UIROUTER_ROOT_MODULE],
            multi: true,
        },
    ];
}
export function makeChildProviders(module) {
    return [
        { provide: UIROUTER_MODULE_TOKEN, useValue: module, multi: true },
    ];
}
export function locationStrategy(useHash) {
    return { provide: LocationStrategy, useClass: useHash ? HashLocationStrategy : PathLocationStrategy };
}
/**
 * Creates UI-Router Modules
 *
 * This class has two static factory methods which create UIRouter Modules.
 * A UI-Router Module is an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
 * with support for UI-Router.
 *
 * ### UIRouter Directives
 *
 * When a UI-Router Module is imported into a `NgModule`, that module's components
 * can use the UIRouter Directives such as [[UIView]], [[UISref]], [[UISrefActive]].
 *
 * ### State Definitions
 *
 * State definitions found in the `states:` property are provided to the Dependency Injector.
 * This enables UI-Router to automatically register the states with the [[StateRegistry]] at bootstrap (and during lazy load).
 */
export class UIRouterModule {
    /**
     * Creates a UI-Router Module for the root (bootstrapped) application module to import
     *
     * This factory function creates an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
     * with UI-Router support.
     *
     * The `forRoot` module should be added to the `imports:` of the `NgModule` being bootstrapped.
     * An application should only create and import a single `NgModule` using `forRoot()`.
     * All other modules should be created using [[UIRouterModule.forChild]].
     *
     * Unlike `forChild`, an `NgModule` returned by this factory provides the [[UIRouter]] singleton object.
     * This factory also accepts root-level router configuration.
     * These are the only differences between `forRoot` and `forChild`.
     *
     * Example:
     * ```js
     * let routerConfig = {
     *   otherwise: '/home',
     *   states: [homeState, aboutState]
     * };
     *
     * @ NgModule({
     *   imports: [
     *     BrowserModule,
     *     UIRouterModule.forRoot(routerConfig),
     *     FeatureModule1
     *   ]
     * })
     * class MyRootAppModule {}
     *
     * browserPlatformDynamic.bootstrapModule(MyRootAppModule);
     * ```
     *
     * @param config declarative UI-Router configuration
     * @returns an `NgModule` which provides the [[UIRouter]] singleton instance
     */
    static forRoot(config = {}) {
        return {
            ngModule: UIRouterModule,
            providers: [
                _UIROUTER_INSTANCE_PROVIDERS,
                _UIROUTER_SERVICE_PROVIDERS,
                locationStrategy(config.useHash),
                ...makeRootProviders(config),
            ],
        };
    }
    /**
     * Creates an `NgModule` for a UIRouter module
     *
     * This function creates an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
     * with UI-Router support.
     *
     * #### Example:
     * ```js
     * var homeState = { name: 'home', url: '/home', component: Home };
     * var aboutState = { name: 'about', url: '/about', component: About };
     *
     * @ NgModule({
     *   imports: [
     *     UIRouterModule.forChild({ states: [ homeState, aboutState ] }),
     *     SharedModule,
     *   ],
     *   declarations: [ Home, About ],
     * })
     * export class AppModule {};
     * ```
     *
     * @param module UI-Router module options
     * @returns an `NgModule`
     */
    static forChild(module = {}) {
        return {
            ngModule: UIRouterModule,
            providers: makeChildProviders(module),
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UIRouterModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.6", ngImport: i0, type: UIRouterModule, declarations: [i1.UISref, i1.AnchorUISref, i2.UIView, i3.UISrefActive, i4.UISrefStatus], imports: [CommonModule], exports: [i1.UISref, i1.AnchorUISref, i2.UIView, i3.UISrefActive, i4.UISrefStatus] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UIRouterModule, imports: [CommonModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.6", ngImport: i0, type: UIRouterModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [_UIROUTER_DIRECTIVES],
                    exports: [_UIROUTER_DIRECTIVES],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlSb3V0ZXJOZ01vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aVJvdXRlck5nTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWhGLE9BQU8sRUFDTCxRQUFRLEVBSVIsZUFBZSxHQUNoQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0csT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFL0QsT0FBTyxFQUEyRCxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7Ozs7O0FBRXhGLHlFQUF5RTtBQUN6RSxvREFBb0Q7QUFDcEQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLGlCQUFvQyxFQUFFLElBQWtCO0lBQ3hGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDcEMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELE9BQU8sR0FBRyxFQUFFLENBQ1YsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUN0QixNQUFNLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3JCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUM7UUFDRixpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxNQUFrQjtJQUNsRCxPQUFPO1FBQ0wsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ2hFLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUNqRTtZQUNFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLFVBQVUsRUFBRSxpQkFBaUI7WUFDN0IsSUFBSSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLENBQUM7WUFDL0MsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLE1BQW9CO0lBQ3JELE9BQU87UUFDTCxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7S0FDbEUsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsT0FBTztJQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0FBQ3hHLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQU1ILE1BQU0sT0FBTyxjQUFjO0lBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW1DRztJQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBcUIsRUFBRTtRQUNwQyxPQUFPO1lBQ0wsUUFBUSxFQUFFLGNBQWM7WUFDeEIsU0FBUyxFQUFFO2dCQUNULDRCQUE0QjtnQkFDNUIsMkJBQTJCO2dCQUMzQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUNoQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQzthQUM3QjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BdUJHO0lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUF1QixFQUFFO1FBQ3ZDLE9BQU87WUFDTCxRQUFRLEVBQUUsY0FBYztZQUN4QixTQUFTLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1NBQ3RDLENBQUM7SUFDSixDQUFDO3VHQTlFVSxjQUFjO3dHQUFkLGNBQWMscUdBSmYsWUFBWTt3R0FJWCxjQUFjLFlBSmYsWUFBWTs7MkZBSVgsY0FBYztrQkFMMUIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3ZCLFlBQVksRUFBRSxDQUFDLG9CQUFvQixDQUFDO29CQUNwQyxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVSVJPVVRFUl9NT0RVTEVfVE9LRU4sIFVJUk9VVEVSX1JPT1RfTU9EVUxFIH0gZnJvbSAnLi9pbmplY3Rpb25Ub2tlbnMnO1xuaW1wb3J0IHsgTmcyU3RhdGVEZWNsYXJhdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCB7XG4gIE5nTW9kdWxlLFxuICBNb2R1bGVXaXRoUHJvdmlkZXJzLFxuICBQcm92aWRlcixcbiAgSW5qZWN0b3IsXG4gIEFQUF9JTklUSUFMSVpFUixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUsIExvY2F0aW9uU3RyYXRlZ3ksIEhhc2hMb2NhdGlvblN0cmF0ZWd5LCBQYXRoTG9jYXRpb25TdHJhdGVneSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBfVUlST1VURVJfRElSRUNUSVZFUyB9IGZyb20gJy4vZGlyZWN0aXZlcy9kaXJlY3RpdmVzJztcbmltcG9ydCB7IFVJVmlldyB9IGZyb20gJy4vZGlyZWN0aXZlcy91aVZpZXcnO1xuaW1wb3J0IHsgVXJsUnVsZUhhbmRsZXJGbiwgVGFyZ2V0U3RhdGUsIFRhcmdldFN0YXRlRGVmLCBVSVJvdXRlciwgVHJhbnNpdGlvblNlcnZpY2UgfSBmcm9tICdAdWlyb3V0ZXIvY29yZSc7XG5pbXBvcnQgeyBfVUlST1VURVJfSU5TVEFOQ0VfUFJPVklERVJTLCBfVUlST1VURVJfU0VSVklDRV9QUk9WSURFUlMgfSBmcm9tICcuL3Byb3ZpZGVycyc7XG5cbi8vIERlbGF5IGFuZ3VsYXIgYm9vdHN0cmFwIHVudGlsIGZpcnN0IHRyYW5zaXRpb24gaXMgc3VjY2Vzc2Z1bCwgZm9yIFNTUi5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdWktcm91dGVyL2FuZ3VsYXIvcHVsbC8xMjdcbmV4cG9ydCBmdW5jdGlvbiBvblRyYW5zaXRpb25SZWFkeSh0cmFuc2l0aW9uU2VydmljZTogVHJhbnNpdGlvblNlcnZpY2UsIHJvb3Q6IFJvb3RNb2R1bGVbXSkge1xuICBjb25zdCBtb2QgPSByb290WzBdO1xuICBpZiAoIW1vZCB8fCAhbW9kLmRlZmVySW5pdGlhbFJlbmRlcikge1xuICAgIHJldHVybiAoKSA9PiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHJldHVybiAoKSA9PlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBob29rID0gKHRyYW5zKSA9PiB7XG4gICAgICAgIHRyYW5zLnByb21pc2UudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgIH07XG4gICAgICB0cmFuc2l0aW9uU2VydmljZS5vblN0YXJ0KHt9LCBob29rLCB7IGludm9rZUxpbWl0OiAxIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJvb3RQcm92aWRlcnMobW9kdWxlOiBSb290TW9kdWxlKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAgeyBwcm92aWRlOiBVSVJPVVRFUl9ST09UX01PRFVMRSwgdXNlVmFsdWU6IG1vZHVsZSwgbXVsdGk6IHRydWUgfSxcbiAgICB7IHByb3ZpZGU6IFVJUk9VVEVSX01PRFVMRV9UT0tFTiwgdXNlVmFsdWU6IG1vZHVsZSwgbXVsdGk6IHRydWUgfSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBBUFBfSU5JVElBTElaRVIsXG4gICAgICB1c2VGYWN0b3J5OiBvblRyYW5zaXRpb25SZWFkeSxcbiAgICAgIGRlcHM6IFtUcmFuc2l0aW9uU2VydmljZSwgVUlST1VURVJfUk9PVF9NT0RVTEVdLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDaGlsZFByb3ZpZGVycyhtb2R1bGU6IFN0YXRlc01vZHVsZSk6IFByb3ZpZGVyW10ge1xuICByZXR1cm4gW1xuICAgIHsgcHJvdmlkZTogVUlST1VURVJfTU9EVUxFX1RPS0VOLCB1c2VWYWx1ZTogbW9kdWxlLCBtdWx0aTogdHJ1ZSB9LFxuICBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9jYXRpb25TdHJhdGVneSh1c2VIYXNoKSB7XG4gIHJldHVybiB7IHByb3ZpZGU6IExvY2F0aW9uU3RyYXRlZ3ksIHVzZUNsYXNzOiB1c2VIYXNoID8gSGFzaExvY2F0aW9uU3RyYXRlZ3kgOiBQYXRoTG9jYXRpb25TdHJhdGVneSB9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgVUktUm91dGVyIE1vZHVsZXNcbiAqXG4gKiBUaGlzIGNsYXNzIGhhcyB0d28gc3RhdGljIGZhY3RvcnkgbWV0aG9kcyB3aGljaCBjcmVhdGUgVUlSb3V0ZXIgTW9kdWxlcy5cbiAqIEEgVUktUm91dGVyIE1vZHVsZSBpcyBhbiBbQW5ndWxhciBOZ01vZHVsZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2d1aWRlL25nbW9kdWxlLmh0bWwpXG4gKiB3aXRoIHN1cHBvcnQgZm9yIFVJLVJvdXRlci5cbiAqXG4gKiAjIyMgVUlSb3V0ZXIgRGlyZWN0aXZlc1xuICpcbiAqIFdoZW4gYSBVSS1Sb3V0ZXIgTW9kdWxlIGlzIGltcG9ydGVkIGludG8gYSBgTmdNb2R1bGVgLCB0aGF0IG1vZHVsZSdzIGNvbXBvbmVudHNcbiAqIGNhbiB1c2UgdGhlIFVJUm91dGVyIERpcmVjdGl2ZXMgc3VjaCBhcyBbW1VJVmlld11dLCBbW1VJU3JlZl1dLCBbW1VJU3JlZkFjdGl2ZV1dLlxuICpcbiAqICMjIyBTdGF0ZSBEZWZpbml0aW9uc1xuICpcbiAqIFN0YXRlIGRlZmluaXRpb25zIGZvdW5kIGluIHRoZSBgc3RhdGVzOmAgcHJvcGVydHkgYXJlIHByb3ZpZGVkIHRvIHRoZSBEZXBlbmRlbmN5IEluamVjdG9yLlxuICogVGhpcyBlbmFibGVzIFVJLVJvdXRlciB0byBhdXRvbWF0aWNhbGx5IHJlZ2lzdGVyIHRoZSBzdGF0ZXMgd2l0aCB0aGUgW1tTdGF0ZVJlZ2lzdHJ5XV0gYXQgYm9vdHN0cmFwIChhbmQgZHVyaW5nIGxhenkgbG9hZCkuXG4gKi9cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtfVUlST1VURVJfRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IFtfVUlST1VURVJfRElSRUNUSVZFU10sXG59KVxuZXhwb3J0IGNsYXNzIFVJUm91dGVyTW9kdWxlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBVSS1Sb3V0ZXIgTW9kdWxlIGZvciB0aGUgcm9vdCAoYm9vdHN0cmFwcGVkKSBhcHBsaWNhdGlvbiBtb2R1bGUgdG8gaW1wb3J0XG4gICAqXG4gICAqIFRoaXMgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVzIGFuIFtBbmd1bGFyIE5nTW9kdWxlXShodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvZ3VpZGUvbmdtb2R1bGUuaHRtbClcbiAgICogd2l0aCBVSS1Sb3V0ZXIgc3VwcG9ydC5cbiAgICpcbiAgICogVGhlIGBmb3JSb290YCBtb2R1bGUgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBgaW1wb3J0czpgIG9mIHRoZSBgTmdNb2R1bGVgIGJlaW5nIGJvb3RzdHJhcHBlZC5cbiAgICogQW4gYXBwbGljYXRpb24gc2hvdWxkIG9ubHkgY3JlYXRlIGFuZCBpbXBvcnQgYSBzaW5nbGUgYE5nTW9kdWxlYCB1c2luZyBgZm9yUm9vdCgpYC5cbiAgICogQWxsIG90aGVyIG1vZHVsZXMgc2hvdWxkIGJlIGNyZWF0ZWQgdXNpbmcgW1tVSVJvdXRlck1vZHVsZS5mb3JDaGlsZF1dLlxuICAgKlxuICAgKiBVbmxpa2UgYGZvckNoaWxkYCwgYW4gYE5nTW9kdWxlYCByZXR1cm5lZCBieSB0aGlzIGZhY3RvcnkgcHJvdmlkZXMgdGhlIFtbVUlSb3V0ZXJdXSBzaW5nbGV0b24gb2JqZWN0LlxuICAgKiBUaGlzIGZhY3RvcnkgYWxzbyBhY2NlcHRzIHJvb3QtbGV2ZWwgcm91dGVyIGNvbmZpZ3VyYXRpb24uXG4gICAqIFRoZXNlIGFyZSB0aGUgb25seSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBmb3JSb290YCBhbmQgYGZvckNoaWxkYC5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogYGBganNcbiAgICogbGV0IHJvdXRlckNvbmZpZyA9IHtcbiAgICogICBvdGhlcndpc2U6ICcvaG9tZScsXG4gICAqICAgc3RhdGVzOiBbaG9tZVN0YXRlLCBhYm91dFN0YXRlXVxuICAgKiB9O1xuICAgKlxuICAgKiBAIE5nTW9kdWxlKHtcbiAgICogICBpbXBvcnRzOiBbXG4gICAqICAgICBCcm93c2VyTW9kdWxlLFxuICAgKiAgICAgVUlSb3V0ZXJNb2R1bGUuZm9yUm9vdChyb3V0ZXJDb25maWcpLFxuICAgKiAgICAgRmVhdHVyZU1vZHVsZTFcbiAgICogICBdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15Um9vdEFwcE1vZHVsZSB7fVxuICAgKlxuICAgKiBicm93c2VyUGxhdGZvcm1EeW5hbWljLmJvb3RzdHJhcE1vZHVsZShNeVJvb3RBcHBNb2R1bGUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGNvbmZpZyBkZWNsYXJhdGl2ZSBVSS1Sb3V0ZXIgY29uZmlndXJhdGlvblxuICAgKiBAcmV0dXJucyBhbiBgTmdNb2R1bGVgIHdoaWNoIHByb3ZpZGVzIHRoZSBbW1VJUm91dGVyXV0gc2luZ2xldG9uIGluc3RhbmNlXG4gICAqL1xuICBzdGF0aWMgZm9yUm9vdChjb25maWc6IFJvb3RNb2R1bGUgPSB7fSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8VUlSb3V0ZXJNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFVJUm91dGVyTW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIF9VSVJPVVRFUl9JTlNUQU5DRV9QUk9WSURFUlMsXG4gICAgICAgIF9VSVJPVVRFUl9TRVJWSUNFX1BST1ZJREVSUyxcbiAgICAgICAgbG9jYXRpb25TdHJhdGVneShjb25maWcudXNlSGFzaCksXG4gICAgICAgIC4uLm1ha2VSb290UHJvdmlkZXJzKGNvbmZpZyksXG4gICAgICBdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBgTmdNb2R1bGVgIGZvciBhIFVJUm91dGVyIG1vZHVsZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNyZWF0ZXMgYW4gW0FuZ3VsYXIgTmdNb2R1bGVdKGh0dHBzOi8vYW5ndWxhci5pby9kb2NzL3RzL2xhdGVzdC9ndWlkZS9uZ21vZHVsZS5odG1sKVxuICAgKiB3aXRoIFVJLVJvdXRlciBzdXBwb3J0LlxuICAgKlxuICAgKiAjIyMjIEV4YW1wbGU6XG4gICAqIGBgYGpzXG4gICAqIHZhciBob21lU3RhdGUgPSB7IG5hbWU6ICdob21lJywgdXJsOiAnL2hvbWUnLCBjb21wb25lbnQ6IEhvbWUgfTtcbiAgICogdmFyIGFib3V0U3RhdGUgPSB7IG5hbWU6ICdhYm91dCcsIHVybDogJy9hYm91dCcsIGNvbXBvbmVudDogQWJvdXQgfTtcbiAgICpcbiAgICogQCBOZ01vZHVsZSh7XG4gICAqICAgaW1wb3J0czogW1xuICAgKiAgICAgVUlSb3V0ZXJNb2R1bGUuZm9yQ2hpbGQoeyBzdGF0ZXM6IFsgaG9tZVN0YXRlLCBhYm91dFN0YXRlIF0gfSksXG4gICAqICAgICBTaGFyZWRNb2R1bGUsXG4gICAqICAgXSxcbiAgICogICBkZWNsYXJhdGlvbnM6IFsgSG9tZSwgQWJvdXQgXSxcbiAgICogfSlcbiAgICogZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7fTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGUgVUktUm91dGVyIG1vZHVsZSBvcHRpb25zXG4gICAqIEByZXR1cm5zIGFuIGBOZ01vZHVsZWBcbiAgICovXG4gIHN0YXRpYyBmb3JDaGlsZChtb2R1bGU6IFN0YXRlc01vZHVsZSA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxVSVJvdXRlck1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogVUlSb3V0ZXJNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IG1ha2VDaGlsZFByb3ZpZGVycyhtb2R1bGUpLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBVSS1Sb3V0ZXIgZGVjbGFyYXRpdmUgY29uZmlndXJhdGlvbiB3aGljaCBjYW4gYmUgcHJvdmlkZWQgdG8gW1tVSVJvdXRlck1vZHVsZS5mb3JSb290XV1cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb290TW9kdWxlIGV4dGVuZHMgU3RhdGVzTW9kdWxlIHtcbiAgLyoqXG4gICAqIENob29zZXMgYSBgTG9jYXRpb25TdHJhdGVneWAuXG4gICAqXG4gICAqIFRoZSBsb2NhdGlvbiBzdHJhdGVneSBlbmFibGVzIGVpdGhlciBIVE1MNSBQdXNoIFN0YXRlXG4gICAqIChSZXF1aXJlcyBzZXJ2ZXItc2lkZSBzdXBwb3J0KSBvciBcIkhhc2hCYW5nXCIgVVJMcy5cbiAgICpcbiAgICogV2hlbiBgZmFsc2VgLCB1c2VzIFtgUGF0aExvY2F0aW9uU3RyYXRlZ3lgXShodHRwczovL2FuZ3VsYXIuaW8vZG9jcy90cy9sYXRlc3QvYXBpL2NvbW1vbi9pbmRleC9QYXRoTG9jYXRpb25TdHJhdGVneS1jbGFzcy5odG1sKVxuICAgKiBXaGVuIGB0cnVlYCwgdXNlcyBbYEhhc2hMb2NhdGlvblN0cmF0ZWd5YF0oaHR0cHM6Ly9hbmd1bGFyLmlvL2RvY3MvdHMvbGF0ZXN0L2FwaS9jb21tb24vaW5kZXgvSGFzaExvY2F0aW9uU3RyYXRlZ3ktY2xhc3MuaHRtbClcbiAgICpcbiAgICogRGVmYXVsdHMgdG8gYGZhbHNlYFxuICAgKi9cbiAgdXNlSGFzaD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIGBvdGhlcndpc2VgIHJ1bGUsIHdoaWNoIGNob29zZXMgdGhlIHN0YXRlIG9yIFVSTCB0byBhY3RpdmF0ZSB3aGVuIG5vIG90aGVyIHJvdXRlcyBtYXRjaGVkLlxuICAgKlxuICAgKiBTZWU6IFtbVXJsUnVsZXNBcGkub3RoZXJ3aXNlXV0uXG4gICAqL1xuICBvdGhlcndpc2U/OiBzdHJpbmcgfCBVcmxSdWxlSGFuZGxlckZuIHwgVGFyZ2V0U3RhdGUgfCBUYXJnZXRTdGF0ZURlZjtcblxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgYGluaXRpYWxgIHJ1bGUsIHdoaWNoIGNob29zZXMgdGhlIHN0YXRlIG9yIFVSTCB0byBhY3RpdmF0ZSB3aGVuIHRoZVxuICAgKiBhcHBsaWNhdGlvbiBpbml0aWFsbHkgc3RhcnRzLCBhbmQgbm8gb3RoZXIgcm91dGVzIG1hdGNoZWQuXG4gICAqXG4gICAqIFNlZTogW1tVcmxSdWxlc0FwaS5pbml0aWFsXV0uXG4gICAqL1xuICBpbml0aWFsPzogc3RyaW5nIHwgVXJsUnVsZUhhbmRsZXJGbiB8IFRhcmdldFN0YXRlIHwgVGFyZ2V0U3RhdGVEZWY7XG5cbiAgLyoqXG4gICAqIFNldHMgW1tVcmxSb3V0ZXJQcm92aWRlci5kZWZlckludGVyY2VwdF1dXG4gICAqL1xuICBkZWZlckludGVyY2VwdD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRlbGxzIEFuZ3VsYXIgdG8gZGVmZXIgdGhlIGZpcnN0IHJlbmRlciB1bnRpbCBhZnRlciB0aGUgaW5pdGlhbCB0cmFuc2l0aW9uIGlzIGNvbXBsZXRlLlxuICAgKlxuICAgKiBXaGVuIGB0cnVlYCwgYWRkcyBhbiBhc3luYyBgQVBQX0lOSVRJQUxJWkVSYCB3aGljaCBpcyByZXNvbHZlZCBhZnRlciBhbnkgYG9uU3VjY2Vzc2Agb3IgYG9uRXJyb3JgLlxuICAgKiBUaGUgaW5pdGlhbGl6ZXIgc3RvcHMgYW5ndWxhciBmcm9tIHJlbmRlcmluZyB0aGUgcm9vdCBjb21wb25lbnQgdW50aWwgYWZ0ZXIgdGhlIGZpcnN0IHRyYW5zaXRpb24gY29tcGxldGVzLlxuICAgKiBUaGlzIG1heSBwcmV2ZW50IGluaXRpYWwgcGFnZSBmbGlja2VyIHdoaWxlIHRoZSBzdGF0ZSBpcyBiZWluZyBsb2FkZWQuXG4gICAqXG4gICAqIERlZmF1bHRzIHRvIGBmYWxzZWBcbiAgICovXG4gIGRlZmVySW5pdGlhbFJlbmRlcj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVUktUm91dGVyIE1vZHVsZSBkZWNsYXJhdGl2ZSBjb25maWd1cmF0aW9uIHdoaWNoIGNhbiBiZSBwYXNzZWQgdG8gW1tVSVJvdXRlck1vZHVsZS5mb3JDaGlsZF1dXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGVzTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBtb2R1bGUncyBVSS1Sb3V0ZXIgc3RhdGVzXG4gICAqXG4gICAqIFRoaXMgbGlzdCBvZiBbW05nMlN0YXRlRGVjbGFyYXRpb25dXSBvYmplY3RzIHdpbGwgYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBbW1N0YXRlUmVnaXN0cnldXS5cbiAgICovXG4gIHN0YXRlcz86IE5nMlN0YXRlRGVjbGFyYXRpb25bXTtcblxuICAvKipcbiAgICogQSBVSS1Sb3V0ZXIgTW9kdWxlJ3MgaW1wZXJhdGl2ZSBjb25maWd1cmF0aW9uXG4gICAqXG4gICAqIElmIGEgVUktUm91dGVyIE1vZHVsZSBuZWVkcyB0byBwZXJmb3JtIHNvbWUgY29uZmlndXJhdGlvbiAoc3VjaCBhcyByZWdpc3RlcmluZ1xuICAgKiBwYXJhbWV0ZXIgdHlwZXMgb3IgVHJhbnNpdGlvbiBIb29rcykgYSBgY29uZmlnRm5gIHNob3VsZCBiZSBzdXBwbGllZC5cbiAgICogVGhlIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRoZSBgVUlSb3V0ZXJgIGluc3RhbmNlLCB0aGUgbW9kdWxlJ3MgYEluamVjdG9yYCxcbiAgICogYW5kIHRoZSBtb2R1bGUgb2JqZWN0LlxuICAgKlxuICAgKiAjIyMjIEV4YW1wbGU6XG4gICAqIGBgYGpzXG4gICAqIGltcG9ydCB7IEluamVjdG9yIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbiAgICogaW1wb3J0IHsgVUlSb3V0ZXIgfSBmcm9tIFwiQHVpcm91dGVyL2FuZ3VsYXJcIjtcbiAgICogaW1wb3J0IHsgcmVxdWlyZUF1dGhIb29rIH0gZnJvbSBcIi4vcmVxdWlyZUF1dGhIb29rXCI7XG4gICAqIGltcG9ydCB7IE15U2VydmljZSB9IGZyb20gXCIuL215U2VydmljZVwiO1xuICAgKlxuICAgKiBleHBvcnQgZnVuY3Rpb24gY29uZmlndXJlTXlNb2R1bGUodWlSb3V0ZXI6IFVJUm91dGVyLCBpbmplY3RvcjogSW5qZWN0b3IsIG1vZHVsZTogU3RhdGVzTW9kdWxlKSB7XG4gICAqICAgLy8gR2V0IFVJUm91dGVyIHNlcnZpY2VzIG9mZiB0aGUgVUlSb3V0ZXIgb2JqZWN0XG4gICAqICAgbGV0IHVybENvbmZpZyA9IHVpUm91dGVyLnVybFNlcnZpY2UuY29uZmlnO1xuICAgKiAgIGxldCB0cmFuc2l0aW9uU2VydmljZSA9IHVpUm91dGVyLnRyYW5zaXRpb25TZXJ2aWNlO1xuICAgKiAgIHVpUm91dGVyLnRyYWNlLmVuYWJsZShcIlRSQU5TSVRJT05cIik7XG4gICAqXG4gICAqICAgdHJhbnNpdGlvblNlcnZpY2Uub25CZWZvcmUoeyB0bzogKHN0YXRlKSA9PiBzdGF0ZS5yZXF1aXJlc0F1dGggfSwgcmVxdWlyZUF1dGhIb29rKTtcbiAgICpcbiAgICogICAvLyBDcmVhdGUgYSBzbHVnIHR5cGUgYmFzZWQgb24gdGhlIHN0cmluZyB0eXBlXG4gICAqICAgbGV0IGJ1aWx0SW5TdHJpbmdUeXBlID0gdXJsQ29uZmlnLnR5cGUoJ3N0cmluZycpO1xuICAgKiAgIGxldCBzbHVnVHlwZSA9IE9iamVjdC5hc3NpZ24oe30sIGJ1aWx0SW5TdHJpbmdUeXBlLCB7IGVuY29kZTogKHN0cikgPT4gc3RyLCBkZWNvZGU6IChzdHIpID0+IHN0ciB9KTtcbiAgICogICB1cmxDb25maWcudHlwZSgnc2x1ZycsIHNsdWdUeXBlKTtcbiAgICpcbiAgICogICAvLyBJbmplY3QgYXJiaXRyYXJ5IHNlcnZpY2VzIGZyb20gREkgdXNpbmcgdGhlIEluamVjdG9yIGFyZ3VtZW50XG4gICAqICAgbGV0IG15U2VydmljZTogTXlTZXJ2aWNlID0gaW5qZWN0b3IuZ2V0KE15U2VydmljZSlcbiAgICogICBteVNlcnZpY2UudXNlRmFzdE1vZGUoKTtcbiAgICogfVxuICAgKiBgYGBcbiAgICpcbiAgICogYGBganNcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBpbXBvcnRzOiBbXG4gICAqICAgICBVSVJvdXRlck1vZHVsZS5mb3JDaGlsZCh7IHN0YXRlczogU1RBVEVTLCBjb25maWc6IGNvbmZpZ3VyZU15TW9kdWxlIH0pO1xuICAgKiAgIF1cbiAgICogfSlcbiAgICogY2xhc3MgTXlNb2R1bGUge31cbiAgICogYGBgXG4gICAqL1xuICBjb25maWc/OiAodWlSb3V0ZXJJbnN0YW5jZTogVUlSb3V0ZXIsIGluamVjdG9yOiBJbmplY3RvciwgbW9kdWxlOiBTdGF0ZXNNb2R1bGUpID0+IGFueTtcbn1cbiJdfQ==