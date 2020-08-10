import Route from '@ember/routing/route';

export default class ScopesScopeUsersUserRoute extends Route {
  // =methods

  /**
   * Load a user in current scope.
   * @param {object} params
   * @param {string} params.user_id
   * @return {UserModel}
   */
  async model({ user_id }) {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.findRecord('user', user_id, {
      adapterOptions: { scopeID },
    });
  }
}