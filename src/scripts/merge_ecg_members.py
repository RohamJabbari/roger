import pandas as pd

# File names
files = ['stress_1.csv', 'stress_2.csv', 'stress_3.csv']
speakers = ['1', '2', '3']

# List to hold dataframes
dataframes = []

# Loop through each file and read into a dataframe
for file, speaker in zip(files, speakers):
    df = pd.read_csv(file)
    df = df.iloc[:, 1:]  # Drop the first column
    df['speaker'] = speaker  # Add the speaker column
    dataframes.append(df)

# Concatenate all dataframes
merged_df = pd.concat(dataframes, ignore_index=True)

# Save the result to a new CSV file
merged_df.to_csv('stress.csv', index=False)