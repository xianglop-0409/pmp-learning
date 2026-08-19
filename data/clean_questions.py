"""Clean PMP question bank: remove English, answer leaks, junk prefixes"""
import json, re

with open('all-bank.json', 'r', encoding='utf-8') as f:
    bank = json.load(f)

print(f'Total before: {len(bank)}')

cleaned = 0
removed = 0

def is_garbled(text):
    """Detect heavily garbled text (>50% unreadable chars)"""
    if not text: return False
    garbled = len(re.findall(r'[\x00-\x08\x0b\x0c\x0e-\x1f�]', text))
    return garbled > len(text) * 0.3

def clean_text(text):
    """Remove English fragments mixed in Chinese text, junk prefixes, answer leaks"""
    if not text: return text
    # Remove prefixes like [单选题]分值:1分
    text = re.sub(r'\[[^\]]*单选题[^\]]*\]', '', text)
    text = re.sub(r'\[[^\]]*多选题[^\]]*\]', '', text)
    text = re.sub(r'分值[：:]\s*\d+\s*分', '', text)
    # Remove answer indicators
    text = re.sub(r'[（(]?\s*答案[：:]\s*[A-Da-d]\s*[）)]?', '', text)
    text = re.sub(r'正确选项[：:]\s*[A-Da-d]', '', text)
    text = re.sub(r'参考解析[：:].*$', '', text, flags=re.MULTILINE)
    # Remove <p> tags
    text = re.sub(r'</?p[^>]*>', '', text)
    # Remove English sentences (long English fragments between Chinese text)
    text = re.sub(r'[A-Za-z][A-Za-z\s,;:?!.\'\"()-]{30,}[A-Za-z]', ' ', text)
    # Remove leading/trailing whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove empty brackets
    text = re.sub(r'[（(]\s*[）)]', '', text)
    return text

def has_too_much_english(text, threshold=0.3):
    """Check if text has too much English"""
    if not text: return False
    ascii_chars = len([c for c in text if c.isascii() and c.isalpha()])
    return ascii_chars > len(text.replace(' ', '')) * threshold

def extract_answer_from_text(text):
    """Check if answer is leaked in question/scenario text"""
    patterns = [
        r'正确答案[是为：:]\s*([A-Da-d])',
        r'答案[是为：:]\s*([A-Da-d])',
        r'应选[择]?\s*([A-Da-d])',
        r'故选[择]?\s*([A-Da-d])',
    ]
    for p in patterns:
        m = re.search(p, text)
        if m: return m.group(1).upper()
    return None

for q in bank:
    # Clean question text
    q_text = q.get('question', {})
    if isinstance(q_text, dict):
        raw = q_text.get('zh', '')
        cleaned_text = clean_text(raw)
        q['question']['zh'] = cleaned_text
    elif isinstance(q_text, str):
        q['question'] = {'zh': clean_text(q_text)}

    # Clean scenario text
    s_text = q.get('scenario', {})
    if isinstance(s_text, dict):
        raw = s_text.get('zh', '')
        cleaned_text = clean_text(raw)
        q['scenario']['zh'] = cleaned_text
    elif isinstance(s_text, str):
        if s_text.strip():
            q['scenario'] = {'zh': clean_text(s_text)}

    # Clean explanation
    expl = q.get('explanation', {})
    if isinstance(expl, dict):
        raw = expl.get('zh', '')
        cleaned_text = clean_text(raw)
        q['explanation']['zh'] = cleaned_text
    elif isinstance(expl, str):
        if expl.strip():
            q['explanation'] = {'zh': clean_text(expl)}

    # Check for answer leaked in question
    full_q = (q.get('question', {}).get('zh', '') if isinstance(q.get('question'), dict) else '') + ' ' + \
             (q.get('scenario', {}).get('zh', '') if isinstance(q.get('scenario'), dict) else '')
    leaked = extract_answer_from_text(full_q)
    if leaked:
        q['correctAnswer'] = leaked
        # Remove the leaked answer from text
        for key in ['question', 'scenario']:
            if isinstance(q.get(key), dict):
                txt = q[key].get('zh', '')
                txt = re.sub(r'正确答案[是为：:]\s*[A-Da-d]', '', txt)
                txt = re.sub(r'答案[是为：:]\s*[A-Da-d]', '', txt)
                txt = re.sub(r'故选[择]?\s*[A-Da-d]', '', txt)
                txt = re.sub(r'\s+', ' ', txt).strip()
                q[key]['zh'] = txt

    # Clean option text
    if q.get('options'):
        for opt in q['options']:
            if isinstance(opt.get('text'), dict):
                raw = opt['text'].get('zh', '')
                opt['text']['zh'] = clean_text(raw)
            elif isinstance(opt.get('text'), str):
                opt['text'] = {'zh': clean_text(opt['text'])}

    # Mark cleaned
    cleaned += 1

# Remove garbled questions
bank = [q for q in bank if not (
    is_garbled(q.get('question',{}).get('zh','') if isinstance(q.get('question'),dict) else '') and
    is_garbled(q.get('scenario',{}).get('zh','') if isinstance(q.get('scenario'),dict) else '')
)]
removed = 2800 - len(bank)

# Write back
with open('all-bank.json', 'w', encoding='utf-8') as f:
    json.dump(bank, f, ensure_ascii=False, indent=2)

print(f'Cleaned: {cleaned}, Removed: {removed}, Total after: {len(bank)}')
