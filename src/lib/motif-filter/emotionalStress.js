export function filterHighStressMessages(datasets) {
  const messages = datasets.transcript;
  const highStressMessageIds = new Set();
  messages.forEach(message => {
    if (message.stress_level >= 2) {
      highStressMessageIds.add(message.id);
    }
  });

  return Array.from(highStressMessageIds);
}

export function filterLeadingToHighStress(datasets) {
  const messages = datasets.transcript;
  const ecgData = datasets.ecg;
  const highStressMessageIds = new Set();
  const highStressTimes = ecgData.filter(ecg => ecg.stress_level >= 2).map(ecg => ecg.time);

  const startTimeWindow = 30; // 30 seconds before the stress time
  const endTimeWindow = 20; // 20 seconds after the stress time

  highStressTimes.forEach(stressTime => {
    const startTime = stressTime - startTimeWindow;
    const endTime = stressTime + endTimeWindow;

    messages.forEach(message => {
      if (
        (message.start >= startTimeWindow && message.start <= endTimeWindow) ||
        (message.end >= startTimeWindow && message.end <= endTimeWindow) ||
        (message.start <= startTimeWindow && message.end >= endTimeWindow)
      ) {
        highStressMessageIds.add(message.id);
      }
    });
  });

  return Array.from(highStressMessageIds);
}