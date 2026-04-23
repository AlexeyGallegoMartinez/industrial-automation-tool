function normalizeTagDefinition(tag) {
  return {
    id: buildTagId(tag),
    name: tag.name,
    program: tag.program || null,
    scope: tag.program ? "program" : "controller",
    dataType: tag.type?.typeName || "unknown",
    typeCode: tag.type?.code ?? tag.type?.typeCode ?? null,
    arrayDims: tag.type?.arrayDims || 0,
    isStructure: Boolean(tag.type?.structure),
    reserved: Boolean(tag.type?.reserved),
    readable: !tag.type?.reserved,
  };
}

function buildTagId(tag) {
  const program = tag.program || "controller";
  return `${program}:${tag.name}`;
}

function normalizeTagValue({ tag, value, quality = "good", message = null }) {
  return {
    id: buildTagId(tag),
    name: tag.name,
    program: tag.program || null,
    scope: tag.program ? "program" : "controller",
    dataType: tag.type?.typeName || "unknown",
    value,
    quality,
    message,
    bits: getBits(value),
    timestamp: new Date().toISOString(),
  };
}

function getBits(value) {
  if (!Number.isInteger(value)) {
    return [];
  }

  const unsignedValue = value >>> 0;

  return Array.from({ length: 32 }, (_, index) => ({
    bit: index,
    value: Math.floor(unsignedValue / 2 ** index) % 2 === 1,
  }));
}

module.exports = {
  buildTagId,
  normalizeTagDefinition,
  normalizeTagValue,
};
