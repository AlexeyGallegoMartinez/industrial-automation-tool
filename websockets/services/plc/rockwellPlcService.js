const { Controller, Tag, TagList } = require("st-ethernet-ip");
const {
  buildTagId,
  normalizeTagDefinition,
  normalizeTagValue,
} = require("./tagNormalizer");

const DEFAULT_POLL_RATE_MS = 1000;
const MIN_POLL_RATE_MS = 250;
const MAX_POLL_RATE_MS = 10000;

class RockwellPlcService {
  constructor() {
    this.controller = null;
    this.tagList = null;
    this.connection = {
      status: "disconnected",
      host: "",
      slot: 0,
      connectedAt: null,
      error: null,
      properties: null,
    };
    this.watchedTags = new Map();
    this.pollTimer = null;
    this.isPolling = false;
    this.pollRateMs = DEFAULT_POLL_RATE_MS;
  }

  getConnectionState() {
    return {
      ...this.connection,
      pollRateMs: this.pollRateMs,
      watchedTagCount: this.watchedTags.size,
    };
  }

  async connect({ host, slot = 0, pollRateMs = DEFAULT_POLL_RATE_MS }) {
    const normalizedHost = String(host || "").trim();
    const normalizedSlot = Number.isFinite(Number(slot)) ? Number(slot) : 0;

    if (!normalizedHost) {
      throw new Error("PLC host is required.");
    }

    await this.disconnect();

    this.connection = {
      status: "connecting",
      host: normalizedHost,
      slot: normalizedSlot,
      connectedAt: null,
      error: null,
      properties: null,
    };
    this.pollRateMs = clampPollRate(pollRateMs);

    const controller = new Controller();
    controller.timeout_sp = 5000;
    controller.scan_rate = this.pollRateMs;

    try {
      await controller.connect(normalizedHost, normalizedSlot);

      this.controller = controller;
      this.connection = {
        status: "connected",
        host: normalizedHost,
        slot: normalizedSlot,
        connectedAt: new Date().toISOString(),
        error: null,
        properties: sanitizeControllerProperties(controller.properties),
      };
    } catch (error) {
      this.connection = {
        status: "error",
        host: normalizedHost,
        slot: normalizedSlot,
        connectedAt: null,
        error: error.message,
        properties: null,
      };
      throw error;
    }

    return this.getConnectionState();
  }

  async disconnect() {
    this.stopPolling();
    this.watchedTags.clear();
    this.tagList = null;

    if (this.controller) {
      const controller = this.controller;
      this.controller = null;

      try {
        await controller.disconnect();
      } catch {
        // The physical socket may already be closed; still reset local state.
      }
    }

    this.connection = {
      status: "disconnected",
      host: "",
      slot: 0,
      connectedAt: null,
      error: null,
      properties: null,
    };

    return this.getConnectionState();
  }

  async browseTags() {
    this.assertConnected();

    const tagList = new TagList();
    await this.controller.getControllerTagList(tagList);
    this.tagList = tagList;
    this.controller.state.tagList = tagList;

    const tags = tagList.tags.map(normalizeTagDefinition);

    return {
      tags,
      programs: tagList.programs,
      templates: Object.keys(tagList.templates || {}),
      timestamp: new Date().toISOString(),
    };
  }

  subscribeTags(tagRequests) {
    this.assertConnected();

    if (!Array.isArray(tagRequests)) {
      throw new Error("Tag subscription payload must be an array.");
    }

    tagRequests.forEach((request) => {
      const tag = this.resolveTagRequest(request);
      this.watchedTags.set(buildTagId(tag), tag);
    });

    return this.getWatchedTags();
  }

  unsubscribeTags(tagRequests) {
    if (!Array.isArray(tagRequests)) {
      return this.getWatchedTags();
    }

    tagRequests.forEach((request) => {
      const id =
        request.id ||
        buildTagId({ name: request.name, program: request.program || null });
      this.watchedTags.delete(id);
    });

    return this.getWatchedTags();
  }

  getWatchedTags() {
    return Array.from(this.watchedTags.values()).map(normalizeTagDefinition);
  }

  startPolling(onTagUpdate, onError) {
    this.stopPolling();

    const poll = async () => {
      if (!this.controller || this.connection.status !== "connected") {
        return;
      }

      if (this.isPolling) {
        return;
      }

      try {
        this.isPolling = true;

        for (const tag of this.watchedTags.values()) {
          try {
            onTagUpdate(await this.readTagValue(tag));
          } catch (error) {
            onTagUpdate(
              normalizeTagValue({
                tag,
                value: null,
                quality: "bad",
                message: error.message,
              }),
            );
            onError(error, tag);
          }
        }
      } finally {
        this.isPolling = false;
      }
    };

    poll();
    this.pollTimer = setInterval(poll, this.pollRateMs);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.isPolling = false;
  }

  async readTagValue(tag) {
    this.assertConnected();

    const plcTag = this.createReadableTag(tag);
    await this.controller.readTag(plcTag);

    return normalizeTagValue({
      tag,
      value: sanitizeTagValue(plcTag.value),
    });
  }

  assertConnected() {
    if (!this.controller || this.connection.status !== "connected") {
      throw new Error("PLC is not connected.");
    }
  }

  resolveTagRequest(request) {
    if (!request || !request.name) {
      throw new Error("Tag name is required.");
    }

    const program = request.program || null;
    const fallbackTag = {
      name: request.name,
      program,
      type: {
        typeName: request.dataType || "unknown",
        structure: false,
        arrayDims: 0,
        reserved: false,
      },
    };

    if (!this.tagList) {
      return fallbackTag;
    }

    const tagDefinition = this.tagList.getTag(request.name, program);

    if (!tagDefinition) {
      return fallbackTag;
    }

    if (tagDefinition.type?.reserved) {
      throw new Error(`Tag ${request.name} is reserved and cannot be read.`);
    }

    return tagDefinition;
  }

  createReadableTag(tag) {
    const program = tag.program || null;
    const arrayDims = tag.type?.arrayDims || 0;

    if (typeof this.controller.newTag === "function") {
      return this.controller.newTag(tag.name, program, false, arrayDims);
    }

    return new Tag(tag.name, program);
  }
}

function clampPollRate(value) {
  const rate = Number(value);

  if (!Number.isFinite(rate)) {
    return DEFAULT_POLL_RATE_MS;
  }

  return Math.min(MAX_POLL_RATE_MS, Math.max(MIN_POLL_RATE_MS, rate));
}

function sanitizeControllerProperties(properties = {}) {
  return {
    name: properties.name || "",
    serialNumber: properties.serial_number || null,
    version: properties.version || "",
    run: Boolean(properties.run),
    program: Boolean(properties.program),
    faulted: Boolean(properties.faulted),
    minorRecoverableFault: Boolean(properties.minorRecoverableFault),
    minorUnrecoverableFault: Boolean(properties.minorUnrecoverableFault),
    majorRecoverableFault: Boolean(properties.majorRecoverableFault),
    majorUnrecoverableFault: Boolean(properties.majorUnrecoverableFault),
    ioFaulted: Boolean(properties.io_faulted),
  };
}

function sanitizeTagValue(value) {
  if (Buffer.isBuffer(value)) {
    return value.toString("hex");
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeTagValue);
  }

  if (value && typeof value === "object") {
    return JSON.parse(JSON.stringify(value));
  }

  return value;
}

module.exports = {
  RockwellPlcService,
};
