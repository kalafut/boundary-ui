import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import loading from 'ember-loading/decorator';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoleAddPrincipalsRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Returns the current role, all users, and all groups
   * @return {{role: RoleModel, users: [UserModel], groups: [GroupModel]}}
   */
  model() {
    const role = this.modelFor('scopes.scope.roles.role');
    const { scopeID: scope_id } = role;
    return hash({
      role,
      users: this.store.query('user', { scope_id }),
      groups: this.store.query('group', { scope_id }),
    });
  }

  /**
   * Renders the add-principals-specific header template.
   * Empties the actions and navigation outlets and renders a custom empty header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/roles/role/add-principals/-header', {
      into: 'scopes/scope/roles/role',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'navigation',
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'actions',
    });
  }

  // =actions

  /**
   * Save principal IDs to current role via the API.
   * @param {RoleModel} role
   * @param {[string]} principalIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addPrincipals(role, principalIDs) {
    await role.addPrincipals(principalIDs);
    this.replaceWith('scopes.scope.roles.role.principals');
  }

  /**
   * Redirect to role principals as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.roles.role.principals');
  }
}
