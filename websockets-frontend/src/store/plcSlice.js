import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  connection: {
    status: "disconnected",
    host: "",
    slot: 0,
    pollRateMs: 1000,
    connectedAt: null,
    error: null,
    properties: null,
    watchedTagCount: 0,
  },
  browser: {
    status: "idle",
    tags: [],
    programs: [],
    templates: [],
    lastBrowsedAt: null,
    error: null,
    search: "",
    selectedScope: "all",
  },
  watchedTags: [],
  valuesById: {},
  selectedTagId: null,
  errors: [],
};

const plcSlice = createSlice({
  name: "plc",
  initialState,
  reducers: {
    setPlcConnectionState(state, action) {
      state.connection = {
        ...state.connection,
        ...action.payload,
        error: action.payload.error || null,
      };

      if (action.payload.status === "disconnected") {
        state.browser.status = "idle";
        state.browser.tags = [];
        state.browser.programs = [];
        state.browser.templates = [];
        state.browser.lastBrowsedAt = null;
        state.browser.error = null;
        state.watchedTags = [];
        state.valuesById = {};
        state.selectedTagId = null;
      }
    },
    browseStarted(state) {
      state.browser.status = "loading";
      state.browser.error = null;
    },
    setBrowseResult(state, action) {
      state.browser.status = "ready";
      state.browser.tags = action.payload.tags || [];
      state.browser.programs = action.payload.programs || [];
      state.browser.templates = action.payload.templates || [];
      state.browser.lastBrowsedAt = action.payload.timestamp;
      state.browser.error = null;
    },
    browseFailed(state, action) {
      state.browser.status = "error";
      state.browser.error = action.payload.message;
    },
    setTagSearch(state, action) {
      state.browser.search = action.payload.search;
    },
    setSelectedScope(state, action) {
      state.browser.selectedScope = action.payload.scope;
    },
    setSelectedTag(state, action) {
      state.selectedTagId = action.payload.tagId;
    },
    setWatchedTags(state, action) {
      state.watchedTags = action.payload.watchedTags || [];
      state.connection.watchedTagCount = state.watchedTags.length;

      if (!state.selectedTagId && state.watchedTags.length > 0) {
        state.selectedTagId = state.watchedTags[0].id;
      }
    },
    setTagValue(state, action) {
      state.valuesById[action.payload.id] = action.payload;
      state.selectedTagId = state.selectedTagId || action.payload.id;
    },
    addPlcError(state, action) {
      state.errors.unshift(action.payload);
      state.errors = state.errors.slice(0, 10);
    },
    clearPlcErrors(state) {
      state.errors = [];
    },
  },
});

export const {
  addPlcError,
  browseFailed,
  browseStarted,
  clearPlcErrors,
  setBrowseResult,
  setPlcConnectionState,
  setSelectedScope,
  setSelectedTag,
  setTagSearch,
  setTagValue,
  setWatchedTags,
} = plcSlice.actions;

export default plcSlice.reducer;
