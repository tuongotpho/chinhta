#!/usr/bin/env python
"""Dựng mô hình cặp âm tiết cho luật R8 từ dữ liệu mở của Wikimedia.

Chỉ lưu thống kê tần suất, không lưu văn bản. Nguồn và giấy phép ghi tại data/NGUON-DU-LIEU.md.

Cách chạy: python -I -X utf8 scripts/build-ngram.py public/assets/ngram-v1.bin
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

SOURCES = [
    ('wikipedia', 'https://dumps.wikimedia.org/viwiki/latest/viwiki-latest-pages-articles-multistream1.xml-p1p832082.bz2'),
    ('wikisource', 'https://dumps.wikimedia.org/viwikisource/latest/viwikisource-latest-pages-articles.xml.bz2'),
]
MIN_UNIGRAM = 30      # Từ vựng: âm tiết xuất hiện ít nhất ngần này lần
MIN_BIGRAM = 3        # Cặp hiếm hơn ngưỡng này bị bỏ để giảm cỡ tệp
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


def count(text, uni, bi):
    for seg in SPLIT.split(text):
        words = WORD.findall(seg.lower())
        for i, w in enumerate(words):
            uni[w] += 1
            if i:
                bi[(words[i - 1], w)] += 1


def read_source(url, uni, bi):
    req = urllib.request.Request(url, headers={'User-Agent': 'soat-chinh-ta-ngram/1.0'})
    resp = urllib.request.urlopen(req, timeout=120)
    dec, buf, pages = bz2.BZ2Decompressor(), '', 0
    while True:
        chunk = resp.read(1 << 18)
        if not chunk:
            break
        while chunk:
            data = dec.decompress(chunk)
            buf += data.decode('utf8', 'ignore')
            if dec.eof:
                chunk, dec = dec.unused_data, bz2.BZ2Decompressor()
            else:
                chunk = b''
        parts = buf.split('</page>')
        buf = parts.pop()
        for page in parts:
            if '<ns>0</ns>' not in page or '#REDIRECT' in page or '#đổi' in page:
                continue
            found = re.search(r'<text[^>]*>(.*?)</text>', page, re.S)
            if found:
                pages += 1
                body = html.unescape(clean(html.unescape(found.group(1))))
                count(unicodedata.normalize('NFC', body), uni, bi)
    return pages


def main(out):
    uni, bi = collections.Counter(), collections.Counter()
    for name, url in SOURCES:
        started = time.time()
        pages = read_source(url, uni, bi)
        print(f'{name}: {pages} trang, {sum(uni.values())} âm tiết cộng dồn, {time.time() - started:.0f} giây')

    # Cặp sai đã biết không được coi là tiếng Việt đúng dù có xuất hiện trong kho
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, '..', 'data', 'cum-tu-nham-lan.json'), encoding='utf8') as fh:
        for pair in json.load(fh):
            syllables = pair['sai'].lower().split()
            for a, b in zip(syllables, syllables[1:]):
                bi.pop((a, b), None)
    with open(os.path.join(here, '..', 'data', 'cap-am-tiet-sai.txt'), encoding='utf8') as fh:
        for line in fh:
            parts = line.split()
            if len(parts) == 2 and not line.startswith('#'):
                bi.pop((parts[0], parts[1]), None)

    vocab = sorted((w for w, c in uni.items() if c >= MIN_UNIGRAM and len(w) <= MAX_SYLLABLE_LEN), key=lambda w: -uni[w])
    if len(vocab) >= 1 << 15:
        vocab = vocab[:(1 << 15) - 1]
    ids = {w: i for i, w in enumerate(vocab)}
    pairs = sorted(((ids[a] << 15) | ids[b], c) for (a, b), c in bi.items() if c >= MIN_BIGRAM and a in ids and b in ids)
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
