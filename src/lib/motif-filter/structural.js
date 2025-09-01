export function filterOverlappingSpeech(datasets) {
  const messages = datasets.transcript;
  const overlappingMessageIds = new Set();
  const timeBuffer = 0; // Times within ... seconds of each other are considered overlapping

  for (let i = 0; i < messages.length; i++) {
    const messageA = messages[i];
    for (let j = 0; j < messages.length; j++) {
      if (i === j) continue; // Skip comparing the message to itself

      const messageB = messages[j];
      if (
        (messageA.start <= messageB.end && messageA.end >= messageB.start) || // Overlapping timeframe
        Math.abs(messageA.start - messageB.start) <= timeBuffer || // Start times within timeBuffer
        Math.abs(messageA.end - messageB.end) <= timeBuffer // End times within timeBuffer
      ) {
        overlappingMessageIds.add(messageA.id);
        overlappingMessageIds.add(messageB.id);
      }
    }
  }

  return Array.from(overlappingMessageIds);
}

export function filterRapidTurnTaking(datasets) {
  //   const messages = this.datasets.rapidTurnTaking;
  //   return messages.filter(message => {
  //     // Implement the logic to identify rapid turn-taking
  //   }).map(message => message.id);
  // }
}