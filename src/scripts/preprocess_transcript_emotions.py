import pandas as pd
import numpy as np

voice_metrics_data = pd.read_csv('voice_metrics.csv', delimiter=';')
transcript_data = pd.read_csv('transcript.csv', delimiter=';')

# Initialize a new column for stress level in transcript_data
transcript_data['stress'] = 0.0

# Iterate through each row in transcript_data to calculate the maximum stress level
for index, row in transcript_data.iterrows():
    speaker = row['speaker']
    start_sec = row['start_sec']
    end_sec = row['end_sec']

    midpoint = (start_sec + end_sec) / 2
    
    # Filter stress_data for the given speaker and time range
    filtered_voice_metrics = voice_metrics_data[(voice_metrics_data['speaker'] == speaker) &
                                  (voice_metrics_data['timestamp']/1000 >= start_sec) &
                                  (voice_metrics_data['timestamp']/1000 <= end_sec)]
    
    # If there is data in the filtered range, get the maximum values
    if not filtered_voice_metrics.empty:
        print(filtered_voice_metrics)
        max_valence = filtered_voice_metrics['voice_valence'].max()
        max_arousal = filtered_voice_metrics['voice_activation'].max()
        max_dominance = filtered_voice_metrics['voice_dominance'].max()
    else:
        speaker_data = voice_metrics_data[voice_metrics_data['speaker'] == speaker]
        
        if speaker_data.empty:
            print(f"No voice metrics data found for speaker: {speaker}")
            continue
        
        closest_index = (np.abs(speaker_data['timestamp']/1000 - midpoint)).argmin()
        closest_row = speaker_data.iloc[closest_index]
        
        # Get the values from the closest row
        max_valence = closest_row['voice_valence']
        max_arousal = closest_row['voice_activation']
        max_dominance = closest_row['voice_dominance']
    
    transcript_data.at[index, 'valence'] = round(max_valence, 5)
    transcript_data.at[index, 'arousal'] = round(max_arousal, 5)
    transcript_data.at[index, 'dominance'] = round(max_dominance, 5)

# Save the updated transcript_data back to a CSV file
transcript_data.to_csv('updated_transcript.csv', sep=';', index=False)