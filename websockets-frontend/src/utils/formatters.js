export function formatTelemetryValue(tag) {
  if (!tag) {
    return "--";
  }

  if (tag.dataType === "boolean") {
    return tag.value ? "On" : "Off";
  }

  if (tag.dataType === "number") {
    return typeof tag.value === "number" ? tag.value.toLocaleString() : tag.value;
  }

  return String(tag.value);
}

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "--";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

export function getStatusClass(status) {
  const classes = {
    connected: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    connecting: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    reconnecting: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    disconnected: "border-rose-400/40 bg-rose-400/10 text-rose-100",
    error: "border-rose-400/40 bg-rose-400/10 text-rose-100",
    online: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    idle: "border-sky-300/40 bg-sky-300/10 text-sky-100",
    faulted: "border-rose-400/40 bg-rose-400/10 text-rose-100",
    unknown: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  };

  return classes[status] || classes.unknown;
}

export function getSourceLabel(sourceType) {
  const labels = {
    "rockwell-plc": "Rockwell PLC",
    "fanuc-robot": "Fanuc Robot",
  };

  return labels[sourceType] || sourceType || "Unknown";
}
