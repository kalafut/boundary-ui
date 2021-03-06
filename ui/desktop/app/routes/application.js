import Route from '@ember/routing/route';
import Ember from 'ember';
/* eslint-disable-next-line ember/no-mixins */
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { later } from '@ember/runloop';
import loading from 'ember-loading/decorator';

export default class ApplicationRoute extends Route.extend(
  ApplicationRouteMixin
) {
  // =services

  @service session;
  @service origin;

  // =attributes

  /**
   * @type {string}
   */
  routeIfUnauthenticated = 'index';

  /**
   * Check that the origin specified in the renderer matches the origin
   * reported by the main process.  If they differ, update the main process
   * origin so that the renderer's CSP can be rewritten to allow requests.
   */
  beforeModel() {
    return this.origin.updateOrigin();
  }

  /**
   * After becoming authenticated, does nothing.  This overrides the default
   * behavior of the ApplicationRouteMixin, which is to redirect after auth.
   * We'll handle this redirect manually in sub routes.
   * @override
   */
  sessionAuthenticated() {
    // no op
  }

  /**
   * When the session ends, redirect to authenticate and reload the page to
   * purge any in-memory state.
   */
  async sessionInvalidated() {
    // Catch error in this transition, since it will be aborted by the
    // scope auth route when it redirects to the first auth method.
    await this.transitionTo(this.routeIfUnauthenticated).catch(() => {});
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    const { location } = document.parentNode.defaultView;
    // Wait a beat, then reload the page...
    // This is mostly to give the deauth request a chance to fire.
    /* istanbul ignore if */
    if (!Ember.testing) later(location, location.reload, 150);
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }

  /**
   * Hooks into ember-loading to kick off loading indicator in the
   * application template.
   * @return {boolean} always returns true
   */
  @action
  @loading
  loading() {
    return true;
  }

  /**
   * Invalidates the session if a 401 error occurs and returns false to
   * prevent further error handling.
   * Returns true in all other cases, allowing error handling to occur (such
   * as displaying the `error.hbs` template, if one exists).
   * @param {Error} e
   */
  @action
  error(e) {
    const isUnauthenticated = A(e?.errors)?.firstObject?.isUnauthenticated;
    if (isUnauthenticated) {
      this.session.invalidate();
      return false;
    }
    return true;
  }
}
