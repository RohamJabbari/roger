export function filterDuringEvents(datasets) {
  const messages = datasets.transcript;
  const events = datasets.events;
  const timeWindow = 5; // seconds
  const eventMessageIds = new Set();

  messages.forEach(message => {
    events.forEach(event => {
      if (
        (message.start <= event.time + timeWindow && message.start >= event.time - timeWindow) ||
        (message.end <= event.time + timeWindow && message.end >= event.time - timeWindow)
      ) {
        eventMessageIds.add(message.id);
      }
    });
  });

  return Array.from(eventMessageIds);
}