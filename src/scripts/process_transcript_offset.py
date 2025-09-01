import pandas as pd

offset_time = 39

def time_to_seconds(time_str):
    """Convert time in HH:MM:SS:FF format to total seconds."""
    hh, mm, ss, ff = map(int, time_str.split(':'))
    return hh * 3600 + mm * 60 + ss + ff / 100.0

def adjust_time(time_str, offset):
    """Adjust time by subtracting the offset and convert back to HH:MM:SS:FF format."""
    total_seconds = time_to_seconds(time_str) - offset
    hh = int(total_seconds // 3600)
    mm = int((total_seconds % 3600) // 60)
    ss = int(total_seconds % 60)
    ff = int((total_seconds - int(total_seconds)) * 100)
    return f'{hh:02}:{mm:02}:{ss:02}:{ff:02}'

df = pd.read_csv('transcript_raw.csv', delimiter=';', skiprows=1, names=['start', 'end', 'speaker', 'text'])

# Convert start and end times to seconds and add as new columns
df['start_sec'] = df['start'].apply(lambda x: round(time_to_seconds(x)))
df['end_sec'] = df['end'].apply(lambda x: round(time_to_seconds(x)))

# Filter rows where start_sec is greater than or equal to offset_time
df = df[df['start_sec'] >= offset_time]

# Adjust times by subtracting the offset_time
df['start_sec'] = df['start_sec'] - offset_time
df['end_sec'] = df['end_sec'] - offset_time
df['start'] = df['start'].apply(lambda x: adjust_time(x, offset_time))
df['end'] = df['end'].apply(lambda x: adjust_time(x, offset_time))

df.to_csv('transcript.csv', sep=';', index=False)