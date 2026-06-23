## Question 1: The Vector Conflict

In my results, Sentence 1 and Sentence 2 still showed some similarity because both sentences contain the word "light". CountVectorizer only counts words and does not understand their meaning. Even though the word "light" is used in different contexts, the model treats it as the same word. This can lead to incorrect similarity scores.

## Question 2: The Context Blindspot

The bag-of-words approach does not understand the context of a sentence. It only looks at how many times words appear. Because of this, it cannot understand the real meaning behind the text. This becomes a problem for applications like chatbots and search engines that need to understand language properly.

## Question 3: The GenAI Architectural Fix

Modern AI models like GPT and LLaMA are much smarter because they understand context. They use techniques like self-attention to look at surrounding words before deciding the meaning of a word. Because of this, the word "light" can have different meanings in different sentences. This helps the model understand language more accurately.