import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';

/**
 * Overrides URL-building methods in an adpater for greater flexibility.
 * Specifically enhances calls to `urlPrefix` with `modelName`, `id`, and
 * `snapshot`, which aren't normally passed.  And adds support for a
 * `urlSuffix` method, the return value of which is appended to the end of
 * a generated URL.
 *
 * While this mixin provides an enhanced API, it doesn't actually change the
 * way URLs are generated by default.  Override methods in the adapter that
 * uses this mixin to alter generated URLs.
 */
export default Mixin.create({

  // =methods

  /**
   * This override behaves identically to the default method by default.
   * It exists only to document the additional paramters to the method.
   * @override
   * @param {string} path
   * @param {string} parentURL
   * @param {string} modelName
   * @param {string} id
   * @param {object} snapshot
   * @return {string} urlPrefix
   */
  urlPrefix(/* path, parentURL, modelName, id, snapshot */) {
    // What's this super syntax?
    // Ember mixins are still based on the older Ember Object, rather than
    // native ES classes.  Thus we have to call super in this strange way.
    // https://blog.emberjs.com/2019/01/26/emberjs-native-class-update-2019-edition.html
    return this._super(...arguments);
  },

  /**
   * Generates a string to be appended to a URL.  Empty string by default.
   * @param {string} modelName
   * @param {string} id
   * @param {?object} snapshot
   * @return {string}
   */
  urlSuffix(/* modelName, id, snapshot */) {
    return '';
  },

  /**
   * Overrides the default `_buildURL` with a nearly identical version.
   * This method simply passes arguments into the `urlPrefix` method for
   * convenience, where by default it receives no arguments.
   *
   * Adds a suffix, generated by the `urlSuffix` method, to the URL.
   * @override
   * @param {String} modelName
   * @param {String} id
   * @return {String} url
   */
  _buildURL(modelName, id, snapshot) {
    let path;
    let url = [];
    const host = get(this, 'host');
    const prefix = this.urlPrefix(null, null, modelName, id, snapshot);
    const suffix = this.urlSuffix(modelName, id, snapshot);
    if (modelName) {
      path = this.pathForType(modelName);
      if (path) url.push(path);
    }
    if (id) url.push(encodeURIComponent(id));
    if (prefix) url.unshift(prefix);
    url = url.join('/');
    if (!host && url && url.charAt(0) !== '/') url = '/' + url;
    return `${url}${suffix}`;
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} id
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForFindRecord(id, modelName, snapshot) {
    return this._buildURL(modelName, id, snapshot);
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForFindAll(modelName, snapshot) {
    return this._buildURL(modelName, null, snapshot);
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} id
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForFindBelongsTo(id, modelName, snapshot) {
    return this._buildURL(modelName, id, snapshot);
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForCreateRecord(modelName, snapshot) {
    return this._buildURL(modelName, null, snapshot);
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} id
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForUpdateRecord(id, modelName, snapshot) {
    return this._buildURL(modelName, id, snapshot);
  },

  /**
   * Overrides the default method simply to pass an additional argument
   * `snapshot` to the `_buildURL` method.
   * @override
   * @param {string} id
   * @param {string} modelName
   * @param {object} snapshot
   * @return {string}
   */
  urlForDeleteRecord(id, modelName, snapshot) {
    return this._buildURL(modelName, id, snapshot);
  }

});