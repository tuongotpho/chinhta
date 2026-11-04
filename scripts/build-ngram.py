#!/usr/bin/env python
"""Dựng mô hình cặp âm tiết cho luật R8 từ dữ liệu mở của Wikimedia.

Chỉ lưu thống kê tần suất, không lưu văn bản. Nguồn và giấy phép ghi tại data/NGUON-DU-LIEU.md.

Cách chạy: python -I -X utf8 scripts/build-ngram.py public/assets/ngram-v2.bin
"""
import array
import bz2
import collections
import html
import json
import math
import os
import re
import struct
import sys
import time
import unicodedata
import urllib.request

# Tải về data/ngoai/wikimedia/ từ https://dumps.wikimedia.org/<tên>/latest/<tên>-latest-pages-articles.xml.bz2
# và kaikki-vi.jsonl từ https://kaikki.org/dictionary/Vietnamese/kaikki.org-dictionary-Vietnamese.jsonl
SOURCES = ['viwiki', 'viwikisource', 'viwikibooks', 'viwiktionary']
DUMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ngoai', 'wikimedia')
MIN_UNIGRAM = 30      # Từ vựng: âm tiết xuất hiện ít nhất ngần này lần
MAX_PAIRS = 1800000   # Giới hạn số cặp để tệp tải về không quá nặng; ngưỡng đếm tự chọn theo số này
MIN_BIGRAM_STEPS = (3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 48)
PRUNE_AT = 3500000    # Máy 6,8 GB RAM: quá số cặp này thì bỏ cặp đếm thấp, chỉ mất cặp rất hiếm
ID_BITS = 22
DICT_COUNT = 5        # Từ có trong từ điển mở được cộng thêm để luôn coi là có thật
MAX_SYLLABLE_LEN = 7
LETTERS = 'a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'
WORD = re.compile(f'[{LETTERS}]+')
SPLIT = re.compile(r'[.!?;:,()\n\[\]"“”|=/]+')


def clean(text):
    for _ in range(2):
        text = re.sub(r'\{\{[^{}]*\}\}', ' ', text)
    text = re.sub(r'<ref[^>]*>.*?</ref>', ' ', text, flags=re.S)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\[\[(?:Tập tin|Hình|File|Thể loại|Category)[^\]]*\]\]', ' ', text, flags=re.I)
    text = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', text)
    text = re.sub(r'https?://\S+', ' ', text)
    return re.sub(r"'{2,}|={2,}|\{\||\|\}|^[|!*#:;].*$", ' ', text, flags=re.M)


def word_id(ids, word):
    return ids.setdefault(word, len(ids))


def count(text, uni, bi, ids):
    for seg in SPLIT.split(text):
        previous = None
        for w in WORD.findall(seg.lower()):
            if len(w) > MAX_SYLLABLE_LEN:
                previous = None
                continue
            uni[w] += 1
            current = word_id(ids, w)
            if previous is not None:
                key = (previous << ID_BITS) | current
                bi[key] = bi.get(key, 0) + 1
            previous = current


def prune(bi):
    limit = 1
    while len(bi) > PRUNE_AT * 0.7:
        for key in [k for k, c in bi.items() if c <= limit]:
            del bi[key]
        limit += 1


def read_source(name, uni, bi, ids, dict_words):
    path = os.path.join(DUMP_DIR, f'{name}.xml.bz2')
    pages, buf = 0, ''
    with bz2.open(path, 'rt', encoding='utf8', errors='ignore') as fh:
        while True:
            chunk = fh.read(1 << 22)
            if not chunk:
                break
            parts = (buf + chunk).split('</page>')
            buf = parts.pop()
            for page in parts:
                if '<ns>0</ns>' not in page or '#REDIRECT' in page or '#đổi' in page:
                    continue
                # Bài về loài sinh vật do máy sinh hàng loạt, chỉ làm lệch thống kê
                if 'Bảng phân loại' in page or 'Taxobox' in page:
                    continue
                if name == 'viwiktionary':
                    title = re.search(r'<title>(.*?)</title>', page)
                    if title and '{{-vie-}}' in page:
                        dict_words.add(unicodedata.normalize('NFC', html.unescape(title.group(1))).lower())
                found = re.search(r'<text[^>]*>(.*?)</text>', page, re.S)
                if found:
                    pages += 1
                    body = html.unescape(clean(html.unescape(found.group(1))))
                    count(unicodedata.normalize('NFC', body), uni, bi, ids)
                    if len(bi) > PRUNE_AT:
                        prune(bi)
                    if pages % 100000 == 0:
                        print(f'  {name}: {pages} trang, {len(bi)} cặp', flush=True)
    return pages


def main(out):
    uni, bi, ids, dict_words = collections.Counter(), {}, {}, set()
    for name in SOURCES:
        started = time.time()
        pages = read_source(name, uni, bi, ids, dict_words)
        print(f'{name}: {pages} trang, {sum(uni.values())} âm tiết cộng dồn, {time.time() - started:.0f} giây', flush=True)

    # Mục từ tiếng Việt của Wiktionary tiếng Anh, bản trích từ kaikki.org
    with open(os.path.join(DUMP_DIR, 'kaikki-vi.jsonl'), encoding='utf8') as fh:
        for line in fh:
            try:
                entry = json.loads(line)
            except ValueError:
                print('CẢNH BÁO: tệp kaikki chưa đầy đủ, chỉ dùng phần đã đọc được', flush=True)
                break
            if entry.get('lang_code') == 'vi' and entry.get('word'):
                dict_words.add(unicodedata.normalize('NFC', entry['word']).lower())

    # Viet74K của Hồ Ngọc Đức (GPL), tải từ https://github.com/duyet/vietnamese-wordlist
    with open(os.path.join(DUMP_DIR, '..', 'Viet74K.txt'), encoding='utf8') as fh:
        for line in fh:
            dict_words.add(unicodedata.normalize('NFC', line.strip()).lower())

    # Từ trong từ điển mở luôn được giữ, kể cả khi ít gặp trong các bài viết
    keep = set()
    for word in dict_words:
        syllables = word.split()
        if len(syllables) >= 2 and all(WORD.fullmatch(x) for x in syllables):
            for a, b in zip(syllables, syllables[1:]):
                uni[a] += 1
                uni[b] += 1
                key = (word_id(ids, a) << ID_BITS) | word_id(ids, b)
                bi[key] = bi.get(key, 0) + DICT_COUNT
                keep.add(key)
    print(f'từ điển mở: {len(dict_words)} mục từ tiếng Việt, {len(keep)} cặp giữ lại', flush=True)

    # Cặp sai đã biết không được coi là tiếng Việt đúng dù có xuất hiện trong kho
    here = os.path.dirname(os.path.abspath(__file__))
    wrong = []
    with open(os.path.join(here, '..', 'data', 'cum-tu-nham-lan.json'), encoding='utf8') as fh:
        for pair in json.load(fh):
            syllables = pair['sai'].lower().split()
            wrong += zip(syllables, syllables[1:])
    with open(os.path.join(here, '..', 'data', 'cap-am-tiet-sai.txt'), encoding='utf8') as fh:
        for line in fh:
            parts = line.split()
            if len(parts) == 2 and not line.startswith('#'):
                wrong.append((parts[0], parts[1]))
    for a, b in wrong:
        if a in ids and b in ids:
            key = (ids[a] << ID_BITS) | ids[b]
            bi.pop(key, None)
            keep.discard(key)

    vocab = sorted((w for w, c in uni.items() if c >= MIN_UNIGRAM and len(w) <= MAX_SYLLABLE_LEN), key=lambda w: -uni[w])
    if len(vocab) >= 1 << 15:
        vocab = vocab[:(1 << 15) - 1]
    new_ids = {ids[w]: i for i, w in enumerate(vocab)}
    mask = (1 << ID_BITS) - 1
    rows = [(k, c) for k, c in bi.items() if (k >> ID_BITS) in new_ids and (k & mask) in new_ids]
    min_bigram = next(t for t in MIN_BIGRAM_STEPS if sum(1 for _, c in rows if c >= t) <= MAX_PAIRS)
    print(f'ngưỡng cặp: {min_bigram}', flush=True)
    pairs = sorted(((new_ids[k >> ID_BITS] << 15) | new_ids[k & mask], c)
                   for k, c in rows if c >= min_bigram or k in keep)
    keys = array.array('I', (k for k, _ in pairs))
    quant = array.array('H', (min(65535, round(math.log2(c) * 1024)) for _, c in pairs))
    vocab_bytes = '\n'.join(vocab).encode('utf8')
    vocab_bytes += b'\0' * (-len(vocab_bytes) % 4)
    with open(out, 'wb') as fh:
        fh.write(b'NGR1')
        fh.write(struct.pack('<IIId', len(vocab), len(pairs), len(vocab_bytes), float(sum(uni.values()))))
        fh.write(b'\0' * 4)
        fh.write(vocab_bytes)
        fh.write(array.array('I', (uni[w] for w in vocab)).tobytes())
        fh.write(keys.tobytes())
        fh.write(quant.tobytes())
    print(f'từ vựng {len(vocab)}, cặp {len(pairs)}, tệp {os.path.getsize(out) / 1048576:.1f} MB')


if __name__ == '__main__':
    main(sys.argv[1])
