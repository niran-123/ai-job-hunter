export class BaseSourceAdapter {
  constructor(sourceConfig) {
    this.sourceConfig = sourceConfig;
    this.name = sourceConfig.name;
    this.type = sourceConfig.type;
    this.baseUrl = sourceConfig.baseUrl;
  }

  /**
   * Fetch raw jobs from source
   * @param {Object} options
   * @returns {Promise<Array<Object>>}
   */
  async fetchJobs(options = {}) {
    throw new Error('fetchJobs() must be implemented by adapter subclass');
  }

  /**
   * Parse a raw source job into a preliminary normalized candidate
   * @param {Object} rawJob
   * @returns {Object}
   */
  parseRawJob(rawJob) {
    throw new Error('parseRawJob() must be implemented by adapter subclass');
  }
}

