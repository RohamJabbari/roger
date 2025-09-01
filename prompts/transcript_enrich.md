Attached is a transcript of a communication between different speakers. The column names are in the first row and are: id;start;end;speaker;text;start_sec;end_sec
you can ignore everything (i.e. the timings) except the columns id, speaker, text

I want you to return a new csv with all the content plus 2 additional columns (keywords, question). Make sure you to only return the csv and say nothing else.

keywords: I want you to analyze the text column of each message and extract a comma separated list of max. 4 keywords.  Consider the context, relevance, and frequency of the keywords when determining their significance.  Ensure that your keyword extraction results are relevant, concise, and capture the essential topics within the text. Ensure that the extracted keywords accurately represent the content's context and exist in the original text.

question: 1 if the text is a question, 0 if the text is not a question