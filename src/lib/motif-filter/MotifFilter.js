import { filterOverlappingSpeech, filterRapidTurnTaking } from './structural.js';
import { filterHighStressMessages, filterLeadingToHighStress } from './emotionalStress.js';
import { filterDuringEvents } from './contextual.js';

export class MotifFilter {
  constructor(datasets) {
    this.datasets = datasets;
  }

  // filterDuringHighStress() {
  //   const messages = this.datasets.duringHighStress;
  //   return messages.filter(message => {
  //     // Implement the logic to identify high-stress messages
  //   }).map(message => message.id);
  // }

  getMessagesForMotif(motifId) {
    switch (motifId) {
      case 'overlapping_speech':
        return filterOverlappingSpeech(this.datasets);
      case 'rapid_turn_taking':
        return filterRapidTurnTaking(this.datasets);
      case 'during_events':
        return filterDuringEvents(this.datasets);
      case 'high_stress_messages':
        return filterHighStressMessages(this.datasets);
      case 'leading_to_high_stress':
        return filterLeadingToHighStress(this.datasets);
      default:
        throw new Error(`Unknown motif ID: ${motifId}`);
    }
  }
}