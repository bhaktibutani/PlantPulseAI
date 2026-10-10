export interface SampleSpecimen {
  id: string;
  name: {
    en: string;
    gu: string;
    hi: string;
  };
  cropType: string;
  expectedCondition: string;
  description: {
    en: string;
    gu: string;
    hi: string;
  };
  category: 'disease' | 'healthy' | 'pest' | 'invalid';
  dataUrl: string;
}

export const SAMPLE_SPECIMENS: SampleSpecimen[] = [
  {
    id: 'specimen-tomato-early-blight',
    name: {
      en: 'Tomato Leaf — Concentric Target Spots',
      gu: 'ટામેટાંનું પાન — એકાગ્ર વર્તુળાકાર ભૂરા ડાઘ (પ્રારંભિક ઝુલસા રોગ)',
      hi: 'टमाटर की पत्ती — संकेंद्रित भूरे धब्बे (अगेती झुलसा रोग)',
    },
    cropType: 'Tomato',
    expectedCondition: 'Early Blight (Alternaria solani)',
    description: {
      en: 'Foliage showing dark brown circular lesions with concentric rings and chlorotic halos.',
      gu: 'પાંદડા પર પીળી કિનારીવાળા કથ્થઈ ગોળ ડાઘ દેખાઈ રહ્યા છે.',
      hi: 'पत्तियों पर पीले घेरे के साथ भूरे गोल धब्बे दिखाई दे रहे हैं।',
    },
    category: 'disease',
    dataUrl: 'data:image/png;base64,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',
  },
  {
    id: 'specimen-cotton-healthy',
    name: {
      en: 'Cotton Leaf — High Vitality Foliage',
      gu: 'કપાસનું પાન — સંપૂર્ણ તંદુરસ્ત પાંદડું',
      hi: 'कपास की पत्ती — पूर्णतः स्वस्थ हरी पत्ती',
    },
    cropType: 'Cotton',
    expectedCondition: 'Healthy Plant (Gossypium hirsutum)',
    description: {
      en: 'Vibrant green cotton leaf with clean margins and uniform healthy turgor.',
      gu: 'કોઈપણ જીવાત કે રોગ વિનાનું સ્વચ્છ અને ચમકદાર લીલું કપાસનું પાન.',
      hi: 'बिना किसी कीट या रोग के साफ और चमकदार हरी कपास की पत्ती।',
    },
    category: 'healthy',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAGOUlEQVR4nO3cTZITSRCEUU4xS/bsZ8d55ip9Gu7GFVhoTNbWQlJVVni4e6SbfYsZkKqyy5/x0zR8+/7jZ0rlfaOfII0ssBKkwEqQAitBCqwEKbASpMBKkAIrQQqsBCmwEqTASpACK0EKrAQpsBKkwEqQAitBCqwEKbASpMBKkALrRB+/f9HP4FJg/d8///37uo/fv269fSX9Y1FoX1hvfSzDirPtYJ01UQJrT2RbwLpCoRbWPsImwyoRAII1XthAWLXDo2FNFTYKFmjyHljDeA2BBR27E9YYXvawGmbuhzWAlzGstoFZsKx5WcJqnpYLy5SXGSzKqAqw7Hg5wSIuKgLLyJYHLO6WUrBceBnAoq8oCEvfljQs+njKsMR56cKib2YBS9aWKCz6WkawNG0pwqLvZAdL0JYcLPpCprDUbAnBog/jDkuKlwos+h5jYInYkoBlsZYRLIW/psaH5TKY3Tm3hmW0meMhN4XlNZvpCXeHpb+c6fG2g2U3nu/ZNoLluJ/1wbaAZTqh+6mGw/JdccCRxsKyHnLGeQJLbssZhxkIy33OMScZBWvAopOOEVhCo046wxBYUs80B+ixBYcl+2Rz98CSWHferY1hGT3lPe8bWPyNR97UEpb1E9/njoFFXnrq7cxgDXv6g+8FsuUNq3ODeTe6ZwOr7Yl0LjHpLo8FFm2PGbd4lgGs/ofSs4r79d8WWJxtfC9+MGlYxOeCXsjxymcLLMJOXpddK7AIa7lc80qisOjPBbqZ/gVLCqzu5ZSvVlhgde+neany5GDRnwh6RbXr4Aqs1i11LoIusFoXVbhCT0Kw6M+iYVfu25sLrL51We+lFFh9G/e/kVhgrbS2dOe76EnAoj+FhRb27nmLToG12NnV0a9XK7DWO7U97sWaBdaljgtAvFK5wLraQQe1L9OPDIv+8Zd0REPVa4wKrILemrj+ArsCq6bXMq58r2mBVdYLH2vfZV1gVfZMydlvH1BgFfdXK8e/cUyBVd+jmCPfMqzAgvTFzev/HVlgofqs59l/Dy6wgN0NPUY/G7rAwranqsDqaENVTFj0j7yz3VTdyo9Y2PIjVmDVl19jBVZ9+V1hYNWXz2MFVn35zHtg1Zc/Kwys+vLVDbcCq7J8Pda9wCorX0H6ucCqKV/z/qXAKih/S+exwLraERNVrzGKCWuArYMaal+m30UVu8M67gDxSuUCa71TAnAv1iywFju7Pfr1agXWSgur97xFJz4sO1tre3e+i951EtvBWl66/43EAqtvY9Z7KQVW37rctzenAkvf1vVdFa7QU4mHLWCVLKpzEXSB1bql2nVwacHStFW4oualyqvCMBlW7X7KVysssLqX079gSYqwdGwhNnO55pUKJQyEBVrL67JrBRZhJ8crn00XFtcWdCHfix+slsEcWOht3K//NnVYFFsNq8y4xbPKDUyA1bPHpLs85gGr01bbEvNudA8BwBtW5wZT72UGq8FW89OfejvQ+q6w+n++mHpHP1g4W5Rf4Y68KW56P1is3zeNvK8rrHJbxM/0zLs1dHcnWNzPTc+7uzesKlv0P/EYdgD06B2wrtuijzrsDA2LG8BSWHTYMebAWrYlMuekk/TM3QdrwZbOlmMO07a1LiypIcecZyas47bUVpxxpM6hu2EdsSU44YBTNa9MgPXaluZ+7gfrn5gD65kt2fGsz0bZlwbr0Zbycr7HY42rAkt8Nt8T7gjrbkt/M9NDEpclw/r+46fFYC6wPp+TOysf1s0WfY8xsG5HpW8qAUvhH32YBIu+phAsfVsusOg7ysES56UPi76dNCxZW+Kw6KsZwNK0pQyLvpcNLEFbsrDoS5nBUrOlCYu+kSUsKV5qsOi72MMSsSUFi77IEFgKvERg0VcYCGvwv5w7TJUfLCIvLiz6M98CFoUXCxb9OW8Hq5lXPyz6s90aVhuvTlj053m9IbBuDYBFf4ZVjYJ1yxQW/bnVNhDWPQtY9KcEajKse4Kw6M8E3Raw7tFh0Z9AW3vB+lwbLPpHSmlfWF8qhEX/WBQKrBMp/LUqlwIrQQqsBCmwEqTASpACK0EKrAQpsBKkwEqQAitBCqwEKbASpMBKkAIrQQqsBCmwEqTASpACK0EKrAQpsBKkP9OsnCkHnW8uAAAAAElFTkSuQmCC',
  },
  {
    id: 'specimen-chilli-leaf-curl',
    name: {
      en: 'Chilli Leaf — Upward Curling & Crinkling',
      gu: 'મરચાંનું પાન — પાંદડાં વળી જવા',
      hi: 'मिर्च की पत्ती — पत्तियों का मुड़ना',
    },
    cropType: 'Chilli',
    expectedCondition: 'Chilli Leaf Curl Virus (Begomovirus)',
    description: {
      en: 'Severe upward cupping of leaves typical of whitefly vector transmission.',
      gu: 'મરચાંના પાન ઉપર તરફ વળી ગયા છે અને કિનારીઓ સંકોચાઈ ગઈ છે.',
      hi: 'मिर्च की पत्तियां ऊपर की ओर मुड़ गई हैं।',
    },
    category: 'disease',
    dataUrl: 'data:image/png;base64,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',
  },
  {
    id: 'specimen-rose-powdery-mildew',
    name: {
      en: 'Rose Foliage — White Powdery Coating',
      gu: 'ગુલાબનું પાન — સફેદ પાવડરી ફૂગ',
      hi: 'गुलाब की पत्ती — सफेद चूर्ण जैसी फफूंद',
    },
    cropType: 'Rose',
    expectedCondition: 'Powdery Mildew (Podosphaera pannosa)',
    description: {
      en: 'Tender rose leaves covered in white powdery fungal mycelium.',
      gu: 'પાંદડા પર સફેદ પાવડર જેવી ફૂગની છારી જામી ગઈ છે.',
      hi: 'पत्तियों पर सफेद पाउडर जैसी फफूंद जमी हुई है।',
    },
    category: 'disease',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAEqUlEQVR4nO3UwW3cYAwFYVeSg285uILUkf6ryD2AFRhYw4a1sbhDPg4xBQj/+6CnHz9/mV3eE/4FFpmwrCRhWUnCspKEZSUJy0oSlpUkLCtJWFaSsKwkYVlJwrKShGUlCctKEtYdPf9+wb9hSsK66fn3y3fCv79P22F9U5LOPmsprFJPClsH68GeNgvbAgsntY1XPiyc0U5eybBwOpt5ZcLCucgrDRZORF5HUbBwGdp6KwQWDkJe70qAhTvQVhosfH55BcLCV9dWICx8b20FwsKX1lYaLHxgeQXCwnftEL5CGix80T7hW+TAwrfsFr5IAix8xZ7huwgrM3yX2bDw/TqHrzMVFr5c//CN5sHCN5sSvtQkWPhas8L3mgEL32li+GrCygxfrTssfKG54dv1hYVvMz18wY6w8FUywncUVmb4jr1g4Xskha/ZBRa+RF74psLKDN+Uh4VvkJqw+A0iWw0Lf/3shGXCUtWohGXCUtWohPXQ/txz+NcKq7uquzzFCBNWX1Kjea2ANZrUXF7CmqFqnK1wWDGkJvIS1iRVg2wJa5iqKbZiYQWr0lY4LFDVCFvCGqnqOFzPLlgPeDVa1L/D9XSwlQOL5nRzuB5hBao6Dge0Alb1Y9GKPjgcEGsrARZN6NPDAQlLWMJqBovG88XhhpJhlb4RLeeLww1RtoRVezggYQWqOg43JCxhCauBKmF1tiWs8sMBCUtYwhLW6cMBCUtYwhLW6cMBBcKqfhrazKnDASG2hFV+uB5hCUtYwjp9uB5hCUtYwjp9uB5hCUtYPWD1t4XTEZawhCWs04fTEVagLdyNsIQlrH6wetrC0QhLWMJqqaqhLVwMbivkj9XKFm4FVyWskjv/JcKaAauPrXtPWN1hzbWF8BLWFlsP5iUsbQmrByxtCUteH5+wWsPSlrDk9cEJqzusubyENQDW/wnDUQprDKxqi8ISVndVdbamwkqyRbu6Hlbp7sKaoeo4YQmr5IQlrJITVhQsmtPNCUtYJSesHFu0pZsboUpYwhKWsF5PWMIqOWHl2KIt3dwIVcISlrCE9XrCElbJCSvHFm3p5kaoEpawhCWs1xOWtq6/KaqEJSxhCUtY2lquSljCElaDRqsKhzXa1mhYD15ZWANsXfLl+bC0Fa9KWN1tXfXBW2BpK1uVsPrauvA7d8HSVrAqYXW0de3nbYQVY+sqXpd/FbissFrwKvqevbDybN0lrPQb2FmFFdt2WNrKUyWs2PBNW8DSVpiqRrC0laRKWIHhO7aDpa0YVe1gaStDVUdY2gpQJayc8NUGwNLWdFV9YWlrtKrWsLQ1V1V3WNoaqmoALG1NVCWsweG7jIelrXGqxsDS1ixVk2Bpa5CqYbC0hb9/LKy1vPA3XwFrmy38tRfB2mMLf+d1sDbYwl94KaxgXvirCivQFv6e3y8E1hEOQlJvRcGabgt/vQtLg3WEE9lM6igT1hHOZSepo2RYRzidbaSO8mEd4Yz2kDraAutIUg9rF6y39FTdUlhv6amo7bDepaSrEtYdSed8wrKShGUlCctKEpaVJCwrSVhWkrCsJGFZScKykoRlJQnLShKWlSQsK0lYVtJf+N3XcWt3RNgAAAAASUVORK5CYII=',
  },
  {
    id: 'specimen-non-plant-invalid',
    name: {
      en: 'Non-Plant Test Object (Validates AI Rejection)',
      gu: 'બિન-વનસ્પતિ ચકાસણી (AI અસ્વીકાર પ્રદર્શન)',
      hi: 'गैर-पौधा परीक्षण वस्तु (AI अस्वीकृति परीक्षण)',
    },
    cropType: 'Other',
    expectedCondition: 'Not a plant (Image validation rejection test)',
    description: {
      en: 'A ceramic red coffee mug to verify that PlantPulse AI correctly rejects non-plant images.',
      gu: 'ચકાસો કે પ્લાન્ટપલ્સ એઆઈ વનસ્પતિ સિવાયની વસ્તુઓને તરત ઓળખીને અસ્વીકાર કરે છે.',
      hi: 'जांचें कि प्लांटपल्स एआई पौधों के अलावा अन्य वस्तुओं को पहचानकर अस्वीकार करता है।',
    },
    category: 'invalid',
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAACtElEQVR4nO3SsU0DABAEQRfi2P2n1EBMRkInpBTg1fOvkaaAk24fn18/8HaP8QWcJCwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiLxT8P6fr34a/wRYd00/oiwbhp/RFg3jT8irJvGHxHWTeOPCOum8UeEddP4I8K6afwRYd00/oiwbhp/RFg3jT8irJvGHxHWTeOPCOum8UeEddP4I8K6afwRYd00/oiwbhp/RFg3jT8irJs+ns93ERbCEpawhLWRsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLWHsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLWHsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLWHsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLWHsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLWHsIQlLGHtISxhCUtYewhLWMIS1h7CEpawhLXH+CPCumn8EWHdNP6IsG4af0RYN40/Iqybxh8R1k3jjwjrpvFHhHXT+CPCumn8EWHdNP6IsG4af0RYN40/Iqybxh8R1k3jjwjrpvFHhHXT+CPCumn8EWHdNP6IsG4af+RIWGwnLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIiEsEsIiISwSwiIhLBLCIvELXXrv/YacS78AAAAASUVORK5CYII=',
  },
];
