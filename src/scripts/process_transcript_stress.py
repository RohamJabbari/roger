import pandas as pd

stress_data = pd.read_csv('stress.csv')
transcript_data = pd.read_csv('transcript_en.csv', delimiter=',')

# Initialize a new column for stress level in transcript_data
transcript_data['stress'] = 0.0

# Iterate through each row in transcript_data to calculate the maximum stress level
for index, row in transcript_data.iterrows():
    speaker = row['speaker']
    start_sec = row['start_sec']
    end_sec = row['end_sec']
    
    # Filter stress_data for the given speaker and time range
    filtered_stress = stress_data[(stress_data['speaker'] == speaker) &
                                  (stress_data['time'] >= start_sec) &
                                  (stress_data['time'] <= end_sec)]
    
    # If there is data in the filtered range, get the maximum stress level
    if not filtered_stress.empty:
        max_stress = filtered_stress['stress'].max()
        transcript_data.at[index, 'stress'] = round(max_stress, 2)

# Save the updated transcript_data back to a CSV file
transcript_data.to_csv('updated_transcript.csv', sep=',', index=False)