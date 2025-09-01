import pandas as pd
import re

transcript_data = pd.read_csv('transcript.csv', delimiter=';')

def clean_text(text):
    # Remove everything in parentheses including the parentheses
    text = re.sub(r'\([^)]*\)', '', text)
    # Remove double slashes
    text = text.replace('//', '')
    return text.strip()

transcript_data = pd.read_csv('transcript.csv', delimiter=';')
transcript_data['text_llm'] = ''

for index, row in transcript_data.iterrows():
    cleaned_text = clean_text(row['text'])
    transcript_data.at[index, 'text_llm'] = cleaned_text

transcript_data.to_csv('updated_transcript.csv', sep=';', index=False)