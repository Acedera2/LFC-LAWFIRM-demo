const CHANNEL_NAME = "lfc-refresh-bus";
const STORAGE_PREFIX = "lfc:refresh:";

let broadcastChannel;

function getBroadcastChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }

  return broadcastChannel;
}

export function publishRefresh(topic) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = `${Date.now()}`;
  window.dispatchEvent(new Event(topic));

  try {
    getBroadcastChannel()?.postMessage({ topic, payload });
  } catch {
    // ignore unsupported broadcast scenarios
  }

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${topic}`, payload);
  } catch {
    // ignore storage failures in constrained environments
  }
}

export function subscribeRefresh(topic, handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onLocalEvent = () => handler();
  const onStorageEvent = (event) => {
    if (event.key === `${STORAGE_PREFIX}${topic}`) {
      handler();
    }
  };
  const channel = getBroadcastChannel();
  const onBroadcastMessage = (event) => {
    if (event.data?.topic === topic) {
      handler();
    }
  };

  window.addEventListener(topic, onLocalEvent);
  window.addEventListener("storage", onStorageEvent);
  channel?.addEventListener("message", onBroadcastMessage);

  return () => {
    window.removeEventListener(topic, onLocalEvent);
    window.removeEventListener("storage", onStorageEvent);
    channel?.removeEventListener("message", onBroadcastMessage);
  };
}