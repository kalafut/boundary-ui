import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetHostsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Loads all hosts under the current host catalog.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
    const hostSet = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog.host-sets.host-set');
    this.store.unloadAll('host');
    return hash({
      hostSet,
      hosts: this.store.findAll('host', { adapterOptions: { scopeID, hostCatalogID } })
    });
  }

  // =actions

  /**
   * Toggles the presence of the passed host ID in the passed host set's
   * `host_ids` field.
   * @param {HostSetModel} hostSet
   * @param {HostModel} host
   */
  @action
  toggleHost(hostSet, host) {
    const isHostSelected = Boolean(hostSet.host_ids.findBy('value', host.id));
    const fragment = hostSet.host_ids.findBy('value', host.id);
    if (isHostSelected) {
      // if host is already selected, filter it out
      hostSet.host_ids.removeObject(fragment);
    } else {
      // if host is not selected, add it
      hostSet.host_ids.addObject({ value: host.id });
    }
  }

  /**
   * Saves host IDs on the host set.
   * @param {HostSetModel} hostSet
   */
  @action
  async save(hostSet) {
    try {
      const hostCatalogID = this.modelFor('scopes.scope.projects.project.host-catalogs.host-catalog').id;
      const options = { adapterOptions : { hostCatalogID } };
      await hostSet.saveHostIDs(options);
      this.notify.success(
        this.intl.t('notify.save-success')
      );
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}